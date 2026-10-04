import test from "node:test";
import assert from "node:assert/strict";
import {
    applyAttemptRewards,
    applyShopPurchase,
    canPlay,
    decrementHearts,
    spendCoins,
    MAX_HEARTS,
    SHOP_PRICES
} from "../src/services/gamification.js";

test("incorrect answers decrement hearts and still award coins", () => {
    const before = { coins: 20, hearts: 5, streak: 0, lastCompletedDate: null };
    const after = applyAttemptRewards({
        ...before,
        role: "free",
        isFullyCorrect: false,
        attemptsToday: 1,
        dailyGoal: 1,
        now: new Date("2026-09-08T12:00:00.000Z")
    });

    assert.equal(after.hearts, before.hearts - 1);
    assert.ok(after.coins > before.coins);
    assert.equal(after.streak, 1);
    assert.equal(after.lastCompletedDate, "2026-09-08");
});

test("correct answers keep hearts and raise coins and daily streak", () => {
    const before = {
        coins: 4,
        hearts: 3,
        streak: 2,
        lastCompletedDate: "2026-09-07"
    };
    const after = applyAttemptRewards({
        ...before,
        role: "pro",
        isFullyCorrect: true,
        attemptsToday: 1,
        dailyGoal: 1,
        now: new Date("2026-09-08T12:00:00.000Z")
    });

    assert.equal(after.hearts, before.hearts);
    assert.ok(after.coins > before.coins);
    assert.equal(after.streak, 3);
});

test("daily streak advances only once after the configured goal is reached", () => {
    const base = {
        coins: 10,
        hearts: 5,
        streak: 2,
        lastCompletedDate: "2026-09-07",
        role: "free",
        isFullyCorrect: true,
        dailyGoal: 3,
        now: new Date("2026-09-08T12:00:00.000Z")
    };

    const belowGoal = applyAttemptRewards({ ...base, attemptsToday: 2 });
    assert.equal(belowGoal.streak, 2);
    assert.equal(belowGoal.lastCompletedDate, "2026-09-07");

    const reachedGoal = applyAttemptRewards({ ...base, attemptsToday: 3 });
    assert.equal(reachedGoal.streak, 3);
    assert.equal(reachedGoal.lastCompletedDate, "2026-09-08");

    const extraAttempt = applyAttemptRewards({
        ...base,
        streak: reachedGoal.streak,
        lastCompletedDate: reachedGoal.lastCompletedDate,
        attemptsToday: 4
    });
    assert.equal(extraAttempt.streak, 3);

    const consecutiveDay = applyAttemptRewards({
        ...base,
        streak: extraAttempt.streak,
        lastCompletedDate: extraAttempt.lastCompletedDate,
        attemptsToday: 3,
        now: new Date("2026-09-09T12:00:00.000Z")
    });
    assert.equal(consecutiveDay.streak, 4);

    const missedDay = applyAttemptRewards({
        ...base,
        streak: consecutiveDay.streak,
        lastCompletedDate: consecutiveDay.lastCompletedDate,
        attemptsToday: 3,
        now: new Date("2026-09-11T12:00:00.000Z")
    });
    assert.equal(missedDay.streak, 1);
});

test("play is blocked when no hearts remain", () => {
    assert.equal(canPlay(0), false);
    assert.equal(canPlay(1), true);
    assert.equal(decrementHearts(1), 0);
    assert.equal(decrementHearts(0), 0);

    const empty = applyAttemptRewards({
        coins: 0,
        hearts: 1,
        streak: 0,
        lastCompletedDate: null,
        isFullyCorrect: false,
        now: new Date("2026-09-08T12:00:00.000Z")
    });
    assert.equal(empty.hearts, 0);
    assert.equal(empty.playBlocked, true);
});

test("shop spend reduces coins when sufficient and heart refill restores lives", () => {
    const tooPoor = spendCoins(10, SHOP_PRICES["heart-refill"]);
    assert.equal(tooPoor.ok, false);

    const spent = applyShopPurchase({
        coins: 80,
        hearts: 1,
        avatarSeed: "start"
    }, "heart-refill");

    assert.equal(spent.ok, true);
    assert.equal(spent.coins, 80 - SHOP_PRICES["heart-refill"]);
    assert.equal(spent.hearts, MAX_HEARTS);

    const avatar = applyShopPurchase({
        coins: 100,
        hearts: 5,
        avatarSeed: "start"
    }, "pack-classic");
    assert.equal(avatar.ok, true);
    assert.equal(avatar.coins, 100 - SHOP_PRICES["pack-classic"]);
    assert.equal(avatar.avatarSeed, "seed-pack-classic");
});
