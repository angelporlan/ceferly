import { Exercise } from "../models/Exercise.js";
import { Level } from "../models/Level.js";
import { Subcategory } from "../models/Subcategory.js";
import { loadCambridgeCatalog, toSeedRecord } from "../cambridge/contentCatalog.js";

export const seedCambridgeUseOfEnglish = async () => {
    const catalog = loadCambridgeCatalog().map(toSeedRecord);
    const levels = await Level.findAll();
    const levelMap = Object.fromEntries(levels.map((level) => [level.name, level.id]));
    const subcategories = await Subcategory.findAll();
    const subcategoryMap = Object.fromEntries(subcategories.map((sub) => [sub.name, sub.id]));

    for (const record of catalog) {
        const levelId = levelMap[record.level_name];
        const subcategoryId = subcategoryMap[record.subcategory_name];

        if (!levelId || !subcategoryId) {
            throw new Error(`Missing level ${record.level_name} or subcategory ${record.subcategory_name}`);
        }

        const [exercise, created] = await Exercise.findOrCreate({
            where: { title: record.title },
            defaults: {
                type: record.type,
                title: record.title,
                question_text: record.question_text,
                options: record.options,
                correct_answer: record.correct_answer,
                reading_text: record.reading_text,
                explanation_rule: record.explanation_rule,
                content: record.content,
                level_id: levelId,
                subcategory_id: subcategoryId
            }
        });

        if (!created && (!exercise.explanation_rule || exercise.level_id !== levelId)) {
            exercise.type = record.type;
            exercise.question_text = record.question_text;
            exercise.options = record.options;
            exercise.correct_answer = record.correct_answer;
            exercise.reading_text = record.reading_text;
            exercise.explanation_rule = record.explanation_rule;
            exercise.content = record.content;
            exercise.level_id = levelId;
            exercise.subcategory_id = subcategoryId;
            await exercise.save();
        }
    }

    console.log(`Cambridge Use of English catalog seeded (${catalog.length} items).`);
};
