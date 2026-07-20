import { Groq } from "groq-sdk";
import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { AttemptExplanation } from "../models/AttemptExplanation.js";
import { checkAndConsumeAiUsage } from "../services/aiUsage.service.js";
import { User } from "../models/user.js";
import { createOpenRouterChatCompletion } from "../services/ai.service.js";

const aiServer = process.env.AI_SERVER || 'OpenRouter';

let aiClient;
if (aiServer === 'Groq') {
    aiClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
}

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

        if (attempt.is_fully_correct) {
            return res.json({
                explanation: "Your answer is fully correct. No explanation needed",
                cached: true
            });
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

        const systemPromptJson = `
You are an English B2 exam teacher.

Output requirements:
- Return the explanation in strict JSON format.
- Structure:
{
  "general_feedback": "string (motivational feedback + summary of performance)",
  "corrections": [
    {
        "question_id": number (the gap id),
        "status": "correct" | "incorrect",
        "user_answer": "string",
        "correct_answer": "string",
        "explanation": "string (concise grammar/vocabulary rule)"
    }
  ]
}
`;

        let prompt = '';

        const isMultipleChoice = attempt.exercise.type === 'multiple_choice' || attempt.exercise.type === 'multiple-choice';
        const isConditionals = attempt.exercise.type === 'conditionals';
        const isVocabulary = attempt.exercise.type === 'vocabulary';

        if (isConditionals) {
            prompt = `
${systemPromptJson}

Exercise type: Conditionals (Fill in the blanks with correct verb forms)

Exercise:
${attempt.exercise.question_text}

Correct answers:
${JSON.stringify(attempt.exercise.correct_answer)}

Student answers:
${JSON.stringify(attempt.user_answer)}

For each incorrect answer, explain:
- Why the student's verb form is incorrect
- What the correct verb form should be and why (Zero, First, Second conditional rules)
`;
        } else if (isVocabulary) {
            prompt = `
${systemPromptJson}

Exercise type: Vocabulary (Word Formation, Phrasal Verbs, or Collocations)

Exercise:
${attempt.exercise.question_text}

Correct answers:
${JSON.stringify(attempt.exercise.correct_answer)}

Student answers:
${JSON.stringify(attempt.user_answer)}

For each incorrect answer:
- Explain the meaning of the correct word.
- If it's a collocation, explain which words go together.
- If it's word formation, explain the suffix/prefix used.
`;
        } else {
            prompt = `
${systemPromptJson}

Exercise Type: ${attempt.exercise.type}

Exercise:
${attempt.exercise.question_text}

Correct answers:
${JSON.stringify(attempt.exercise.correct_answer)}

Student answers:
${JSON.stringify(attempt.user_answer)}

Explain clearly why the student answer is wrong and what the correct option is for each incorrect gap.
`;
        }

        const model = aiServer === 'Groq'
            ? "openai/gpt-oss-120b"
            : "tngtech/deepseek-r1t2-chimera:free";

        let explanationText;
        if (aiServer === 'Groq') {
            const completion = await aiClient.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.4
            });

            explanationText = completion.choices[0].message.content;
        } else {
            const completion = await createOpenRouterChatCompletion({
                model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.4
            });

            explanationText = completion.choices[0].message.content;
        }

        explanationText = explanationText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        explanationText = explanationText.replace(/```json/g, "").replace(/```/g, "").trim();

        const finalUsage = await checkAndConsumeAiUsage(user);

        await AttemptExplanation.create({
            attempt_id: attempt.id,
            explanation: explanationText,
            model: model
        });

        return res.json({
            explanation: explanationText,
            cached: false,
            remaining: finalUsage.remaining
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating explanation" });
    }
};
