const normalizeAnswer = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim().toLowerCase();
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === "object") return JSON.stringify(value);
    return String(value).trim().toLowerCase();
};

const toAnswerMap = (value) => {
    if (value === null || value === undefined) return {};
    if (typeof value === "object") return value;
    return { 0: value };
};

const getAnswerValue = (answers, key) => {
    if (!answers || typeof answers !== "object") return undefined;

    if (Object.prototype.hasOwnProperty.call(answers, key)) {
        return answers[key];
    }

    const numericKey = Number(key);
    if (!Number.isNaN(numericKey) && Object.prototype.hasOwnProperty.call(answers, numericKey)) {
        return answers[numericKey];
    }

    return undefined;
};

const sortAnswerKeys = (keys) =>
    [...keys].sort((left, right) => {
        const leftNumber = Number(left);
        const rightNumber = Number(right);

        if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
            return leftNumber - rightNumber;
        }

        return String(left).localeCompare(String(right), undefined, { numeric: true });
    });

export const buildMarkedAnswers = (userAnswer, correctAnswer) => {
    const answerMap = toAnswerMap(correctAnswer);
    const userAnswerMap = toAnswerMap(userAnswer);
    const keys = sortAnswerKeys(new Set([
        ...Object.keys(answerMap),
        ...Object.keys(userAnswerMap)
    ]));

    return keys.map((key) => {
        const userValue = getAnswerValue(userAnswerMap, key);
        const correctValue = getAnswerValue(answerMap, key);
        const isCorrect = normalizeAnswer(userValue) === normalizeAnswer(correctValue);

        return {
            question_id: Number.isNaN(Number(key)) ? key : Number(key),
            user_answer: userValue ?? null,
            correct_answer: correctValue ?? null,
            is_correct: isCorrect,
            status: isCorrect ? "correct" : "incorrect"
        };
    });
};
