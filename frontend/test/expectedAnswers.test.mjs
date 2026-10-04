import test from "node:test";
import assert from "node:assert/strict";
import {
  formatExpectedAnswers,
  getExpectedAnswerFeedback
} from "../src/lib/expectedAnswers.mjs";

test("formats scalar answers without losing accepted alternatives", () => {
  assert.equal(formatExpectedAnswers("  take part in / participate in  "), "take part in / participate in");
  assert.equal(formatExpectedAnswers(["has gone", "went"]), "has gone / went");
});

test("formats numbered answer maps in numeric order and keeps each gap alternatives", () => {
  assert.equal(
    formatExpectedAnswers({
      8: "take part in / participate in",
      2: ["make", "do"],
      1: "as"
    }),
    "1. as\n2. make / do\n8. take part in / participate in"
  );
});

test("parses JSON answer maps and suppresses empty or malformed values", () => {
  assert.equal(formatExpectedAnswers('{"2":"second","1":"first"}'), "1. first\n2. second");
  assert.equal(formatExpectedAnswers('{"unfinished":'), "");
  assert.equal(formatExpectedAnswers(undefined), "");
  assert.equal(formatExpectedAnswers({ model_answer: "A model answer." }), "A model answer.");
});

test("only exposes the expected answer after an incorrect submission", () => {
  const answer = { 2: "second", 1: "first" };
  assert.equal(getExpectedAnswerFeedback("idle", answer), null);
  assert.equal(getExpectedAnswerFeedback("correct", answer), null);
  assert.equal(getExpectedAnswerFeedback("incorrect", answer), "1. first\n2. second");
});
