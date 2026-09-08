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

export const scoreAttempt = ({ userAnswer, correctAnswer, totalGaps = 1 } = {}) => {
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
