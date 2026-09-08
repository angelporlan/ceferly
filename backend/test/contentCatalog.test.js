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
