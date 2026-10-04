import "./setupEnv.js";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import express from "express";
import { sequelize } from "../src/config/db.js";
import "../src/models/index.js";
import { User } from "../src/models/User.js";
import { UserExerciseAttempt } from "../src/models/UserExerciseAttempt.js";
import { AttemptExplanation } from "../src/models/AttemptExplanation.js";
import { AiUsageDaily } from "../src/models/AiUsageDaily.js";
import { Exercise } from "../src/models/Exercise.js";
import { Level } from "../src/models/Level.js";
import { Category } from "../src/models/Category.js";
import { Subcategory } from "../src/models/Subcategory.js";

process.env.AI_SERVER = "OpenRouter";
process.env.OPENROUTER_API_KEY = "";

const { default: authRoutes } = await import("../src/routes/auth.routes.js");
const { default: exerciseRoutes } = await import("../src/routes/exercise.routes.js");
const { default: exerciseAttemptRoutes } = await import("../src/routes/exerciseAttempt.routes.js");
const { default: aiRoutes } = await import("../src/routes/ai.routes.js");

test("registered learner reaches a persisted AI explanation through the real HTTP flow", async (t) => {
    let server;
    let user;
    let level;
    let category;
    let subcategory;
    let exercise;
    let attemptId;
    let userEmail;
    const originalFetch = globalThis.fetch;
    const externalRequests = [];

    t.after(async () => {
        try {
            if (server?.listening) {
                const closed = new Promise((resolve, reject) => {
                    server.close((error) => error ? reject(error) : resolve());
                });
                server.closeAllConnections?.();
                await closed;
            }

            if (attemptId) {
                await AttemptExplanation.destroy({ where: { attempt_id: attemptId } });
            }

            const persistedUser = user || (userEmail
                ? await User.findOne({ where: { email: userEmail } })
                : null);
            if (persistedUser) {
                await AiUsageDaily.destroy({ where: { user_id: persistedUser.id } });
                await UserExerciseAttempt.destroy({ where: { user_id: persistedUser.id } });
                await User.destroy({ where: { id: persistedUser.id } });
            }

            if (exercise) await exercise.destroy();
            if (subcategory) await subcategory.destroy();
            if (category) await category.destroy();
            if (level) await level.destroy();
        } finally {
            globalThis.fetch = originalFetch;
            await sequelize.close();
        }
    });

    await sequelize.authenticate();
    const suffix = randomUUID();
    userEmail = `full-e2e-${suffix}@ceferly.test`;
    level = await Level.create({ name: `B1 Full E2E ${suffix}` });
    category = await Category.create({ name: `Full E2E Category ${suffix}` });
    subcategory = await Subcategory.create({
        name: `Full E2E Subcategory ${suffix}`,
        description: "Integrated learning and explanation flow fixture",
        category_id: category.id
    });
    exercise = await Exercise.create({
        type: "multiple_choice_cloze",
        title: `Full E2E practice ${suffix}`,
        question_text: "Every morning I ______ the bus to college.",
        options: ["catch", "do", "make", "go"],
        correct_answer: { "1": "catch" },
        explanation_rule: "catch the bus is the expected collocation for daily transport.",
        content: { exam: "B1 Preliminary", part: 1, level: "B1" },
        level_id: level.id,
        subcategory_id: subcategory.id
    });

    const app = express();
    app.use(express.json());
    app.use("/api", authRoutes);
    app.use("/api", exerciseRoutes);
    app.use("/api", exerciseAttemptRoutes);
    app.use("/api", aiRoutes);
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    const address = server.address();
    const apiUrl = `http://127.0.0.1:${address.port}/api`;
    globalThis.fetch = async (input, options) => {
        const requestedUrl = typeof input === "string"
            ? input
            : (input instanceof URL ? input.href : input.url);
        if (requestedUrl.startsWith(`http://127.0.0.1:${address.port}/`)) {
            return originalFetch(input, options);
        }
        externalRequests.push(requestedUrl);
        throw new Error("External requests are disabled in this test");
    };

    const registrationResponse = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Integrated E2E Learner",
            username: `full-e2e-${suffix}`,
            email: userEmail,
            password: "test-password-123"
        })
    });
    assert.equal(registrationResponse.status, 200);
    const registration = await registrationResponse.json();
    assert.ok(registration.token);
    user = await User.findOne({ where: { email: userEmail } });
    assert.ok(user);

    const learnerHeaders = { Authorization: `Bearer ${registration.token}` };
    const levelsResponse = await fetch(`${apiUrl}/levels`, { headers: learnerHeaders });
    assert.equal(levelsResponse.status, 200);
    const levels = await levelsResponse.json();
    assert.ok(levels.some((item) => item.id === level.id && item.name === level.name));

    const categoriesResponse = await fetch(`${apiUrl}/categories`, { headers: learnerHeaders });
    assert.equal(categoriesResponse.status, 200);
    const categories = await categoriesResponse.json();
    const listedCategory = categories.find((item) => item.id === category.id);
    assert.ok(listedCategory);
    assert.ok(listedCategory.subcategories.some((item) => item.id === subcategory.id));

    const exerciseListUrl = new URL(`${apiUrl}/exercises`);
    exerciseListUrl.searchParams.set("level", level.name);
    exerciseListUrl.searchParams.set("subcategoryId", String(subcategory.id));
    const exercisesResponse = await fetch(exerciseListUrl, { headers: learnerHeaders });
    assert.equal(exercisesResponse.status, 200);
    const exercises = await exercisesResponse.json();
    const listedExercise = exercises.exercises.find((item) => item.id === exercise.id);
    assert.ok(listedExercise);

    const playerResponse = await fetch(`${apiUrl}/exercises/${listedExercise.id}`, {
        headers: learnerHeaders
    });
    assert.equal(playerResponse.status, 200);
    assert.equal((await playerResponse.json()).id, exercise.id);

    const attemptResponse = await fetch(`${apiUrl}/exercises/${exercise.id}/attempt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...learnerHeaders
        },
        body: JSON.stringify({ userAnswer: { "1": "never" }, totalGaps: 1 })
    });
    assert.equal(attemptResponse.status, 201);
    const attempt = (await attemptResponse.json()).attempt;
    attemptId = attempt.id;

    const resultResponse = await fetch(`${apiUrl}/attempts/${attemptId}`, {
        headers: learnerHeaders
    });
    assert.equal(resultResponse.status, 200);
    const result = await resultResponse.json();
    assert.equal(result.id, attemptId);
    assert.equal(result.feedback_summary.incorrect, 1);

    const explanationResponse = await fetch(`${apiUrl}/attempts/${attemptId}/explain`, {
        method: "POST",
        headers: learnerHeaders
    });
    assert.equal(explanationResponse.status, 200);
    const explanation = await explanationResponse.json();
    assert.equal(explanation.cached, false);
    assert.equal(explanation.explanation, exercise.explanation_rule);

    const storedExplanation = await AttemptExplanation.findOne({ where: { attempt_id: attemptId } });
    assert.ok(storedExplanation);
    assert.equal(storedExplanation.explanation, exercise.explanation_rule);
    assert.deepEqual(externalRequests, []);
});
