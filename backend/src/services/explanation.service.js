import { AttemptExplanation } from "../models/AttemptExplanation.js";
import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { isWritingExerciseType } from "./scoring.js";

export const buildExplanationPrompt = ({ questionText, userAnswer, correctAnswer, exerciseType, explanationRule } = {}) => {
    if (isWritingExerciseType(exerciseType)) {
        const modelAnswer = correctAnswer && typeof correctAnswer === "object"
            ? correctAnswer.model_answer
            : correctAnswer;

        return [
            "You are a supportive English writing tutor for Cambridge B1 Preliminary, B2 First and C1 Advanced learners.",
            "Writing feedback: assess whether the text answers the task, then comment on clarity, organization, grammar and vocabulary.",
            "Give two specific strengths and up to three actionable improvements with short examples from the student's text.",
            "Do not require identical wording to the model answer, invent errors, or assign an official Cambridge score.",
            `Task: ${questionText || "N/A"}`,
            `Student's writing:\n${typeof userAnswer === "string" ? userAnswer : JSON.stringify(userAnswer ?? "")}`,
            modelAnswer ? `Optional sample answer for reference only:\n${modelAnswer}` : "No sample answer is available.",
            "Return strict JSON: {\"general_feedback\":\"...\",\"explanation\":\"...\"}"
        ].join("\n");
    }

    const ruleLine = explanationRule
        ? `Official pedagogical rule: ${explanationRule}`
        : "Use official Cambridge Use of English rules.";

    return [
        "You are an expert Cambridge English teacher for B1 Preliminary, B2 First and C1 Advanced.",
        "Explain clearly why the student's answer is wrong or confirm why it is right.",
        ruleLine,
        `Exercise type: ${exerciseType || "Use of English"}`,
        `Question: ${questionText || "N/A"}`,
        `Student answer: ${JSON.stringify(userAnswer ?? "")}`,
        `Correct answer: ${JSON.stringify(correctAnswer ?? "")}`,
        "Return strict JSON: {\"general_feedback\":\"...\",\"explanation\":\"...\"}"
    ].join("\n");
};

export const markWritingFeedbackAvailable = async (attempt) => {
    if (!isWritingExerciseType(attempt.exercise?.type) || attempt.grading_status === "feedback_available") {
        return;
    }

    attempt.grading_status = "feedback_available";
    await attempt.save({ fields: ["grading_status"] });
};

export const persistAttemptExplanation = async ({ attemptId, explanation, model }) => {
    const existing = await AttemptExplanation.findOne({ where: { attempt_id: attemptId } });
    if (existing) {
        return existing;
    }

    return AttemptExplanation.create({
        attempt_id: attemptId,
        explanation,
        model
    });
};

const parseModelText = (raw) => {
    if (!raw) return "";
    let text = String(raw).replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
        const parsed = JSON.parse(text);
        return parsed.explanation || parsed.general_feedback || text;
    } catch {
        return text;
    }
};

export const explainAndPersistAttempt = async ({
    userId,
    attemptId,
    generateText,
    model = "stub-teacher"
}) => {
    const attempt = await UserExerciseAttempt.findOne({
        where: { id: attemptId, user_id: userId },
        include: { model: Exercise, as: "exercise" }
    });

    if (!attempt) {
        const error = new Error("Attempt not found");
        error.code = "ATTEMPT_NOT_FOUND";
        throw error;
    }

    const cached = await AttemptExplanation.findOne({ where: { attempt_id: attempt.id } });
    if (cached) {
        await markWritingFeedbackAvailable(attempt);
        return { explanation: cached.explanation, cached: true, record: cached };
    }

    const prompt = buildExplanationPrompt({
        questionText: attempt.exercise?.question_text,
        userAnswer: attempt.user_answer,
        correctAnswer: attempt.exercise?.correct_answer,
        exerciseType: attempt.exercise?.type,
        explanationRule: attempt.exercise?.explanation_rule
    });

    const raw = await generateText(prompt);
    const explanation = parseModelText(raw);
    const record = await persistAttemptExplanation({
        attemptId: attempt.id,
        explanation,
        model
    });
    await markWritingFeedbackAvailable(attempt);

    return { explanation, cached: false, record };
};
