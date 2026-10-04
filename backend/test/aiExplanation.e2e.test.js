import "./setupEnv.js";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import express from "express";
import jwt from "jsonwebtoken";
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

const { default: exerciseAttemptRoutes } = await import("../src/routes/exerciseAttempt.routes.js");
const { default: aiRoutes } = await import("../src/routes/ai.routes.js");

test("authenticated attempt explanation persists, caches, and stays private over HTTP", async (t) => {
    let server;
    let exercise;
    let subcategory;
    let category;
    let level;
    let explanationAttemptId;
    const users = [];
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

            if (explanationAttemptId) {
                await AttemptExplanation.destroy({ where: { attempt_id: explanationAttemptId } });
            }
            if (users.length > 0) {
                const userIds = users.map((user) => user.id);
                await AiUsageDaily.destroy({ where: { user_id: userIds } });
                await UserExerciseAttempt.destroy({ where: { user_id: userIds } });
                await User.destroy({ where: { id: userIds } });
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
    level = await Level.create({ name: `AI E2E B1 ${suffix}` });
    category = await Category.create({ name: `AI E2E Category ${suffix}` });
    subcategory = await Subcategory.create({
        name: `AI E2E Subcategory ${suffix}`,
        description: "Deterministic explanation integration fixture",
        category_id: category.id
    });
    exercise = await Exercise.create({
        type: "multiple_choice_cloze",
        title: `AI E2E practice item ${suffix}`,
        question_text: "Every morning I ______ the bus to college.",
        options: ["catch", "do", "make", "go"],
        correct_answer: "catch",
        explanation_rule: "catch the bus is the expected collocation for daily transport.",
        content: { exam: "B1 Preliminary", part: 1, level: "B1" },
        level_id: level.id,
        subcategory_id: subcategory.id
    });

    const createLearner = async (label) => {
        const user = await User.create({
            name: `AI E2E ${label}`,
            username: `ai-e2e-${label}-${suffix}`,
            email: `ai-e2e-${label}-${suffix}@ceferly.test`,
            password_hash: "not-used-in-this-test",
            subscription_role: "free",
            coins: 0,
            hearts: 5
        });
        users.push(user);
        return user;
    };

    const owner = await createLearner("owner");
    const otherLearner = await createLearner("other");
    const ownerToken = jwt.sign({ id: owner.id, email: owner.email }, process.env.JWT_SECRET);
    const otherToken = jwt.sign({ id: otherLearner.id, email: otherLearner.email }, process.env.JWT_SECRET);

    const app = express();
    app.use(express.json());
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
        const requestedUrl = typeof input === "string" ? input : input.url;
        if (requestedUrl.startsWith(`http://127.0.0.1:${address.port}/`)) {
            return originalFetch(input, options);
        }
        externalRequests.push(requestedUrl);
        throw new Error("External requests are disabled in this test");
    };

    const attemptResponse = await fetch(`${apiUrl}/exercises/${exercise.id}/attempt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ userAnswer: "do", totalGaps: 1 })
    });
    assert.equal(attemptResponse.status, 201);
    const attemptResult = await attemptResponse.json();
    explanationAttemptId = attemptResult.attempt.id;

    const explanationUrl = `${apiUrl}/attempts/${explanationAttemptId}/explain`;
    const firstExplanationResponse = await fetch(explanationUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(firstExplanationResponse.status, 200);
    const firstExplanation = await firstExplanationResponse.json();
    assert.equal(firstExplanation.cached, false);
    assert.equal(firstExplanation.explanation, exercise.explanation_rule);

    const storedExplanation = await AttemptExplanation.findOne({
        where: { attempt_id: explanationAttemptId }
    });
    assert.ok(storedExplanation);
    assert.equal(storedExplanation.explanation, exercise.explanation_rule);

    const today = new Date().toISOString().split("T")[0];
    const usageBeforeCacheHit = await AiUsageDaily.findOne({
        where: { user_id: owner.id, date: today }
    });
    assert.equal(usageBeforeCacheHit?.used, 1);

    const cachedExplanationResponse = await fetch(explanationUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(cachedExplanationResponse.status, 200);
    const cachedExplanation = await cachedExplanationResponse.json();
    assert.equal(cachedExplanation.cached, true);
    assert.equal(cachedExplanation.explanation, exercise.explanation_rule);

    const usageAfterCacheHit = await AiUsageDaily.findOne({
        where: { user_id: owner.id, date: today }
    });
    assert.equal(usageAfterCacheHit?.used, 1);
    assert.equal(await AttemptExplanation.count({ where: { attempt_id: explanationAttemptId } }), 1);

    const privateExplanationResponse = await fetch(explanationUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${otherToken}` }
    });
    assert.equal(privateExplanationResponse.status, 404);
    assert.equal((await privateExplanationResponse.json()).message, "Attempt not found");
    assert.deepEqual(externalRequests, []);
});
