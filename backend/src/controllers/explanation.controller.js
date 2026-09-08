import { Groq } from "groq-sdk";
import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { AttemptExplanation } from "../models/AttemptExplanation.js";
import { checkAndConsumeAiUsage } from "../services/aiUsage.service.js";
import { User } from "../models/User.js";
import { createOpenRouterChatCompletion, createGeminiCompletion } from "../services/ai.service.js";
import { explainAndPersistAttempt, persistAttemptExplanation, buildExplanationPrompt } from "../services/explanation.service.js";

const aiServer = process.env.AI_SERVER || 'OpenRouter';

let aiClient;
if (aiServer === 'Groq') {
    aiClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
}

const resolveModelName = () => {
    const isGemini = aiServer?.toLowerCase() === 'gemini';
    const isGroq = aiServer === 'Groq';
    if (isGroq) return "openai/gpt-oss-120b";
    if (isGemini) return process.env.GEMINI_MODEL || "gemini-3.5-flash";
    return "tngtech/deepseek-r1t2-chimera:free";
};

export const createTeacherCompletion = async (prompt, { fallback } = {}) => {
    const model = resolveModelName();
    const isGemini = aiServer?.toLowerCase() === 'gemini';
    const isGroq = aiServer === 'Groq';

    try {
        if (isGemini) {
            return await createGeminiCompletion({ prompt, model, temperature: 0.4 });
        }
        if (isGroq) {
            const completion = await aiClient.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.4
            });
            return completion.choices[0].message.content;
        }
        const completion = await createOpenRouterChatCompletion({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4
        });
        return completion.choices[0].message.content;
    } catch (error) {
        if (fallback) {
            return JSON.stringify({
                general_feedback: "Explicación pedagógica de Cambridge (modo local).",
                explanation: fallback
            });
        }
        throw error;
    }
};

export const explainAttempt = async (req, res) => {
    try {
        const userId = req.user.id;
        const attemptId = req.params.id;

        const attempt = await UserExerciseAttempt.findOne({
            where: {
                id: attemptId,
                user_id: userId
            },
            include: {
                model: Exercise,
                as: 'exercise'
            }
        });

        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }

        const cachedExplanation = await AttemptExplanation.findOne({
            where: { attempt_id: attempt.id }
        });

        if (cachedExplanation) {
            return res.json({
                explanation: cachedExplanation.explanation,
                cached: true
            });
        }

        const user = await User.findByPk(userId);
        const usageCheck = await checkAndConsumeAiUsage(user, { dryRun: true });

        if (!usageCheck.allowed) {
            return res.status(403).json({
                message: "Daily AI explanation limit reached",
                limit: usageCheck.limit
            });
        }

        const fallback = attempt.exercise?.explanation_rule
            || "Compara tu respuesta con la clave Cambridge y revisa la estructura gramatical o la colocación.";

        const result = await explainAndPersistAttempt({
            userId,
            attemptId: attempt.id,
            model: resolveModelName(),
            generateText: (prompt) => createTeacherCompletion(prompt, { fallback })
        });

        let remaining;
        if (!result.cached) {
            const finalUsage = await checkAndConsumeAiUsage(user);
            remaining = finalUsage.remaining;
        }

        return res.json({
            explanation: result.explanation,
            cached: result.cached,
            remaining
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating explanation" });
    }
};

export const explainDirect = async (req, res) => {
    try {
        const {
            questionText,
            userAnswer,
            correctAnswer,
            exerciseType = "Grammar",
            explanationRule,
            attemptId
        } = req.body;

        const fallback = explanationRule
            || `En el examen de Cambridge, la respuesta esperada es ${JSON.stringify(correctAnswer)}.`;
        const prompt = buildExplanationPrompt({
            questionText,
            userAnswer,
            correctAnswer,
            exerciseType,
            explanationRule
        });

        const raw = await createTeacherCompletion(prompt, { fallback });
        let parsed;
        try {
            const cleaned = String(raw).replace(/```json/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = { explanation: raw };
        }

        const explanation = parsed.explanation || parsed.general_feedback || String(raw);

        if (attemptId && req.user?.id) {
            await persistAttemptExplanation({
                attemptId,
                explanation,
                model: resolveModelName()
            });
        }

        return res.json({
            explanation,
            raw: parsed
        });
    } catch (err) {
        console.error("Error in explainDirect:", err);
        return res.status(500).json({ message: "Error generating explanation" });
    }
};

