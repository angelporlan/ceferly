import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCategoriesPayload } from "../src/lib/categoriesData.mjs";

test("keeps populated categories and removes empty subcategories", () => {
  const categories = normalizeCategoriesPayload([
    {
      id: 4,
      name: "Use of English",
      subcategories: [
        { id: 41, name: "Part 1", description: "Cloze", category_id: 4, totalItems: 36 },
        { id: 42, name: "Empty part", description: "No exercises", category_id: 4, totalItems: 0 },
      ],
    },
    {
      id: 5,
      name: "Listening",
      subcategories: [{ id: 51, name: "No audio", totalItems: 0 }],
    },
  ]);

  assert.deepEqual(categories, [
    {
      id: 4,
      name: "Use of English",
      subcategories: [
        { id: 41, name: "Part 1", description: "Cloze", categoryId: 4 },
      ],
    },
  ]);
});

test("treats a valid but unpopulated catalog as empty", () => {
  assert.deepEqual(normalizeCategoriesPayload([]), []);
  assert.deepEqual(normalizeCategoriesPayload([{ id: 1, name: "Empty", subcategories: [] }]), []);
});

test("rejects a malformed categories response", () => {
  assert.equal(normalizeCategoriesPayload(null), null);
  assert.equal(normalizeCategoriesPayload({ data: [] }), null);
});
