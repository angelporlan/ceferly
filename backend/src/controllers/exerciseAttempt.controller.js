import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { Exercise } from "../models/Exercise.js";
import { Subcategory } from "../models/Subcategory.js";
import { AttemptExplanation } from "../models/AttemptExplanation.js";
import { Category } from "../models/Category.js";
import { recordExerciseAttempt, NO_HEARTS_CODE, EXERCISE_NOT_FOUND_CODE } from "../services/attempt.service.js";

const normalizeAnswer = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim().toLowerCase();
    }

    if (Array.isArray(value)) {
        return JSON.stringify(value);
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value).trim().toLowerCase();
};

const getAnswerValue = (answers, key) => {
    if (!answers || typeof answers !== "object") {
        return undefined;
    }

    if (Object.prototype.hasOwnProperty.call(answers, key)) {
        return answers[key];
    }

    const numericKey = Number(key);
    if (!Number.isNaN(numericKey) && Object.prototype.hasOwnProperty.call(answers, numericKey)) {
        return answers[numericKey];
    }

    return undefined;
};

const sortAnswerKeys = (keys) =>
    [...keys].sort((left, right) => {
        const leftNumber = Number(left);
        const rightNumber = Number(right);

        if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
            return leftNumber - rightNumber;
        }

        return String(left).localeCompare(String(right), undefined, { numeric: true });
    });

const buildMarkedAnswers = (userAnswer, correctAnswer) => {
    const answerMap = correctAnswer && typeof correctAnswer === "object"
        ? correctAnswer
        : {};

    const keys = sortAnswerKeys(new Set([
        ...Object.keys(answerMap),
        ...Object.keys(userAnswer || {})
    ]));

    return keys.map((key) => {
        const userValue = getAnswerValue(userAnswer, key);
        const correctValue = getAnswerValue(answerMap, key);
        const isCorrect = normalizeAnswer(userValue) === normalizeAnswer(correctValue);

        return {
            question_id: Number.isNaN(Number(key)) ? key : Number(key),
            user_answer: userValue ?? null,
            correct_answer: correctValue ?? null,
            is_correct: isCorrect,
            status: isCorrect ? "correct" : "incorrect"
        };
    });
};

const serializeAttemptSummary = (attempt) => {
    const attemptJson = attempt.toJSON();
    const exercise = attemptJson.exercise;

    return {
        id: attemptJson.id,
        created_at: attemptJson.created_at,
        total_gaps: attemptJson.total_gaps,
        correct_gaps: attemptJson.correct_gaps,
        score: attemptJson.score,
        is_fully_correct: attemptJson.is_fully_correct,
        exercise: exercise ? {
            id: exercise.id,
            title: exercise.title,
            type: exercise.type,
            subcategory: exercise.Subcategory ? {
                id: exercise.Subcategory.id,
                name: exercise.Subcategory.name,
                category: exercise.Subcategory.Category ? {
                    id: exercise.Subcategory.Category.id,
                    name: exercise.Subcategory.Category.name
                } : null
            } : null
        } : null
    };
};

export const createExerciseAttempt = async (req, res) => {
    try {
        const { id: exerciseId } = req.params;
        const {
            user_answer,
            userAnswer,
            total_gaps,
            totalGaps
        } = req.body;

        const resolvedUserAnswer = user_answer !== undefined ? user_answer : userAnswer;
        const resolvedTotalGaps = total_gaps !== undefined ? total_gaps : (totalGaps !== undefined ? totalGaps : 1);

        const { attempt, rewards, scored } = await recordExerciseAttempt({
            user: req.user,
            exerciseId,
            userAnswer: resolvedUserAnswer,
            totalGaps: resolvedTotalGaps
        });

        res.status(201).json({
            message: "Attempt saved",
            attempt,
            rewards,
            scored
        });
    } catch (error) {
        if (error.code === EXERCISE_NOT_FOUND_CODE) {
            return res.status(404).json({ message: "Exercise not found" });
        }
        if (error.code === NO_HEARTS_CODE) {
            return res.status(403).json({
                message: "No hearts remaining",
                hearts: req.user?.hearts ?? 0,
                playBlocked: true
            });
        }
        console.error(error);
        res.status(500).json({ message: "Error saving attempt" });
    }
};

export const getExerciseAttemptById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const attempt = await UserExerciseAttempt.findOne({
            where: {
                id,
                user_id: userId
            },
            include: [
                {
                    model: Exercise,
                    as: 'exercise',
                    include: [{
                        model: Subcategory
                    }]
                },
                {
                    model: AttemptExplanation
                }
            ]
        });

        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }

        const attemptJson = attempt.toJSON();
        const markedAnswers = buildMarkedAnswers(
            attemptJson.user_answer,
            attemptJson.exercise?.correct_answer
        );

        res.json({
            ...attemptJson,
            marked_answers: markedAnswers,
            feedback_summary: {
                total: markedAnswers.length,
                correct: markedAnswers.filter((answer) => answer.is_correct).length,
                incorrect: markedAnswers.filter((answer) => !answer.is_correct).length
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching attempt" });
    }
};

export const getUserAttempts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, category } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = { user_id: userId };
        const subcategoryInclude = {
            model: Subcategory,
            attributes: ['id', 'name'],
            required: category && category !== 'Todos'
        };

        if (category && category !== 'Todos') {
            subcategoryInclude.include = [{
                model: Category,
                attributes: ['id', 'name'],
                where: { name: category },
                required: true
            }];
        }

        const includeClause = [
            {
                model: Exercise,
                as: 'exercise',
                attributes: ['id', 'title', 'type'],
                required: category && category !== 'Todos',
                include: [subcategoryInclude]
            }
        ];

        const total = await UserExerciseAttempt.count({
            where: whereClause,
            include: category && category !== 'Todos' ? [
                {
                    model: Exercise,
                    as: 'exercise',
                    required: true,
                    include: [{
                        model: Subcategory,
                        required: true,
                        attributes: ['id', 'name'],
                        include: [{
                            model: Category,
                            attributes: ['id', 'name'],
                            where: { name: category },
                            required: true
                        }]
                    }]
                }
            ] : [],
            distinct: true
        });

        const attempts = await UserExerciseAttempt.findAll({
            where: whereClause,
            attributes: ['id', 'correct_gaps', 'total_gaps', 'created_at', 'score', 'is_fully_correct'],
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            attempts: attempts.map((attempt) => ({
                ...serializeAttemptSummary(attempt),
                accuracy: attempt.total_gaps > 0
                    ? Math.round((attempt.correct_gaps / attempt.total_gaps) * 100)
                    : 0
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user attempts" });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sequelize } = await import('../config/db.js');

        const stats = await UserExerciseAttempt.findOne({
            where: { user_id: userId },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [
                    sequelize.literal('ROUND(AVG((correct_gaps * 100.0) / NULLIF(total_gaps, 0)))'),
                    'average'
                ]
            ],
            raw: true
        });

        res.json({
            total: stats ? parseInt(stats.total) : 0,
            average: stats ? parseFloat(stats.average || 0) : 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user stats" });
    }
};
