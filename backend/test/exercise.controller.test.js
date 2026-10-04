import test from "node:test";
import assert from "node:assert/strict";
import { Exercise } from "../src/models/Exercise.js";
import { getExercises, getExerciseById } from "../src/controllers/exercise.controller.js";

const originalMethods = {
    findAndCountAll: Exercise.findAndCountAll,
    count: Exercise.count,
    findOne: Exercise.findOne,
    findByPk: Exercise.findByPk
};

const publicFixture = () => ({
    id: 712,
    title: "B1 test exercise",
    type: "multiple_choice_cloze",
    question_text: "She ___ to school.",
    options: ["walks", "walk"],
    correct_answer: "walks",
    reading_text: "A short original passage.",
    audio_url: null,
    explanation_rule: "Third-person singular takes -s.",
    content: { exam: "B1 Preliminary", part: 1 },
    level_id: 1,
    Level: { id: 1, name: "B1" },
    Subcategory: { id: 2, name: "Multiple Choice" },
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            type: this.type,
            question_text: this.question_text,
            options: this.options,
            correct_answer: this.correct_answer,
            correctAnswer: this.correct_answer,
            reading_text: this.reading_text,
            audio_url: this.audio_url,
            explanation_rule: this.explanation_rule,
            content: this.content,
            level_id: this.level_id,
            Level: this.Level,
            Subcategory: this.Subcategory
        };
    }
});

const response = () => ({
    statusCode: 200,
    body: undefined,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

const asJson = (body) => JSON.parse(JSON.stringify(body));

test("exercise list omits answer keys while preserving practice content", async (t) => {
    const exercise = publicFixture();
    let query;
    Exercise.findAndCountAll = async (options) => {
        query = options;
        return { count: 1, rows: [exercise] };
    };
    Exercise.count = async () => 0;
    t.after(() => Object.assign(Exercise, originalMethods));

    const res = response();
    await getExercises({ query: {} }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(query.attributes.includes("correct_answer"), false);
    const item = res.body.exercises[0];
    assert.equal("correct_answer" in item, false);
    assert.equal("correctAnswer" in item, false);
    assert.equal(item.questionText, "She ___ to school.");
    assert.deepEqual(item.options, ["walks", "walk"]);
});

test("random exercise response omits answer keys", async (t) => {
    const exercise = publicFixture();
    let query;
    Exercise.findOne = async (options) => {
        query = options;
        return exercise;
    };
    t.after(() => Object.assign(Exercise, originalMethods));

    const res = response();
    await getExercises({ query: { random: "true" } }, res);

    const item = asJson(res.body);
    assert.equal(query.attributes?.exclude?.includes("correct_answer"), true);
    assert.equal("correct_answer" in item, false);
    assert.equal("correctAnswer" in item, false);
    assert.equal(item.question_text, "She ___ to school.");
});

test("exercise detail omits answer keys while preserving reading content", async (t) => {
    const exercise = publicFixture();
    let query;
    Exercise.findByPk = async (_id, options) => {
        query = options;
        return exercise;
    };
    t.after(() => Object.assign(Exercise, originalMethods));

    const res = response();
    await getExerciseById({ params: { id: "712" } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(query.attributes?.exclude?.includes("correct_answer"), true);
    assert.equal("correct_answer" in res.body, false);
    assert.equal("correctAnswer" in res.body, false);
    assert.equal(res.body.questionText, "She ___ to school.");
    assert.equal(res.body.readingText, "A short original passage.");
    assert.deepEqual(res.body.options, ["walks", "walk"]);
});
