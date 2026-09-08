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
