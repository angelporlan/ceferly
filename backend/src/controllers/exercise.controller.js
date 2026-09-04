import { Exercise } from "../models/Exercise.js";
import { Subcategory } from "../models/Subcategory.js";
import { Category } from "../models/Category.js";
import { Level } from "../models/Level.js";
import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";

import { Sequelize } from "sequelize";

export const getExercises = async (req, res) => {
    try {
        const { level, subcategory, category, type, random, page = 1, limit = 10, subcategoryId, subcategory_id } = req.query;

        const where = {};
        if (type) where.type = type;

        const targetSubcategoryId = subcategoryId || subcategory_id;

        const includeOption = [
            {
                model: Level,
                where: level ? { name: level } : undefined,
                attributes: ["id", "name"]
            }
        ];

        const subcategoryInclude = {
            model: Subcategory,
            where: targetSubcategoryId
                ? { id: targetSubcategoryId }
                : (subcategory ? { name: subcategory } : undefined),
            attributes: ["id", "name"]
        };

        if (category) {
            subcategoryInclude.include = [{
                model: Category,
                where: { name: category },
                attributes: ["id", "name"]
            }];
        }

        includeOption.push(subcategoryInclude);

        // random exercise
        if (random) {
            const exercise = await Exercise.findOne({
                where,
                include: includeOption,
                order: [Sequelize.fn('RAND')]
            });
            return res.json(exercise);
        }

        const offset = (page - 1) * limit;

        const includeOptionPagination = includeOption.map(inc => {
            const newInc = { ...inc };
            if (newInc.include && newInc.include.length > 0) {
                newInc.attributes = ['id', 'category_id'];
                newInc.include = newInc.include.map(subInc => ({ ...subInc, attributes: [] }));
            } else {
                newInc.attributes = [];
            }
            return newInc;
        });

        const userAttemptInclude = req.user?.id
            ? [{
                model: UserExerciseAttempt,
                where: { user_id: req.user.id },
                required: false,
                attributes: ['score', 'is_fully_correct', 'created_at']
            }]
            : [];

        const { count, rows } = await Exercise.findAndCountAll({
            where,
            include: [
                ...includeOptionPagination,
                ...userAttemptInclude
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: ['id', 'title', 'type', 'question_text', 'options', 'reading_text', 'correct_answer'],
            distinct: true,
            order: [
                ['id', 'ASC']
            ]
        });

        const totalCompleted = req.user?.id
            ? await Exercise.count({
                where,
                include: [
                    ...includeOption,
                    {
                        model: UserExerciseAttempt,
                        where: { user_id: req.user.id },
                        required: true
                    }
                ],
                distinct: true
            })
            : 0;

        const cleanExercises = rows.map(exercise => {
            const exJson = exercise.toJSON();
            const attempts = exJson.UserExerciseAttempts || [];
            const latestAttempt = attempts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            return {
                id: exJson.id,
                title: exJson.title,
                type: exJson.type,
                questionText: exJson.question_text,
                question_text: exJson.question_text,
                options: Array.isArray(exJson.options)
                    ? exJson.options
                    : (typeof exJson.options === 'object' && exJson.options !== null ? Object.values(exJson.options) : []),
                readingText: exJson.reading_text,
                reading_text: exJson.reading_text,
                correctAnswer: exJson.correct_answer,
                correct_answer: exJson.correct_answer,
                isCompleted: !!latestAttempt,
                score: latestAttempt ? latestAttempt.score : null
            };
        });

        res.json({
            totalItems: count,
            totalExercises: count,
            exercises: cleanExercises,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalCompleted: totalCompleted
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching exercises" });
    }
};

export const getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;

        const exercise = await Exercise.findByPk(id, {
            include: [
                {
                    model: Level,
                    attributes: ["id", "name"]
                },
                {
                    model: Subcategory,
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: Category,
                            attributes: ["id", "name"]
                        }
                    ]
                }
            ]
        });

        if (!exercise) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        const exJson = exercise.toJSON();

        let parsedOptions = [];
        if (Array.isArray(exJson.options)) {
            parsedOptions = exJson.options;
        } else if (typeof exJson.options === 'object' && exJson.options !== null) {
            parsedOptions = Object.values(exJson.options);
        }

        let formattedCorrectAnswer = exJson.correct_answer;
        if (typeof exJson.correct_answer === 'object' && exJson.correct_answer !== null && !Array.isArray(exJson.correct_answer)) {
            const keys = Object.keys(exJson.correct_answer);
            if (keys.length === 1 && exJson.correct_answer[keys[0]]) {
                formattedCorrectAnswer = exJson.correct_answer[keys[0]];
            }
        }

        const formatted = {
            ...exJson,
            questionText: exJson.question_text,
            correctAnswer: formattedCorrectAnswer,
            readingText: exJson.reading_text,
            audioUrl: exJson.audio_url,
            options: parsedOptions
        };

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching exercise" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: Subcategory
            }]
        });

        const formatted = categories.map(cat => {
            const catJson = cat.toJSON();
            const subs = catJson.Subcategories || catJson.subcategories || [];
            return {
                id: catJson.id,
                name: catJson.name,
                subcategories: subs.map(sub => ({
                    id: sub.id,
                    name: sub.name,
                    description: sub.description || `${sub.name} practice for Cambridge B2/C1`,
                    categoryId: sub.category_id || catJson.id
                }))
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

export const getSubcategories = async (req, res) => {
    try {
        const { category } = req.query;
        let where = {};

        if (category) {
            const categoryData = await Category.findOne({ where: { name: category } });

            if (!categoryData) {
                return res.status(404).json({ message: "Category not found" });
            }

            where.category_id = categoryData.id;
        }

        const subcategories = await Subcategory.findAll({ where });

        const subcategoriesWithStats = await Promise.all(subcategories.map(async (sub) => {
            const totalItems = await Exercise.count({
                where: { subcategory_id: sub.id }
            });

            const totalCompleted = req.user?.id
                ? await Exercise.count({
                    where: { subcategory_id: sub.id },
                    include: [{
                        model: UserExerciseAttempt,
                        where: { user_id: req.user.id },
                        required: true
                    }],
                    distinct: true
                })
                : 0;

            return {
                ...sub.toJSON(),
                totalItems,
                totalCompleted
            };
        }));

        res.json(subcategoriesWithStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching subcategories" });
    }
};
