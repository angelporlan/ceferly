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

    assert.ok(stats.total >= 100, `expected >= 100 exercises, got ${stats.total}`);
    assert.equal(stats.withExplanationRule, stats.total);
    assert.deepEqual(stats.levels, ["B1", "B2", "C1"]);
    assert.deepEqual(stats.parts, [1, 2, 3, 4]);
    assert.equal(bar.ok, true);
    assert.equal(bar.missingLevels.length, 0);
    assert.equal(bar.missingParts.length, 0);
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

test("C1 Part 1 policy clause has one intended completion", () => {
    const item = loadCambridgeCatalog().find(
        (exercise) => exercise.level === "C1" && exercise.part === 1 && exercise.title.endsWith("(#1)")
    );

    assert.ok(item, "C1 Part 1 #1 must exist");
    assert.equal(
        item.question_text,
        'The judge ______ the phrase "within thirty days" to mean that the deadline ran from the invoice date.'
    );
    assert.deepEqual(item.options, ["interpreted", "translated", "memorised", "scheduled"]);
    assert.equal(item.correct_answer, "interpreted");
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
