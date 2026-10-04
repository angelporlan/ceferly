import "./setupEnv.js";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { sequelize } from "../src/config/db.js";
import "../src/models/index.js";
import { User } from "../src/models/User.js";
import { UserExerciseAttempt } from "../src/models/UserExerciseAttempt.js";
import { Exercise } from "../src/models/Exercise.js";
import { Subcategory } from "../src/models/Subcategory.js";
import { Level } from "../src/models/Level.js";
import { Category } from "../src/models/Category.js";

const migrationUrl = new URL(
    "../prisma/migrations/20261004174400_reconcile_b1_uoe_content_143/migration.sql",
    import.meta.url
);

const legacyExercises = [
    {
        title: "B1 Preliminary Use of English Part 4 — Photography club (#3)",
        questionText: "Photography ______ Marta.",
        oldAnswer: "is of interest to / interests",
        oldRule: "be interested in ⇔ be of interest to / the verb interest.",
        newQuestionText: "Photography ______ Marta.",
        newAnswer: "is of interest to",
        newRule: "be interested in ⇔ be of interest to; the four-word answer keeps the supplied keyword.",
        keyword: "INTEREST"
    },
    {
        title: "B1 Preliminary Use of English Part 4 — Cancelled match (#5)",
        questionText: "They cancelled the match ______ it was raining.",
        oldAnswer: "because",
        oldRule: "because of + noun ⇔ because + clause.",
        newQuestionText: "The match ______ the rain.",
        newAnswer: "was cancelled because of",
        newRule: "Use the passive was cancelled and because of + noun; the four-word transformation keeps the original meaning.",
        keyword: "BECAUSE"
    }
];

const exerciseState = (exercise) => ({
    id: exercise.id,
    title: exercise.title,
    questionText: exercise.question_text,
    correctAnswer: exercise.correct_answer,
    explanationRule: exercise.explanation_rule
});

const attemptState = (attempt) => ({
    id: attempt.id,
    exerciseId: attempt.exercise_id,
    userAnswer: attempt.user_answer,
    totalGaps: attempt.total_gaps,
    correctGaps: attempt.correct_gaps,
    isFullyCorrect: attempt.is_fully_correct,
    score: attempt.score
});

test("versioned UoE reconciliation is idempotent and preserves exercise attempts", async () => {
    const migrationSql = await readFile(migrationUrl, "utf8");
    const statements = migrationSql
        .split(/;\s*(?:\r?\n|$)/)
        .map((statement) => statement.trim())
        .filter(Boolean);
    assert.equal(statements.length, legacyExercises.length);

    let transaction;
    try {
        transaction = await sequelize.transaction();
        const suffix = randomUUID();
        const [level] = await Level.findOrCreate({
            where: { name: "B1" },
            transaction
        });
        const category = await Category.create({ name: `UoE migration ${suffix}` }, { transaction });
        const subcategory = await Subcategory.create({
            name: "Key Word Transformation",
            description: "Transactional content migration fixture",
            category_id: category.id
        }, { transaction });
        const user = await User.create({
            name: "Migration test learner",
            username: `uoe-migration-${suffix}`,
            email: `uoe-migration-${suffix}@ceferly.test`,
            password_hash: "test-only",
            subscription_role: "free"
        }, { transaction });

        const exercises = [];
        const attempts = [];

        for (const legacy of legacyExercises) {
            const exercise = await Exercise.create({
                type: "key_word_transformation",
                title: legacy.title,
                question_text: legacy.questionText,
                options: [],
                correct_answer: legacy.oldAnswer,
                explanation_rule: legacy.oldRule,
                content: { exam: "B1 Preliminary", level: "B1", part: 4, keyword: legacy.keyword },
                level_id: level.id,
                subcategory_id: subcategory.id
            }, { transaction });
            exercises.push(exercise);

            const attempt = await UserExerciseAttempt.create({
                user_id: user.id,
                exercise_id: exercise.id,
                user_answer: "legacy learner answer",
                total_gaps: 1,
                correct_gaps: 0,
                is_fully_correct: false,
                score: 0
            }, { transaction });
            attempts.push(attempt);
        }

        const customizedExercise = await Exercise.create({
            type: "key_word_transformation",
            title: legacyExercises[0].title,
            question_text: legacyExercises[0].questionText,
            options: [],
            correct_answer: "teacher-authored alternative",
            explanation_rule: "Teacher customization.",
            content: { exam: "B1 Preliminary", level: "B1", part: 4, keyword: "INTEREST" },
            level_id: level.id,
            subcategory_id: subcategory.id
        }, { transaction });
        const customizedExerciseBeforeMigration = exerciseState(customizedExercise);

        const originalExerciseIds = exercises.map(({ id }) => id);
        const originalAttempts = attempts.map(attemptState);

        for (const statement of statements) {
            await sequelize.query(statement, { transaction });
        }

        for (let index = 0; index < exercises.length; index += 1) {
            await exercises[index].reload({ transaction });
            assert.equal(exercises[index].id, originalExerciseIds[index]);
            assert.equal(exercises[index].question_text, legacyExercises[index].newQuestionText);
            assert.equal(exercises[index].correct_answer, legacyExercises[index].newAnswer);
            assert.equal(exercises[index].explanation_rule, legacyExercises[index].newRule);
        }
        await customizedExercise.reload({ transaction });
        assert.deepEqual(exerciseState(customizedExercise), customizedExerciseBeforeMigration);

        const correctedExercises = exercises.map(exerciseState);
        for (const statement of statements) {
            await sequelize.query(statement, { transaction });
        }
        for (let index = 0; index < exercises.length; index += 1) {
            await exercises[index].reload({ transaction });
        }
        assert.deepEqual(exercises.map(exerciseState), correctedExercises);
        await customizedExercise.reload({ transaction });
        assert.deepEqual(exerciseState(customizedExercise), customizedExerciseBeforeMigration);

        const storedAttempts = await UserExerciseAttempt.findAll({
            where: { user_id: user.id },
            order: [["id", "ASC"]],
            transaction
        });
        assert.deepEqual(storedAttempts.map(attemptState), originalAttempts);
    } finally {
        if (transaction && !transaction.finished) await transaction.rollback();
    }
});
