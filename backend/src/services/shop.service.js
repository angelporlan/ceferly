import { applyShopPurchase, MAX_HEARTS } from "./gamification.js";

export async function checkoutShopItem(user, itemId) {
    const result = applyShopPurchase({
        coins: user.coins || 0,
        hearts: user.hearts ?? MAX_HEARTS,
        avatarSeed: user.avatar_seed
    }, itemId);

    if (!result.ok) {
        return result;
    }

    user.coins = result.coins;
    user.hearts = result.hearts;
    if (result.avatarSeed) {
        user.avatar_seed = result.avatarSeed;
    }
    await user.save();

    return result;
}
