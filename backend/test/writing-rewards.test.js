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

const unique = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const referenceDate = new Date("2026-10-04T12:00:00.000Z");

test("Writing re-submissions reward once per user and count toward the daily goal", async (t) => {
    let firstUser;
    let secondUser;
    let category;
    let subcategory;
    let writingExercise;
    let closedExercise;

    try {
        await sequelize.authenticate();
        const [level] = await Level.findOrCreate({ where: { name: "B1" } });
        [category] = await Category.findOrCreate({ where: { name: "Writing rewards test" } });
        [subcategory] = await Subcategory.findOrCreate({
            where: { name: "Essays", category_id: category.id },
            defaults: { description: "Writing reward test exercises" }
        });
        writingExercise = await Exercise.create({
            type: "essay",
            title: unique("B1 essay reward"),
            question_text: "Write about a useful change in your town.",
            options: null,
            correct_answer: { model_answer: "A sample essay." },
            level_id: level.id,
            subcategory_id: subcategory.id
        });
        closedExercise = await Exercise.create({
            type: "multiple_choice_cloze",
            title: unique("B1 closed reward"),
            question_text: "Every morning I ______ the bus.",
            options: ["catch", "do", "make", "go"],
            correct_answer: "catch",
            level_id: level.id,
            subcategory_id: subcategory.id
        });
        firstUser = await User.create({
            name: "Writing Reward Test",
            username: unique("writing-reward-user"),
            email: `${unique("writing-reward-user")}@ceferly.test`,
            password_hash: "not-used-in-this-test",
            subscription_role: "free",
            daily_goal: 3,
            coins: 0,
            hearts: 5,
            streak: 2,
            last_completed_date: "2026-10-03"
        });
        secondUser = await User.create({
            name: "Isolated Writing Reward Test",
            username: unique("writing-reward-user"),
            email: `${unique("writing-reward-user")}@ceferly.test`,
            password_hash: "not-used-in-this-test",
            subscription_role: "free",
            daily_goal: 1,
            coins: 0,
            hearts: 0,
            streak: 0
        });
    } catch (error) {
        t.diagnostic(`DB unavailable: ${error.message}`);
        throw error;
    }

    t.after(async () => {
        const userIds = [firstUser?.id, secondUser?.id].filter(Boolean);
        if (userIds.length) {
            await UserExerciseAttempt.destroy({ where: { user_id: userIds } });
        }
        if (writingExercise) await writingExercise.destroy();
        if (closedExercise) await closedExercise.destroy();
        if (firstUser) await firstUser.destroy();
        if (secondUser) await secondUser.destroy();
        if (subcategory) await subcategory.destroy();
        if (category) await category.destroy();
    });

    const writingAnswer = "Our town should improve its bus service.";
    const concurrentWritingAttempts = await Promise.all([
        recordExerciseAttempt({
            user: firstUser,
            exerciseId: writingExercise.id,
            userAnswer: writingAnswer,
            now: referenceDate
        }),
        recordExerciseAttempt({
            user: firstUser,
            exerciseId: writingExercise.id,
            userAnswer: `${writingAnswer} It would help everyone.`,
            now: referenceDate
        })
    ]);

    assert.equal(concurrentWritingAttempts.filter(({ rewards }) => rewards.coinsDelta > 0).length, 1);

    await firstUser.reload();
    assert.equal(
        firstUser.coins,
        concurrentWritingAttempts.reduce((total, { rewards }) => total + rewards.coinsDelta, 0)
    );
    assert.equal(firstUser.streak, 2, "two Writing attempts remain below the three-attempt daily goal");
    assert.equal(firstUser.last_completed_date, "2026-10-03");

    const goalAttempt = await recordExerciseAttempt({
        user: firstUser,
        exerciseId: closedExercise.id,
        userAnswer: "catch",
        now: referenceDate
    });
    assert.equal(goalAttempt.rewards.streak, 3, "a closed exercise reaches the goal after two Writing attempts");
    assert.equal(goalAttempt.rewards.lastCompletedDate, "2026-10-04");

    const extraAttempt = await recordExerciseAttempt({
        user: firstUser,
        exerciseId: closedExercise.id,
        userAnswer: "catch",
        now: referenceDate
    });
    assert.equal(extraAttempt.rewards.streak, 3, "extra attempts do not advance the streak twice in one day");

    const isolatedReward = await recordExerciseAttempt({
        user: secondUser,
        exerciseId: writingExercise.id,
        userAnswer: writingAnswer,
        now: referenceDate
    });
    assert.ok(isolatedReward.rewards.coinsDelta > 0, "another user gets their own first-attempt reward");
    await secondUser.reload();
    assert.equal(secondUser.coins, isolatedReward.rewards.coinsDelta);
    assert.equal(secondUser.streak, 1);
    assert.equal(secondUser.hearts, 0, "Writing remains available without consuming hearts");
});
