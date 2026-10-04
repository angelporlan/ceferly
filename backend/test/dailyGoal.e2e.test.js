import "./setupEnv.js";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import express from "express";
import jwt from "jsonwebtoken";
import { sequelize } from "../src/config/db.js";
import "../src/models/index.js";
import { User } from "../src/models/User.js";

const { default: userRoutes } = await import("../src/routes/user.routes.js");

test("daily goal endpoint accepts only integer goals and leaves invalid preferences unchanged", async (t) => {
    let server;
    let user;

    t.after(async () => {
        if (server?.listening) {
            const closed = new Promise((resolve, reject) => {
                server.close((error) => error ? reject(error) : resolve());
            });
            server.closeAllConnections?.();
            await closed;
        }
        if (user) await user.destroy();
        await sequelize.close();
    });

    await sequelize.authenticate();
    const suffix = randomUUID();
    user = await User.create({
        name: "Daily goal API test",
        username: `daily-goal-${suffix}`,
        email: `daily-goal-${suffix}@ceferly.test`,
        password_hash: "not-used-in-this-test",
        daily_goal: 7
    });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

    const app = express();
    app.use(express.json());
    app.use("/api", userRoutes);
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    const url = `http://127.0.0.1:${server.address().port}/api/users/me/daily-goal`;

    const putGoal = async (body, { includeBody = true, authenticated = true } = {}) => {
        const headers = {};
        if (authenticated) headers.Authorization = `Bearer ${token}`;
        if (includeBody) headers["Content-Type"] = "application/json";
        return fetch(url, {
            method: "PUT",
            headers,
            ...(includeBody ? { body: JSON.stringify(body) } : {})
        });
    };

    for (const dailyGoal of [1, 42, 100]) {
        const response = await putGoal({ daily_goal: dailyGoal });
        assert.equal(response.status, 200, `expected ${dailyGoal} to be accepted`);
        assert.deepEqual(await response.json(), {
            message: "Daily goal updated",
            daily_goal: dailyGoal
        });
        assert.equal((await User.findByPk(user.id)).daily_goal, dailyGoal);
    }

    await user.reload();
    user.daily_goal = 7;
    await user.save();

    const invalidRequests = [
        { label: "numeric string", body: { daily_goal: "5" } },
        { label: "decimal", body: { daily_goal: 1.5 } },
        { label: "no request body", options: { includeBody: false } },
        { label: "missing value", body: {} },
        { label: "null", body: { daily_goal: null } },
        { label: "below minimum", body: { daily_goal: 0 } },
        { label: "above maximum", body: { daily_goal: 101 } },
        { label: "boolean", body: { daily_goal: true } },
        { label: "array", body: { daily_goal: [] } },
        { label: "object", body: { daily_goal: {} } }
    ];

    for (const invalidRequest of invalidRequests) {
        const response = await putGoal(invalidRequest.body, invalidRequest.options);
        assert.equal((await User.findByPk(user.id)).daily_goal, 7, `${invalidRequest.label} must not mutate daily_goal`);
        assert.equal(response.status, 400, `${invalidRequest.label} should be rejected`);
    }

    const unauthenticatedResponse = await putGoal({ daily_goal: 12 }, { authenticated: false });
    assert.equal(unauthenticatedResponse.status, 401);
    assert.equal((await User.findByPk(user.id)).daily_goal, 7);
});
