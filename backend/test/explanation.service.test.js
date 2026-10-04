import "./setupEnv.js";
import test from "node:test";
import assert from "node:assert/strict";
import { sequelize } from "../src/config/db.js";
import "../src/models/index.js";
import { User } from "../src/models/User.js";
import { Exercise } from "../src/models/Exercise.js";
import { Level } from "../src/models/Level.js";
import { Category } from "../src/models/Category.js";
import { Subcategory } from "../src/models/Subcategory.js";
import { AttemptExplanation } from "../src/models/AttemptExplanation.js";
import { recordExerciseAttempt } from "../src/services/attempt.service.js";
import { explainAndPersistAttempt, buildExplanationPrompt } from "../src/services/explanation.service.js";

const unique = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

test("buildExplanationPrompt includes the official rule", () => {
    const prompt = buildExplanationPrompt({
        questionText: "I ______ the bus.",
        userAnswer: "do",
        correctAnswer: "catch",
        exerciseType: "multiple_choice_cloze",
        explanationRule: "catch the bus is the collocation."
    });
    assert.match(prompt, /catch the bus is the collocation/);
    assert.match(prompt, /Cambridge/);
});

test("buildExplanationPrompt gives qualitative Writing feedback without matching the model answer", () => {
    const prompt = buildExplanationPrompt({
        questionText: "Write an article about a useful change in your town.",
        userAnswer: "Our town needs better buses because many people drive.",
        correctAnswer: { model_answer: "A possible article describing several improvements." },
        exerciseType: "essay"
    });

    assert.match(prompt, /Writing feedback/i);
    assert.match(prompt, /organization/i);
    assert.match(prompt, /do not require identical wording/i);
    assert.doesNotMatch(prompt, /Correct answer:/);
});

test("explainAndPersistAttempt stores AttemptExplanation using a stubbed model client", async (t) => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        t.diagnostic(`DB unavailable: ${error.message}`);
        throw error;
    }

    const [level] = await Level.findOrCreate({ where: { name: "B2" } });
    const [category] = await Category.findOrCreate({ where: { name: "Use of English" } });
    const [subcategory] = await Subcategory.findOrCreate({
        where: { name: "Gap Fill", category_id: category.id },
        defaults: { description: "Open Cloze" }
    });

    const exercise = await Exercise.create({
        type: "open_cloze",
        title: unique("B2 First UoE P2 test item"),
        question_text: "I can't find my keys. I ______ have left them in the café.",
        options: [],
        correct_answer: "must",
        explanation_rule: "must have + past participle is a deduction about the past.",
        level_id: level.id,
        subcategory_id: subcategory.id
    });

    const user = await User.create({
        name: "Explain Learner",
        username: unique("explainer"),
        email: `${unique("explainer")}@ceferly.test`,
        password_hash: "not-used",
        coins: 10,
        hearts: 5
    });

    const { attempt } = await recordExerciseAttempt({
        user,
        exerciseId: exercise.id,
        userAnswer: "can",
        totalGaps: 1,
        now: new Date("2026-09-08T12:00:00.000Z")
    });

    let generateCalls = 0;
    const result = await explainAndPersistAttempt({
        userId: user.id,
        attemptId: attempt.id,
        model: "stub-teacher",
        generateText: async (prompt) => {
            generateCalls += 1;
            assert.match(prompt, /must have/);
            return JSON.stringify({
                general_feedback: "Revisa la deducción.",
                explanation: "must have left is the past deduction. can have is not used this way."
            });
        }
    });

    assert.equal(result.cached, false);
    assert.ok(result.explanation.includes("must have"));
    const stored = await AttemptExplanation.findOne({ where: { attempt_id: attempt.id } });
    assert.ok(stored);
    assert.equal(stored.model, "stub-teacher");
    assert.equal(generateCalls, 1);

    const cached = await explainAndPersistAttempt({
        userId: user.id,
        attemptId: attempt.id,
        model: "stub-teacher",
        generateText: async () => {
            throw new Error("should not hit the model on cache");
        }
    });
    assert.equal(cached.cached, true);
});

test("writing feedback is persisted, cached, and advances the review status", async (t) => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        t.diagnostic(`DB unavailable: ${error.message}`);
        throw error;
    }

    const [level] = await Level.findOrCreate({ where: { name: "B2" } });
    const [category] = await Category.findOrCreate({ where: { name: "Writing" } });
    const [subcategory] = await Subcategory.findOrCreate({
        where: { name: "Essay", category_id: category.id },
        defaults: { description: "Original writing practice" }
    });
    const exercise = await Exercise.create({
        type: "essay",
        title: unique("B2 Writing test item"),
        question_text: "Write an article about a useful change in your town.",
        options: {},
        correct_answer: { model_answer: "A sample article for reference." },
        level_id: level.id,
        subcategory_id: subcategory.id
    });
    const user = await User.create({
        name: "Writing Learner",
        username: unique("writer"),
        email: `${unique("writer")}@ceferly.test`,
        password_hash: "not-used",
        coins: 0,
        hearts: 5
    });
    const answer = "Our town should have more buses. This would help people travel to work.";
    const { attempt } = await recordExerciseAttempt({
        user,
        exerciseId: exercise.id,
        userAnswer: answer,
        now: new Date("2026-10-04T12:00:00.000Z")
    });

    let generateCalls = 0;
    const generateText = async (prompt) => {
        generateCalls += 1;
        assert.match(prompt, /Our town should have more buses/);
        assert.match(prompt, /Writing feedback/i);
        return JSON.stringify({
            general_feedback: "The main idea is clear.",
            explanation: "Strength: the proposal is clear. Improve: explain how the change helps residents."
        });
    };

    const result = await explainAndPersistAttempt({
        userId: user.id,
        attemptId: attempt.id,
        model: "stub-writing-teacher",
        generateText
    });
    assert.equal(result.cached, false);
    assert.match(result.explanation, /proposal is clear/);

    const storedExplanation = await AttemptExplanation.findOne({ where: { attempt_id: attempt.id } });
    assert.ok(storedExplanation);
    await attempt.reload();
    assert.equal(attempt.grading_status, "feedback_available");

    const cached = await explainAndPersistAttempt({
        userId: user.id,
        attemptId: attempt.id,
        model: "stub-writing-teacher",
        generateText: async () => {
            throw new Error("cached writing feedback must not call the model");
        }
    });
    assert.equal(cached.cached, true);
    assert.equal(generateCalls, 1);
});
