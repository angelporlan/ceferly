import { Level } from "../models/Level.js";
import { Exercise } from "../models/Exercise.js";

export const getLevels = async (req, res) => {
    try {
        const levels = await Level.findAll({ order: [["id", "ASC"]] });
        const withCounts = await Promise.all(levels.map(async (level) => {
            const totalExercises = await Exercise.count({ where: { level_id: level.id } });
            return {
                id: level.id,
                name: level.name,
                exam:
                    level.name === "B1" ? "B1 Preliminary"
                        : level.name === "B2" ? "B2 First"
                            : level.name === "C1" ? "C1 Advanced"
                                : level.name === "C2" ? "C2 Proficiency"
                                    : level.name,
                totalExercises
            };
        }));

        res.json(withCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching levels" });
    }
};
