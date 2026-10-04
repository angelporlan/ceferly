import test from "node:test";
import assert from "node:assert/strict";
import { formatCorrectAnswer } from "../src/lib/answerDisplay.mjs";

test("keeps a scalar expected answer readable", () => {
  assert.equal(formatCorrectAnswer("happiness"), "happiness");
});

test("formats numbered answer maps in numeric order and preserves alternatives", () => {
  const formatted = formatCorrectAnswer({
    "10": "ten",
    "2": "two / second",
  });

  assert.equal(formatted, "2. two / second · 10. ten");
  assert.equal(formatted.includes("[object Object]"), false);
  assert.equal(formatted.startsWith("{"), false);
});

test("returns no display text for missing or empty answers", () => {
  assert.equal(formatCorrectAnswer(undefined), "");
  assert.equal(formatCorrectAnswer(null), "");
  assert.equal(formatCorrectAnswer({}), "");
});
