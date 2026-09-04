import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { generateAiExplanation } from "../controllers/ai.controller.js";
import { explainDirect } from "../controllers/explanation.controller.js";

const router = Router();

router.post("/attempts/:id/explain", authenticate, generateAiExplanation);
router.post("/ai/explain", optionalAuthenticate, explainDirect);
router.post("/explain", optionalAuthenticate, explainDirect);

export default router;
