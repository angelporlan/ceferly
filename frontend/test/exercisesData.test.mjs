import test from "node:test";
import assert from "node:assert/strict";
import { normalizeExercisesPayload } from "../src/lib/exercisesData.mjs";

test("normalizes the paginated exercise API response", () => {
  const exercises = normalizeExercisesPayload({
    totalItems: 1,
    totalPages: 1,
    currentPage: 1,
    exercises: [
      { id: 8, title: "Use of English Part 1", type: "multiple_choice_cloze", question_text: "Choose a word.", level: { id: 2, name: "B2" } },
    ],
  });

  assert.deepEqual(exercises, [
    { id: 8, title: "Use of English Part 1", type: "multiple_choice_cloze", questionText: "Choose a word.", level: { name: "B2" } },
  ]);
});

test("keeps a valid empty array as a successful empty result", () => {
  assert.deepEqual(normalizeExercisesPayload({ exercises: [] }), []);
  assert.deepEqual(normalizeExercisesPayload([]), []);
});

test("rejects malformed exercise payloads", () => {
  assert.equal(normalizeExercisesPayload(null), null);
  assert.equal(normalizeExercisesPayload({ exercises: "invalid" }), null);
  assert.equal(normalizeExercisesPayload({ exercises: [{ title: "Missing id and type" }] }), null);
});
