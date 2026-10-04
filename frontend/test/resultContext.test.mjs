import test from "node:test";
import assert from "node:assert/strict";
import { hasValidResultContext } from "../src/lib/resultContext.mjs";

test("accepts result state emitted by the exercise player", () => {
  assert.equal(hasValidResultContext({ exerciseId: 12, isCorrect: false, hearts: 4, coins: 18 }), true);
});

test("rejects absent or incomplete result state", () => {
  assert.equal(hasValidResultContext(null), false);
  assert.equal(hasValidResultContext({ exerciseId: 12 }), false);
  assert.equal(hasValidResultContext({ isCorrect: true }), false);
  assert.equal(hasValidResultContext({ exerciseId: "12", isCorrect: true }), false);
});
