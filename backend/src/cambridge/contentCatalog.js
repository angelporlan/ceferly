import { CAMBRIDGE_UOE_EXERCISES } from "./uoeCatalog.js";

const REQUIRED_PARTS = [1, 2, 3, 4];
const REQUIRED_LEVELS = ["B1", "B2", "C1"];

export const TYPE_TO_SUBCATEGORY = {
    multiple_choice_cloze: "Multiple Choice",
    open_cloze: "Gap Fill",
    word_formation: "Word Formation",
    key_word_transformation: "Key Word Transformation"
};

export const loadCambridgeCatalog = () => CAMBRIDGE_UOE_EXERCISES;

export const getCambridgeContentStats = (items = loadCambridgeCatalog()) => {
    const levels = new Set();
    const parts = new Set();
    let withRule = 0;

    for (const item of items) {
        if (item.level) levels.add(item.level);
        if (item.part) parts.add(item.part);
        if (item.explanation_rule && String(item.explanation_rule).trim()) {
            withRule += 1;
        }
    }

    return {
        total: items.length,
        withExplanationRule: withRule,
        levels: [...levels].sort(),
        parts: [...parts].sort((a, b) => a - b)
    };
};

export const assertCambridgeContentBar = (items = loadCambridgeCatalog()) => {
    const stats = getCambridgeContentStats(items);
    const missingLevels = REQUIRED_LEVELS.filter((level) => !stats.levels.includes(level));
    const missingParts = REQUIRED_PARTS.filter((part) => !stats.parts.includes(part));

    return {
        ok:
            stats.total >= 100 &&
            stats.withExplanationRule === stats.total &&
            missingLevels.length === 0 &&
            missingParts.length === 0,
        stats,
        missingLevels,
        missingParts
    };
};

export const toSeedRecord = (item) => ({
    type: item.type,
    title: item.title,
    question_text: item.question_text,
    options: item.options ?? [],
    correct_answer: item.correct_answer,
    reading_text: item.reading_text ?? null,
    explanation_rule: item.explanation_rule,
    content: {
        exam: item.exam,
        level: item.level,
        part: item.part,
        keyword: item.keyword ?? null,
        stem: item.stem ?? null,
        original: item.original ?? null
    },
    level_name: item.level,
    subcategory_name: TYPE_TO_SUBCATEGORY[item.type] || "Multiple Choice"
});
