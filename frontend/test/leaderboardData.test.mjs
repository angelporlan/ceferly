import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRankingPayload } from "../src/lib/leaderboardData.mjs";

test("normalizes the paginated global-coins API response", () => {
  const rows = normalizeRankingPayload({
    data: [
      { id: 24, name: "Ada Lovelace", username: "ada", streak: 6, coins: 135, score: 135 },
    ],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  });

  assert.deepEqual(rows, [
    { id: 24, rank: 1, name: "Ada Lovelace", username: "ada", streak: 6, coins: 135 },
  ]);
});

test("keeps array responses and falls back to legacy score fields", () => {
  const rows = normalizeRankingPayload([
    { username: "grace", score: 40, streak: "2" },
    { username: "linus", value: 18 },
  ]);

  assert.deepEqual(rows, [
    { id: 1, rank: 1, name: "grace", username: "grace", streak: 2, coins: 40 },
    { id: 2, rank: 2, name: "linus", username: "linus", streak: 0, coins: 18 },
  ]);
});

test("returns an empty list for malformed ranking payloads", () => {
  assert.deepEqual(normalizeRankingPayload(null), []);
  assert.deepEqual(normalizeRankingPayload({ data: "not-an-array" }), []);
});
