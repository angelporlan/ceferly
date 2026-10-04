import test from "node:test";
import assert from "node:assert/strict";
import { CAMBRIDGE_UOE_EXERCISES } from "../src/cambridge/uoeCatalog.js";

const findB1Part4Exercise = (number) =>
    CAMBRIDGE_UOE_EXERCISES.find(
        (exercise) =>
            exercise.level === "B1" &&
            exercise.part === 4 &&
            exercise.title.endsWith(`(#${number})`)
    );

test("B1 Part 4 #3 and #5 accept only 2–5-word answers containing the keyword", () => {
    const violations = [];

    for (const number of [3, 5]) {
        const exercise = findB1Part4Exercise(number);
        assert.ok(exercise, `B1 Part 4 #${number} should exist in the catalog`);

        for (const answer of exercise.correct_answer.split("/").map((part) => part.trim())) {
            const wordCount = answer.split(/\s+/).length;
            if (wordCount < 2 || wordCount > 5) {
                violations.push(`#${number} answer "${answer}" has ${wordCount} word(s)`);
            }
            if (!new RegExp(`\\b${exercise.keyword}\\b`, "i").test(answer)) {
                violations.push(`#${number} answer "${answer}" omits ${exercise.keyword}`);
            }
        }
    }

    assert.deepEqual(violations, []);
});

test("B1 Part 4 #3 and #5 preserve their meaning with natural transformations", () => {
    const photography = findB1Part4Exercise(3);
    assert.deepEqual(
        {
            original: photography.original,
            question: photography.question_text,
            keyword: photography.keyword,
            answers: photography.correct_answer
        },
        {
            original: "Marta is interested in photography.",
            question: "Photography ______ Marta.",
            keyword: "INTEREST",
            answers: "is of interest to"
        }
    );

    const cancelledMatch = findB1Part4Exercise(5);
    assert.deepEqual(
        {
            original: cancelledMatch.original,
            question: cancelledMatch.question_text,
            keyword: cancelledMatch.keyword,
            answers: cancelledMatch.correct_answer
        },
        {
            original: "They cancelled the match because of the rain.",
            question: "The match ______ the rain.",
            keyword: "BECAUSE",
            answers: "was cancelled because of"
        }
    );
});
