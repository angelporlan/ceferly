import test from "node:test";
import assert from "node:assert/strict";
import {
    loadCambridgeCatalog,
    getCambridgeContentStats,
    assertCambridgeContentBar,
    toSeedRecord
} from "../src/cambridge/contentCatalog.js";

test("Cambridge catalog meets the B1+B2+C1 Use of English bar", () => {
    const items = loadCambridgeCatalog();
    const bar = assertCambridgeContentBar(items);
    const stats = getCambridgeContentStats(items);

    assert.equal(stats.total, 144);
    assert.equal(stats.withExplanationRule, stats.total);
    assert.deepEqual(stats.levels, ["B1", "B2", "C1"]);
    assert.deepEqual(stats.parts, [1, 2, 3, 4]);
    assert.equal(bar.ok, true);
    assert.equal(bar.missingLevels.length, 0);
    assert.equal(bar.missingParts.length, 0);
});

test("catalog has exactly 12 valid exercises for every level and part", () => {
    const items = loadCambridgeCatalog();
    const levels = ["B1", "B2", "C1"];
    const parts = [1, 2, 3, 4];
    const typeByPart = {
        1: "multiple_choice_cloze",
        2: "open_cloze",
        3: "word_formation",
        4: "key_word_transformation"
    };
    const byLevel = Object.fromEntries(levels.map((level) => [level, 0]));
    const byPart = Object.fromEntries(parts.map((part) => [part, 0]));
    const byLevelPart = new Map();
    const titles = new Set();

    for (const item of items) {
        assert.ok(levels.includes(item.level), `unexpected level for ${item.title}`);
        assert.ok(parts.includes(item.part), `unexpected part for ${item.title}`);
        assert.equal(item.type, typeByPart[item.part], `wrong activity type for ${item.title}`);
        assert.ok(item.title?.trim(), "every exercise needs a title");
        assert.ok(item.question_text?.trim(), `missing question text for ${item.title}`);
        assert.ok(item.correct_answer !== undefined && item.correct_answer !== null, `missing answer for ${item.title}`);
        assert.ok(item.explanation_rule?.trim().length > 10, `missing explanation for ${item.title}`);

        const normalizedTitle = item.title.trim().toLocaleLowerCase();
        assert.ok(!titles.has(normalizedTitle), `duplicate title: ${item.title}`);
        titles.add(normalizedTitle);
        byLevel[item.level] += 1;
        byPart[item.part] += 1;
        const cell = `${item.level}:${item.part}`;
        byLevelPart.set(cell, (byLevelPart.get(cell) || 0) + 1);

        if (item.part === 1) {
            assert.ok(item.options?.length >= 3, `Part 1 needs options: ${item.title}`);
            assert.ok(item.options.includes(item.correct_answer), `Part 1 answer must match an option: ${item.title}`);
        }
        if (item.part === 3) {
            assert.ok(item.stem?.trim(), `Part 3 needs a word stem: ${item.title}`);
        }
        if (item.part === 4) {
            assert.ok(item.keyword?.trim(), `Part 4 needs a key word: ${item.title}`);
            assert.ok(item.original?.trim(), `Part 4 needs its source sentence: ${item.title}`);
            const answer = String(item.correct_answer).trim();
            assert.ok(answer.toLowerCase().includes(item.keyword.toLowerCase()), `Part 4 answer must use its key word: ${item.title}`);
            if (/\(#(?:10|11|12)\)$/.test(item.title)) {
                const wordCount = answer.split(/\s+/).length;
                assert.ok(wordCount >= 2 && wordCount <= 5, `new Part 4 answer must contain 2–5 words: ${item.title}`);
            }
        }
    }

    assert.deepEqual(byLevel, { B1: 48, B2: 48, C1: 48 });
    assert.deepEqual(byPart, { 1: 36, 2: 36, 3: 36, 4: 36 });
    for (const level of levels) {
        for (const part of parts) {
            assert.equal(byLevelPart.get(`${level}:${part}`), 12, `${level} Part ${part} must contain 12 exercises`);
        }
    }
});

test("every catalog item maps to a seed record with explanation_rule", () => {
    const records = loadCambridgeCatalog().map(toSeedRecord);
    const types = new Set(records.map((item) => item.type));

    assert.ok(records.every((item) => item.explanation_rule && item.explanation_rule.length > 10));
    assert.ok(records.every((item) => item.level_name && item.subcategory_name));
    assert.ok(types.has("multiple_choice_cloze"));
    assert.ok(types.has("open_cloze"));
    assert.ok(types.has("word_formation"));
    assert.ok(types.has("key_word_transformation"));
});

test("C1 Part 1 uses a unique complement pattern", () => {
    const item = loadCambridgeCatalog().find(
        (exercise) => exercise.level === "C1" && exercise.part === 1 && exercise.title.endsWith("(#1)")
    );

    assert.ok(item, "C1 Part 1 #1 must exist");
    assert.equal(
        item.question_text,
        "After reviewing the contract, the judge ______ that the deadline ran from the invoice date."
    );
    assert.deepEqual(item.options, ["concluded", "translated", "memorised", "scheduled"]);
    assert.equal(item.correct_answer, "concluded");
});
test("B2 Part 4 #7 accepts only 2-5 word answers containing PREFER", () => {
    const item = loadCambridgeCatalog().find(
        (exercise) => exercise.level === "B2" && exercise.part === 4 && exercise.title.endsWith("(#7)")
    );

    assert.ok(item, "B2 Part 4 #7 must exist");
    assert.equal(item.keyword, "PREFER");
    const answers = item.correct_answer.split(/\s*\/\s*/).map((answer) => answer.trim());
    assert.ok(answers.length > 0);
    for (const answer of answers) {
        const words = answer.split(/\s+/);
        assert.ok(words.length >= 2 && words.length <= 5, `${answer} must use 2–5 words`);
        assert.ok(words.some((word) => word.toUpperCase() === item.keyword), `${answer} must contain PREFER`);
    }
});
