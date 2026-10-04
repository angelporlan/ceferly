import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "../models/User.js";
import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { applyAttemptRewards, canPlay, MAX_HEARTS } from "./gamification.js";
import { scoreAttempt } from "./scoring.js";

export const NO_HEARTS_CODE = "NO_HEARTS";
export const EXERCISE_NOT_FOUND_CODE = "EXERCISE_NOT_FOUND";

const isWritingExercise = (type) =>
    ["essay", "writing"].includes(String(type || "").trim().toLowerCase());

const dateRangeForUtcDay = (date) => {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
};

export async function recordExerciseAttempt({
    user,
    exerciseId,
    userAnswer,
    totalGaps,
    now = new Date()
}) {
    const result = await sequelize.transaction(async (transaction) => {
        // Serializing a user's attempts makes the persisted attempt history a safe
        // idempotency record even when two Writing submissions arrive together.
        const currentUser = await User.findByPk(user.id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!currentUser) {
            const error = new Error("User not found");
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        const exercise = await Exercise.findByPk(exerciseId, { transaction });
        if (!exercise) {
            const error = new Error("Exercise not found");
            error.code = EXERCISE_NOT_FOUND_CODE;
            throw error;
        }

        const writing = isWritingExercise(exercise.type);
        if (!writing && !canPlay(currentUser.hearts ?? MAX_HEARTS)) {
            const error = new Error("No hearts remaining");
            error.code = NO_HEARTS_CODE;
            throw error;
        }

        const previousWritingAttempt = writing
            ? await UserExerciseAttempt.findOne({
                where: {
                    user_id: currentUser.id,
                    exercise_id: exercise.id
                },
                attributes: ["id"],
                transaction
            })
            : null;

        const scored = scoreAttempt({
            userAnswer,
            correctAnswer: exercise.correct_answer,
            totalGaps
        });

        const attempt = await UserExerciseAttempt.create({
            user_id: currentUser.id,
            exercise_id: exercise.id,
            user_answer: userAnswer,
            total_gaps: scored.totalGaps,
            correct_gaps: scored.correctGaps,
            is_fully_correct: scored.isFullyCorrect,
            score: scored.score,
            created_at: now
        }, { transaction });

        const { start, end } = dateRangeForUtcDay(now);
        const attemptsToday = await UserExerciseAttempt.count({
            where: {
                user_id: currentUser.id,
                created_at: {
                    [Op.gte]: start,
                    [Op.lt]: end
                }
            },
            transaction
        });

        const role = typeof currentUser.getActiveRole === "function"
            ? currentUser.getActiveRole()
            : (currentUser.subscription_role || "free");
        const rewards = applyAttemptRewards({
            coins: currentUser.coins || 0,
            hearts: currentUser.hearts ?? MAX_HEARTS,
            streak: currentUser.streak || 0,
            lastCompletedDate: currentUser.last_completed_date,
            role,
            isFullyCorrect: scored.isFullyCorrect,
            isCompletionOnly: writing,
            grantCoins: !writing || !previousWritingAttempt,
            attemptsToday,
            dailyGoal: currentUser.daily_goal ?? 5,
            now
        });

        currentUser.coins = rewards.coins;
        currentUser.hearts = rewards.hearts;
        currentUser.streak = rewards.streak;
        currentUser.last_completed_date = rewards.lastCompletedDate;
        await currentUser.save({ transaction });

        return { attempt, rewards, scored, exercise, currentUser };
    });

    // Keep the request-scoped instance in sync for callers that inspect it later.
    Object.assign(user, {
        coins: result.currentUser.coins,
        hearts: result.currentUser.hearts,
        streak: result.currentUser.streak,
        last_completed_date: result.currentUser.last_completed_date
    });

    const { currentUser, ...publicResult } = result;
    return publicResult;
}
