const normalizeToken = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim().toLowerCase().replace(/\s+/g, " ");
};

const splitAcceptable = (value) => {
    if (value === null || value === undefined) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap(splitAcceptable);
    }

    if (typeof value === "object") {
        return Object.values(value).flatMap(splitAcceptable);
    }

    return String(value)
        .split("/")
        .map(normalizeToken)
        .filter(Boolean);
};

export const answersMatch = (userAnswer, correctAnswer) => {
    const expected = splitAcceptable(correctAnswer);
    const actual = normalizeToken(userAnswer);

    if (!expected.length) {
        return actual === normalizeToken(correctAnswer);
    }

    return expected.includes(actual);
};

const getNumberedAnswerKeys = (correctAnswer) => {
    if (correctAnswer === null || typeof correctAnswer !== "object" || Array.isArray(correctAnswer)) {
        return [];
    }

    const keys = Object.keys(correctAnswer);
    if (!keys.length || !keys.every((key) => /^\d+$/.test(key))) {
        return [];
    }

    return keys.sort((left, right) => Number(left) - Number(right));
};

const scoreNumberedAnswers = (userAnswer, correctAnswer, keys) => {
    const answers = userAnswer !== null && typeof userAnswer === "object" && !Array.isArray(userAnswer)
        ? userAnswer
        : (keys.length === 1 ? { [keys[0]]: userAnswer } : {});
    const correctGaps = keys.reduce((count, key) => (
        answersMatch(answers[key], correctAnswer[key]) ? count + 1 : count
    ), 0);
    const totalGaps = keys.length;

    return {
        isFullyCorrect: correctGaps === totalGaps,
        totalGaps,
        correctGaps,
        score: Math.round((correctGaps / totalGaps) * 100)
    };
};

export const scoreAttempt = ({ userAnswer, correctAnswer, totalGaps = 1 } = {}) => {
    const numberedKeys = getNumberedAnswerKeys(correctAnswer);
    if (numberedKeys.length) {
        return scoreNumberedAnswers(userAnswer, correctAnswer, numberedKeys);
    }

    const isFullyCorrect = answersMatch(userAnswer, correctAnswer);
    const resolvedTotalGaps = Number(totalGaps) > 0 ? Number(totalGaps) : 1;
    const correctGaps = isFullyCorrect ? resolvedTotalGaps : 0;

    return {
        isFullyCorrect,
        totalGaps: resolvedTotalGaps,
        correctGaps,
        score: isFullyCorrect ? 100 : 0
    };
};
