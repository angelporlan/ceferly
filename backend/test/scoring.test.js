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
