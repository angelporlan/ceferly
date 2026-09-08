export const MAX_HEARTS = 5;
export const CONSOLATION_COINS = 2;

export const COIN_REWARD_BY_ROLE = {
    free: 10,
    pro: 15,
    premium: 20
};

export const SHOP_PRICES = {
    "pack-classic": 30,
    "pack-fire": 50,
    "pack-sky": 75,
    "pack-royal": 100,
    "heart-refill": 30
};

export const formatDateKey = (date = new Date()) => {
    const value = date instanceof Date ? date : new Date(date);
    return value.toISOString().split("T")[0];
};

const yesterdayKeyFrom = (dateKey) => {
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().split("T")[0];
};

export const canPlay = (hearts = MAX_HEARTS) => Number(hearts) > 0;

export const decrementHearts = (hearts = MAX_HEARTS) => Math.max(0, Number(hearts) - 1);

export const coinRewardForAttempt = (role = "free", isFullyCorrect = false) => {
    if (!isFullyCorrect) {
        return CONSOLATION_COINS;
    }
    return COIN_REWARD_BY_ROLE[role] ?? COIN_REWARD_BY_ROLE.free;
};

export const applyDailyPracticeStreak = ({
    streak = 0,
    lastCompletedDate = null,
    today = formatDateKey()
} = {}) => {
    if (lastCompletedDate === today) {
        return { streak: Number(streak) || 0, lastCompletedDate };
    }

    if (lastCompletedDate && lastCompletedDate === yesterdayKeyFrom(today)) {
        return { streak: (Number(streak) || 0) + 1, lastCompletedDate: today };
    }

    return { streak: 1, lastCompletedDate: today };
};

export const applyAttemptRewards = ({
    coins = 0,
    hearts = MAX_HEARTS,
    streak = 0,
    lastCompletedDate = null,
    role = "free",
    isFullyCorrect = false,
    now = new Date()
} = {}) => {
    const today = formatDateKey(now);
    const nextHearts = isFullyCorrect ? Number(hearts) : decrementHearts(hearts);
    const coinsDelta = coinRewardForAttempt(role, isFullyCorrect);
    const streakState = applyDailyPracticeStreak({
        streak,
        lastCompletedDate,
        today
    });

    return {
        coins: Number(coins) + coinsDelta,
        hearts: nextHearts,
        streak: streakState.streak,
        lastCompletedDate: streakState.lastCompletedDate,
        coinsDelta,
        playBlocked: !canPlay(nextHearts)
    };
};

export const spendCoins = (coins, cost) => {
    const current = Number(coins) || 0;
    const price = Number(cost);

    if (!Number.isFinite(price) || price <= 0) {
        return { ok: false, reason: "INVALID_COST", coins: current };
    }

    if (current < price) {
        return { ok: false, reason: "INSUFFICIENT", coins: current };
    }

    return { ok: true, coins: current - price };
};

export const applyShopPurchase = (userSnapshot, itemId) => {
    const cost = SHOP_PRICES[itemId];
    if (cost === undefined) {
        return { ok: false, reason: "UNKNOWN_ITEM", coins: userSnapshot.coins, hearts: userSnapshot.hearts, avatarSeed: userSnapshot.avatarSeed };
    }

    const spent = spendCoins(userSnapshot.coins, cost);
    if (!spent.ok) {
        return {
            ok: false,
            reason: spent.reason,
            coins: spent.coins,
            hearts: userSnapshot.hearts,
            avatarSeed: userSnapshot.avatarSeed
        };
    }

    const next = {
        ok: true,
        coins: spent.coins,
        hearts: userSnapshot.hearts,
        avatarSeed: userSnapshot.avatarSeed
    };

    if (itemId === "heart-refill") {
        next.hearts = MAX_HEARTS;
    } else if (String(itemId).startsWith("pack-")) {
        next.avatarSeed = `seed-${itemId}`;
    }

    return next;
};
