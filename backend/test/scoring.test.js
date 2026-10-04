import test from "node:test";
import assert from "node:assert/strict";
import {
    answersMatch,
    scoreAttempt,
    scoreWritingSubmission,
    MAX_WRITING_CHARACTERS
} from "../src/services/scoring.js";

test("answersMatch accepts slash alternatives and ignores case", () => {
    assert.equal(answersMatch("haven't been to", "have not been to / haven't been to"), true);
    assert.equal(answersMatch("Catch", "catch"), true);
    assert.equal(answersMatch("go", "catch"), false);
});

test("scoreAttempt marks a matching key as fully correct", () => {
    const correct = scoreAttempt({ userAnswer: "despite having", correctAnswer: "despite having / despite her" });
    assert.equal(correct.isFullyCorrect, true);
    assert.equal(correct.score, 100);

    const wrong = scoreAttempt({ userAnswer: "although", correctAnswer: "despite having" });
    assert.equal(wrong.isFullyCorrect, false);
    assert.equal(wrong.score, 0);
});

test("writing submissions stay ungraded and reject empty or oversized text", () => {
    const text = "I believe transport can improve.\n\nPeople should use buses more often.";
    assert.deepEqual(scoreWritingSubmission(text), {
        isFullyCorrect: false,
        totalGaps: 0,
        correctGaps: 0,
        score: 0,
        gradingStatus: "pending_feedback"
    });
    assert.throws(() => scoreWritingSubmission("  \n "), { code: "EMPTY_WRITING_ANSWER" });
    assert.throws(() => scoreWritingSubmission("x".repeat(MAX_WRITING_CHARACTERS + 1)), {
        code: "WRITING_ANSWER_TOO_LONG"
    });
});

test("scoreAttempt scores each numbered answer against its matching key", () => {
    const result = scoreAttempt({
        userAnswer: { 1: "alternative", 2: "second", 8: "last" },
        correctAnswer: { 1: "first / alternative", 2: "second", 8: "last" },
        totalGaps: 1
    });

    assert.deepEqual(result, {
        isFullyCorrect: true,
        totalGaps: 3,
        correctGaps: 3,
        score: 100
    });
});

test("scoreAttempt preserves a partial count and percentage for numbered answers", () => {
    const result = scoreAttempt({
        userAnswer: { 1: "first", 2: "wrong", 3: "third" },
        correctAnswer: { 1: "first", 2: "second", 3: "third" }
    });

    assert.deepEqual(result, {
        isFullyCorrect: false,
        totalGaps: 3,
        correctGaps: 2,
        score: 67
    });
});

test("scoreAttempt does not accept a correct answer assigned to another gap", () => {
    const result = scoreAttempt({
        userAnswer: { 1: "second", 2: "first" },
        correctAnswer: { 1: "first", 2: "second" }
    });

    assert.deepEqual(result, {
        isFullyCorrect: false,
        totalGaps: 2,
        correctGaps: 0,
        score: 0
    });
});

test("scoreAttempt supports a legacy scalar answer for a single numbered gap", () => {
    const result = scoreAttempt({
        userAnswer: "right",
        correctAnswer: { 4: "right" },
        totalGaps: 9
    });

    assert.deepEqual(result, {
        isFullyCorrect: true,
        totalGaps: 1,
        correctGaps: 1,
        score: 100
    });
});
