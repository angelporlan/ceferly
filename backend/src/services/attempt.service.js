import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { applyAttemptRewards, canPlay, MAX_HEARTS } from "./gamification.js";
import { scoreAttempt } from "./scoring.js";

export const NO_HEARTS_CODE = "NO_HEARTS";
export const EXERCISE_NOT_FOUND_CODE = "EXERCISE_NOT_FOUND";

export async function recordExerciseAttempt({
    user,
    exerciseId,
    userAnswer,
    totalGaps,
    now = new Date()
}) {
    if (!canPlay(user.hearts ?? MAX_HEARTS)) {
        const error = new Error("No hearts remaining");
        error.code = NO_HEARTS_CODE;
        throw error;
    }

    const exercise = await Exercise.findByPk(exerciseId);
    if (!exercise) {
        const error = new Error("Exercise not found");
        error.code = EXERCISE_NOT_FOUND_CODE;
        throw error;
    }

    const scored = scoreAttempt({
        userAnswer,
        correctAnswer: exercise.correct_answer,
        totalGaps
    });

    const attempt = await UserExerciseAttempt.create({
        user_id: user.id,
        exercise_id: exerciseId,
        user_answer: userAnswer,
        total_gaps: scored.totalGaps,
        correct_gaps: scored.correctGaps,
        is_fully_correct: scored.isFullyCorrect,
        score: scored.score
    });

    const role = typeof user.getActiveRole === "function" ? user.getActiveRole() : (user.subscription_role || "free");
    const rewards = applyAttemptRewards({
        coins: user.coins || 0,
        hearts: user.hearts ?? MAX_HEARTS,
        streak: user.streak || 0,
        lastCompletedDate: user.last_completed_date,
        role,
        isFullyCorrect: scored.isFullyCorrect,
        now
    });

    user.coins = rewards.coins;
    user.hearts = rewards.hearts;
    user.streak = rewards.streak;
    user.last_completed_date = rewards.lastCompletedDate;
    await user.save();

    return { attempt, rewards, scored, exercise };
}
