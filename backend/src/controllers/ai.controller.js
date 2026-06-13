import { AttemptExplanation } from "../models/AttemptExplanation.js";
import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { explainAttempt } from "./explanation.controller.js";

export const generateAiExplanation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: attemptId } = req.params;

        const attempt = await UserExerciseAttempt.findOne({
            where: {
                id: attemptId,
                user_id: userId
            },
            attributes: ["id"]
        });

        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }

        const cachedExplanation = await AttemptExplanation.findOne({
            where: { attempt_id: attemptId }
        });

        if (cachedExplanation) {
            return res.json({
                explanation: cachedExplanation.explanation,
                cached: true
            });
        }

        return explainAttempt(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating explanation" });
    }
};
