import { Transaction } from "sequelize";
import { sequelize } from "../config/db.js";
import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { applyAttemptRewards, canPlay, MAX_HEARTS } from "./gamification.js";
import { isWritingExerciseType, scoreAttempt, scoreWritingSubmission } from "./scoring.js";

export const NO_HEARTS_CODE = "NO_HEARTS";
export const EXERCISE_NOT_FOUND_CODE = "EXERCISE_NOT_FOUND";

export async function recordExerciseAttempt({
    user,
    exerciseId,
    userAnswer,
    totalGaps,
    now = new Date()
}) {
    const exercise = await Exercise.findByPk(exerciseId);
    if (!exercise) {
        const error = new Error("Exercise not found");
        error.code = EXERCISE_NOT_FOUND_CODE;
        throw error;
    }

    const isWriting = isWritingExerciseType(exercise.type);
    if (!isWriting && !canPlay(user.hearts ?? MAX_HEARTS)) {
        const error = new Error("No hearts remaining");
        error.code = NO_HEARTS_CODE;
        throw error;
    }

    const scored = isWriting
        ? scoreWritingSubmission(userAnswer)
        : scoreAttempt({
            userAnswer,
            correctAnswer: exercise.correct_answer,
            totalGaps
        });

    const persisted = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
    }, async (transaction) => {
        if (isWriting) {
            await user.reload({ transaction, lock: transaction.LOCK.UPDATE });
        }

        const hasPriorWritingAttempt = isWriting && Boolean(await UserExerciseAttempt.findOne({
            where: { user_id: user.id, exercise_id: exerciseId },
            attributes: ["id"],
            transaction
        }));

        const attempt = await UserExerciseAttempt.create({
            user_id: user.id,
            exercise_id: exerciseId,
            user_answer: userAnswer,
            total_gaps: scored.totalGaps,
            correct_gaps: scored.correctGaps,
            is_fully_correct: scored.isFullyCorrect,
            score: scored.score,
            grading_status: scored.gradingStatus || "graded",
            created_at: now
        }, { transaction });

        const role = typeof user.getActiveRole === "function" ? user.getActiveRole() : (user.subscription_role || "free");
        const rewards = applyAttemptRewards({
            coins: user.coins || 0,
            hearts: user.hearts ?? MAX_HEARTS,
            streak: user.streak || 0,
            lastCompletedDate: user.last_completed_date,
            role,
            isFullyCorrect: scored.isFullyCorrect,
            isCompletionOnly: isWriting,
            awardCoins: !hasPriorWritingAttempt,
            now
        });

        user.coins = rewards.coins;
        user.hearts = rewards.hearts;
        user.streak = rewards.streak;
        user.last_completed_date = rewards.lastCompletedDate;
        await user.save({ transaction });

        return { attempt, rewards };
    });

    return { ...persisted, scored, exercise };
}
