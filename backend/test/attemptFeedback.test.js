import test from "node:test";
import assert from "node:assert/strict";
import { buildMarkedAnswers } from "../src/services/attempt-feedback.js";

test("buildMarkedAnswers treats a correct scalar as one complete answer", () => {
    assert.deepEqual(buildMarkedAnswers("Catch", "catch"), [
        {
            question_id: 0,
            user_answer: "Catch",
            correct_answer: "catch",
            is_correct: true,
            status: "correct"
        }
    ]);
});

test("buildMarkedAnswers treats an incorrect scalar as one complete answer", () => {
    const markedAnswers = buildMarkedAnswers("do", "catch");

    assert.equal(markedAnswers.length, 1);
    assert.equal(markedAnswers[0].user_answer, "do");
    assert.equal(markedAnswers[0].correct_answer, "catch");
    assert.equal(markedAnswers[0].is_correct, false);
    assert.equal(markedAnswers[0].status, "incorrect");
});

test("buildMarkedAnswers preserves per-gap results for multipart answers", () => {
    const markedAnswers = buildMarkedAnswers(
        { 1: "catch", 2: "quickly" },
        { 1: "catch", 2: "slowly" }
    );

    assert.deepEqual(markedAnswers.map(({ question_id, is_correct, status }) => ({
        question_id,
        is_correct,
        status
    })), [
        { question_id: 1, is_correct: true, status: "correct" },
        { question_id: 2, is_correct: false, status: "incorrect" }
    ]);
});
