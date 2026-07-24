import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { Subcategory } from "../models/Subcategory.js";
import { Category } from "../models/Category.js";
import { Level } from "../models/Level.js";
import { Sequelize, Op } from "sequelize";

import { AiUsageDaily } from "../models/AiUsageDaily.js";
import { AI_LIMITS } from "../config/aiLimits.js";

const formatDateKey = (date = new Date()) => date.toISOString().split("T")[0];

const getYesterdayKey = (date = new Date()) => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateKey(yesterday);
};

export const resetStreakIfNeeded = async (user, referenceDate = new Date()) => {
    if (!user.last_completed_date) {
        return user;
    }

    const todayKey = formatDateKey(referenceDate);
    const lastCompletedKey = user.last_completed_date;

    if (lastCompletedKey === todayKey) {
        return user;
    }

    const yesterdayKey = getYesterdayKey(referenceDate);
    const diffDays = Math.ceil(
        Math.abs(new Date(todayKey) - new Date(lastCompletedKey)) / (1000 * 60 * 60 * 24)
    );

    if (lastCompletedKey !== yesterdayKey && diffDays > 1) {
        user.streak = 0;
        await user.save();
    }

    return user;
};

export const updateStreakWhenDailyGoalReached = async (
    user,
    attemptsToday,
    referenceDate = new Date()
) => {
    const dailyGoal = user.daily_goal || 5;
    if (attemptsToday < dailyGoal) {
        return user;
    }

    const todayKey = formatDateKey(referenceDate);
    const lastCompletedKey = user.last_completed_date;

    if (lastCompletedKey === todayKey) {
        return user;
    }

    const yesterdayKey = getYesterdayKey(referenceDate);
    user.streak = lastCompletedKey === yesterdayKey ? (user.streak || 0) + 1 : 1;
    user.last_completed_date = todayKey;
    await user.save();

    return user;
};

export const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalAttempts = await UserExerciseAttempt.count({
            where: { user_id: userId }
        });

        const totalCorrectGaps = await UserExerciseAttempt.sum('correct_gaps', {
            where: { user_id: userId }
        });

        const totalTotalGaps = await UserExerciseAttempt.sum('total_gaps', {
            where: { user_id: userId }
        });

        const globalScore = totalTotalGaps
            ? (totalCorrectGaps / totalTotalGaps)
            : 0;

        const totalExercises = await Exercise.count();
        const completedUniqueExercises = await UserExerciseAttempt.count({
            where: { user_id: userId },
            distinct: true,
            col: 'exercise_id'
        });

        const progressByCategory = await UserExerciseAttempt.findAll({
            where: { user_id: userId },
            attributes: [
                [Sequelize.fn("COUNT", Sequelize.col("UserExerciseAttempt.id")), "attempts"],
                [Sequelize.fn("SUM", Sequelize.col("correct_gaps")), "correct"]
            ],
            include: {
                model: Exercise,
                as: 'exercise',
                attributes: [],
                include: {
                    model: Subcategory,
                    attributes: [],
                    include: {
                        model: Category,
                        attributes: ["id", "name"]
                    }
                }
            },
            group: ["exercise.Subcategory.Category.id", "exercise.Subcategory.Category.name"]
        });

        const progressByLevel = await UserExerciseAttempt.findAll({
            where: { user_id: userId },
            attributes: [
                [Sequelize.fn("COUNT", Sequelize.col("UserExerciseAttempt.id")), "attempts"],
                [Sequelize.fn("SUM", Sequelize.col("correct_gaps")), "correct"]
            ],
            include: {
                model: Exercise,
                as: 'exercise',
                attributes: [],
                include: {
                    model: Level,
                    attributes: ["id", "name"]
                }
            },
            group: ["exercise.Level.id", "exercise.Level.name"]
        });

        const lastAttempts = await UserExerciseAttempt.findAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]],
            limit: 10,
            include: {
                model: Exercise,
                as: 'exercise',
                attributes: ["id", "type"]
            }
        });

        res.json({
            global: {
                attempts: totalAttempts,
                correct: totalCorrectGaps || 0,
                score: Number(globalScore.toFixed(2))
            },
            byCategory: progressByCategory,
            byLevel: progressByLevel,
            lastAttempts,
            syllabus: {
                total: totalExercises,
                completed: completedUniqueExercises
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting user progress" });
    }
};

export const getMyAiUsage = async (req, res) => {
    try {
        const user = req.user;
        const today = new Date().toISOString().split("T")[0];

        const usage = await AiUsageDaily.findOne({
            where: {
                user_id: user.id,
                date: today
            }
        });

        const isExpired = user.subscription_expires_at && new Date() > new Date(user.subscription_expires_at);
        const effectiveRole = (user.subscription_role !== "free" && isExpired) ? "free" : user.subscription_role;
        const limit = AI_LIMITS[effectiveRole] ?? 0;

        const used = usage?.used ?? 0;

        return res.json({
            date: today,
            subscription: user.subscription_role,
            is_expired: !!isExpired,
            expiration_date: user.subscription_expires_at,
            effective_role: effectiveRole,
            used,
            remaining: Math.max(limit - used, 0),
            limit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching AI usage" });
    }
};

export const changeRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = req.user;

        if (!role || !Object.keys(AI_LIMITS).includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        user.subscription_role = role;
        await user.save();

        res.json({ message: "Role changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error changing role" });
    }
};

export const userInformation = async (req, res) => {
    try {
        const userData = req.user;
        await resetStreakIfNeeded(userData);

        const user = userData.toJSON();
        delete user.password_hash;
        if (user.subscription_expires_at && new Date() > new Date(user.subscription_expires_at)) {
            user.subscription_role = "free";
        }
        res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user information" });
    }
};

export const updateUserInfo = async (req, res) => {
    try {
        const user = req.user;
        const { name, username } = req.body;

        if (!name && !username) {
            return res.status(400).json({ message: "At least one field (name or username) is required" });
        }

        if (name) user.name = name;
        if (username) {
            // Check if username already exists
            const { User } = await import("../models/User.js");
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser && existingUser.id !== user.id) {
                return res.status(400).json({ message: "Username already taken" });
            }
            user.username = username;
        }

        await user.save();
        const updatedUser = user.toJSON();
        delete updatedUser.password_hash;

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user information" });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const user = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }

        // Verify current password
        const bcrypt = await import("bcrypt");
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password_hash = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating password" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = req.user;
        await user.destroy();
        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting account" });
    }
};

export const getNumberOfAttemptsToday = async (req, res) => {
    try {
        const user = req.user;
        await resetStreakIfNeeded(user);

        const today = new Date().toISOString().split("T")[0];
        const numberOfAttempts = await UserExerciseAttempt.count({ where: { user_id: user.id, created_at: { [Op.gte]: today } } });

        const dailyGoal = user.daily_goal || 5;
        const percentage = Math.min(Math.floor((numberOfAttempts / dailyGoal) * 100), 100);

        res.json({ numberOfAttempts, dailyGoal, percentage, streak: user.streak || 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting number of attempts" });
    }
};

export const updateDailyGoal = async (req, res) => {
    try {
        const user = req.user;
        const { daily_goal } = req.body;

        if (daily_goal === undefined || daily_goal < 1 || daily_goal > 100) {
            return res.status(400).json({ message: "Daily goal must be between 1 and 100" });
        }

        user.daily_goal = daily_goal;
        await user.save();

        res.json({ message: "Daily goal updated", daily_goal: user.daily_goal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating daily goal" });
    }
};

export const purchaseAvatar = async (req, res) => {
    try {
        const user = req.user;
        const { seed } = req.body;
        const AVATAR_COST = 50;

        if (!seed) {
            return res.status(400).json({ message: "Seed is required" });
        }

        if (user.coins < AVATAR_COST) {
            return res.status(400).json({ message: "Insufficient coins" });
        }

        user.coins -= AVATAR_COST;
        user.avatar_seed = seed;
        await user.save();

        res.json({
            message: "Avatar purchased successfully",
            coins: user.coins,
            avatar_seed: user.avatar_seed
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error purchasing avatar" });
    }
};



export const getGlobalRankings = async (req, res) => {
    try {
        const { User } = await import("../models/User.js");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const type = req.query.type || 'mostActive';
        const offset = (page - 1) * limit;

        let resultData = [];
        let totalCount = 0;

        if (type === 'mostActive') {
            totalCount = await UserExerciseAttempt.count({
                distinct: true,
                col: 'user_id'
            });

            const mostActive = await UserExerciseAttempt.findAll({
                attributes: [
                    'user_id',
                    [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('exercise_id'))), 'count']
                ],
                include: [{
                    model: User,
                    attributes: ['username', 'avatar_seed']
                }],
                group: ['user_id', 'User.id', 'User.username', 'User.avatar_seed'],
                order: [[Sequelize.literal('count'), 'DESC']],
                limit: limit,
                offset: offset,
                subQuery: false
            });

            resultData = mostActive.map(item => {
                const plain = item.get({ plain: true });
                return {
                    username: plain.User?.username || 'Unknown',
                    avatar_seed: plain.User?.avatar_seed,
                    value: parseInt(plain.count)
                };
            });

        } else if (type === 'highestAverage') {
            totalCount = await UserExerciseAttempt.count({
                distinct: true,
                col: 'user_id'
            });

            const highestAvg = await UserExerciseAttempt.findAll({
                attributes: [
                    'user_id',
                    [Sequelize.fn('AVG', Sequelize.col('score')), 'average']
                ],
                include: [{
                    model: User,
                    attributes: ['username', 'avatar_seed']
                }],
                group: ['user_id', 'User.id', 'User.username', 'User.avatar_seed'],
                order: [[Sequelize.literal('average'), 'DESC']],
                limit: limit,
                offset: offset,
                subQuery: false
            });

            resultData = highestAvg.map(item => {
                const plain = item.get({ plain: true });
                return {
                    username: plain.User?.username || 'Unknown',
                    avatar_seed: plain.User?.avatar_seed,
                    value: parseFloat(plain.average)
                };
            });
        }

        res.json({
            data: resultData,
            meta: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching rankings:", error);
        res.status(500).json({ message: "Error fetching global rankings" });
    }
};
