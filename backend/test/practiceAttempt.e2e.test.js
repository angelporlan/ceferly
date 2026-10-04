import "./setupEnv.js";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { sequelize } from "../src/config/db.js";
import "../src/models/index.js";
import { User } from "../src/models/User.js";
import { UserExerciseAttempt } from "../src/models/UserExerciseAttempt.js";
import { Exercise } from "../src/models/Exercise.js";
import { Level } from "../src/models/Level.js";
import { Category } from "../src/models/Category.js";
import { Subcategory } from "../src/models/Subcategory.js";
import { app } from "../src/app.js";

test("registered learner completes and persists a practice attempt over HTTP", async (t) => {
    let server;
    let user;
    let exercise;
    let subcategory;
    let category;
    let level;

    t.after(async () => {
        if (server?.listening) {
            const closed = new Promise((resolve, reject) => {
                server.close((error) => error ? reject(error) : resolve());
            });
            server.closeAllConnections?.();
            await closed;
        }

        if (user) {
            await UserExerciseAttempt.destroy({ where: { user_id: user.id } });
            await user.destroy();
        }
        if (exercise) await exercise.destroy();
        if (subcategory) await subcategory.destroy();
        if (category) await category.destroy();
        if (level?.created) await level.instance.destroy();
        await sequelize.close();
    });

    await sequelize.authenticate();

    const suffix = randomUUID();
    const [levelInstance, levelCreated] = await Level.findOrCreate({ where: { name: "B1" } });
    level = { instance: levelInstance, created: levelCreated };
    category = await Category.create({ name: `E2E Category ${suffix}` });
    subcategory = await Subcategory.create({
        name: `E2E Subcategory ${suffix}`,
        description: "Deterministic end-to-end test fixture",
        category_id: category.id
    });
    exercise = await Exercise.create({
        type: "multiple_choice_cloze",
        title: `E2E practice item ${suffix}`,
        question_text: "Every morning I ______ the bus to college.",
        options: ["catch", "do", "make", "go"],
        correct_answer: "catch",
        explanation_rule: "catch the bus is the B1 transport collocation.",
        content: { exam: "B1 Preliminary", part: 1, level: "B1" },
        level_id: level.instance.id,
        subcategory_id: subcategory.id
    });

    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    const address = server.address();
    const apiUrl = `http://127.0.0.1:${address.port}/api`;

    const registerResponse = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "E2E Learner",
            username: `e2e-${suffix}`,
            email: `e2e-${suffix}@ceferly.test`,
            password: "test-password-123"
        })
    });
    assert.equal(registerResponse.status, 200);
    const { token } = await registerResponse.json();
    assert.ok(token);
    const headers = { Authorization: `Bearer ${token}` };

    user = await User.findOne({ where: { email: `e2e-${suffix}@ceferly.test` } });
    assert.ok(user);

    const levelsResponse = await fetch(`${apiUrl}/levels`, { headers });
    assert.equal(levelsResponse.status, 200);
    const levels = await levelsResponse.json();
    assert.ok(levels.some((candidate) => candidate.name === "B1"));

    const categoriesResponse = await fetch(`${apiUrl}/categories`, { headers });
    assert.equal(categoriesResponse.status, 200);
    const categories = await categoriesResponse.json();
    const listedCategory = categories.find((candidate) => candidate.name === category.name);
    assert.ok(listedCategory?.subcategories.some((candidate) => candidate.id === subcategory.id));

    const catalogResponse = await fetch(
        `${apiUrl}/exercises?level=B1&subcategoryId=${subcategory.id}`,
        { headers }
    );
    assert.equal(catalogResponse.status, 200);
    const catalog = await catalogResponse.json();
    const listedExercise = catalog.exercises.find((candidate) => candidate.title === exercise.title);
    assert.ok(listedExercise);

    const attemptResponse = await fetch(`${apiUrl}/exercises/${listedExercise.id}/attempt`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        // This expected answer comes from the test fixture, not the catalog response.
        body: JSON.stringify({ user_answer: "catch", total_gaps: 1 })
    });
    assert.equal(attemptResponse.status, 201);
    const result = await attemptResponse.json();
    assert.equal(result.scored.isFullyCorrect, true);
    assert.equal(result.rewards.coinsDelta, 10);
    assert.equal(result.rewards.hearts, 5);

    const historyResponse = await fetch(`${apiUrl}/attempts/${result.attempt.id}`, { headers });
    assert.equal(historyResponse.status, 200);
    const history = await historyResponse.json();
    assert.equal(history.is_fully_correct, true);
    assert.equal(history.user_answer, "catch");

    await user.reload();
    assert.equal(user.coins, result.rewards.coins);
    assert.equal(user.hearts, 5);
    assert.ok(await UserExerciseAttempt.findByPk(result.attempt.id));
});
