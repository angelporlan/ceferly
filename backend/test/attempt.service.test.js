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
import { UserExerciseAttempt } from "../src/models/UserExerciseAttempt.js";
import { recordExerciseAttempt } from "../src/services/attempt.service.js";
import { checkoutShopItem } from "../src/services/shop.service.js";
import { SHOP_PRICES, MAX_HEARTS } from "../src/services/gamification.js";

const unique = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

async function createFixtures() {
    await sequelize.authenticate();

    const [level] = await Level.findOrCreate({ where: { name: "B1" } });
    const [category] = await Category.findOrCreate({ where: { name: "Use of English" } });
    const [subcategory] = await Subcategory.findOrCreate({
        where: { name: "Multiple Choice", category_id: category.id },
        defaults: { description: "Use of English Part 1" }
    });

    const title = unique("B1 Preliminary UoE P1 test item");
    const exercise = await Exercise.create({
        type: "multiple_choice_cloze",
        title,
        question_text: "Every morning I ______ the bus to college.",
        options: ["catch", "do", "make", "go"],
        correct_answer: "catch",
        explanation_rule: "catch the bus is the B1 transport collocation.",
        content: { exam: "B1 Preliminary", part: 1, level: "B1" },
        level_id: level.id,
        subcategory_id: subcategory.id
    });

    const user = await User.create({
        name: "Test Learner",
        username: unique("learner"),
        email: `${unique("learner")}@ceferly.test`,
        password_hash: "not-used-in-this-test",
        coins: 40,
        hearts: 5,
        streak: 0
    });

    return { user, exercise };
}

test("recordExerciseAttempt persists an attempt and updates coins/streak/hearts", async (t) => {
    let user;
    let exercise;
    try {
        ({ user, exercise } = await createFixtures());
    } catch (error) {
        t.diagnostic(`DB unavailable: ${error.message}`);
        throw error;
    }

    const beforeCoins = user.coins;
    const beforeHearts = user.hearts;

    const wrong = await recordExerciseAttempt({
        user,
        exerciseId: exercise.id,
        userAnswer: "do",
        totalGaps: 1,
        now: new Date("2026-09-08T10:00:00.000Z")
    });

    assert.ok(wrong.attempt.id);
    const stored = await UserExerciseAttempt.findByPk(wrong.attempt.id);
    assert.ok(stored);
    assert.equal(stored.user_id, user.id);
    assert.equal(stored.exercise_id, exercise.id);
    assert.equal(stored.is_fully_correct, false);
    assert.equal(wrong.rewards.hearts, beforeHearts - 1);
    assert.ok(wrong.rewards.coins > beforeCoins);
    assert.equal(wrong.rewards.streak, 1);

    await user.reload();
    assert.equal(user.hearts, beforeHearts - 1);
    assert.equal(user.streak, 1);
    assert.ok(user.coins > beforeCoins);

    const right = await recordExerciseAttempt({
        user,
        exerciseId: exercise.id,
        userAnswer: "catch",
        totalGaps: 1,
        now: new Date("2026-09-08T11:00:00.000Z")
    });
    assert.equal(right.scored.isFullyCorrect, true);
    await user.reload();
    assert.equal(user.hearts, beforeHearts - 1);
});

test("checkoutShopItem persists a coin spend", async (t) => {
    let user;
    try {
        ({ user } = await createFixtures());
    } catch (error) {
        t.diagnostic(`DB unavailable: ${error.message}`);
        throw error;
    }

    user.coins = 80;
    user.hearts = 1;
    await user.save();

    const result = await checkoutShopItem(user, "heart-refill");
    assert.equal(result.ok, true);
    await user.reload();
    assert.equal(user.coins, 80 - SHOP_PRICES["heart-refill"]);
    assert.equal(user.hearts, MAX_HEARTS);
});
