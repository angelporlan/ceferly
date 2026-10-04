import "./setupEnv.js";
import test from "node:test";
import assert from "node:assert/strict";
import { getExerciseAttemptById } from "../src/controllers/exerciseAttempt.controller.js";
import { UserExerciseAttempt } from "../src/models/UserExerciseAttempt.js";

test("getExerciseAttemptById returns one correct mark for a scalar answer", async () => {
    const originalFindOne = UserExerciseAttempt.findOne;
    const attemptId = 42;
    const userId = 7;
    const attemptRecord = {
        toJSON: () => ({
            id: attemptId,
            user_id: userId,
            user_answer: "Catch",
            is_fully_correct: true,
            exercise: { correct_answer: "catch" }
        })
    };
    let queryOptions;
    let responseBody;

    UserExerciseAttempt.findOne = async (options) => {
        queryOptions = options;
        return attemptRecord;
    };

    try {
        await getExerciseAttemptById(
            { user: { id: userId }, params: { id: attemptId } },
            { json: (body) => { responseBody = body; } }
        );
    } finally {
        UserExerciseAttempt.findOne = originalFindOne;
    }

    assert.deepEqual(queryOptions.where, { id: attemptId, user_id: userId });
    assert.deepEqual(responseBody.marked_answers, [
        {
            question_id: 0,
            user_answer: "Catch",
            correct_answer: "catch",
            is_correct: true,
            status: "correct"
        }
    ]);
    assert.deepEqual(responseBody.feedback_summary, { total: 1, correct: 1, incorrect: 0 });
});
