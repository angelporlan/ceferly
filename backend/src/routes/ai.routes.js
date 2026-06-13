import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { generateAiExplanation } from "../controllers/ai.controller.js";

const router = Router();

router.post("/attempts/:id/explain", authenticate, generateAiExplanation);

export default router;
