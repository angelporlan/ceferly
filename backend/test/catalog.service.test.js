import test from "node:test";
import assert from "node:assert/strict";
import { attachCountsAndDropEmpty, countMapFromRows } from "../src/services/catalog.service.js";

test("drops empty subcategories and categories with no remaining nodes", () => {
    const tree = attachCountsAndDropEmpty(
        [
            {
                id: 1,
                name: "Grammar",
                subcategories: [
                    { id: 1, name: "Tenses", category_id: 1 },
                    { id: 2, name: "Conditionals", category_id: 1 }
                ]
            },
            {
                id: 4,
                name: "Listening",
                subcategories: [{ id: 10, name: "Short Dialogues", category_id: 4 }]
            }
        ],
        { 2: 40 }
    );

    assert.equal(tree.length, 1);
    assert.equal(tree[0].name, "Grammar");
    assert.equal(tree[0].subcategories.length, 1);
    assert.equal(tree[0].subcategories[0].name, "Conditionals");
    assert.equal(tree[0].subcategories[0].totalItems, 40);
    assert.equal(tree[0].subcategories[0].categoryId, 1);
});

test("keeps every Use of English part that has exercises", () => {
    const tree = attachCountsAndDropEmpty(
        [
            {
                id: 5,
                name: "Use of English",
                subcategories: [
                    { id: 12, name: "Multiple Choice" },
                    { id: 13, name: "Gap Fill" },
                    { id: 14, name: "Word Formation" },
                    { id: 15, name: "Key Word Transformation" }
                ]
            }
        ],
        { 12: 9, 13: 9, 14: 9, 15: 9 }
    );

    assert.equal(tree[0].subcategories.map((sub) => sub.name).join(","),
        "Multiple Choice,Gap Fill,Word Formation,Key Word Transformation");
});

test("countMapFromRows reads Sequelize grouped counts", () => {
    const map = countMapFromRows([
        { subcategory_id: 2, totalItems: "40" },
        { subcategoryId: 12, total_items: 9 }
    ]);
    assert.equal(map[2], 40);
    assert.equal(map[12], 9);
});
