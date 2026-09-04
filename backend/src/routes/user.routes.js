import express from "express";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { getUserProgress } from "../controllers/user.controller.js";
import { getMyAiUsage } from "../controllers/user.controller.js";
import { changeRole } from "../controllers/user.controller.js";
import { userInformation } from "../controllers/user.controller.js";
import { updateUserInfo } from "../controllers/user.controller.js";
import { updatePassword } from "../controllers/user.controller.js";
import { deleteUser } from "../controllers/user.controller.js";
import { getNumberOfAttemptsToday } from "../controllers/user.controller.js";
import { updateDailyGoal } from "../controllers/user.controller.js";
import { purchaseAvatar } from "../controllers/user.controller.js";
import { getGlobalRankings } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/users/me/progress", authenticate, getUserProgress);
router.get("/users/me/ai-usage", authenticate, getMyAiUsage);
router.post("/users/me/role", authenticate, changeRole);
router.get("/users/me", authenticate, userInformation);
router.put("/users/me", authenticate, updateUserInfo);
router.put("/users/me/password", authenticate, updatePassword);
router.delete("/users/me", authenticate, deleteUser);
router.get("/users/me/numberOfAttemptsToday", authenticate, getNumberOfAttemptsToday);
router.put("/users/me/daily-goal", authenticate, updateDailyGoal);
router.post("/users/me/avatar", authenticate, purchaseAvatar);
router.get("/users/rankings", optionalAuthenticate, getGlobalRankings);

export default router;
