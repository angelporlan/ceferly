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

export const MAX_WRITING_CHARACTERS = 5000;

export const isWritingExerciseType = (type) =>
    ["essay", "writing"].includes(String(type || "").trim().toLowerCase());

export const scoreWritingSubmission = (userAnswer) => {
    if (typeof userAnswer !== "string" || !userAnswer.trim()) {
        const error = new Error("Writing answer is required");
        error.code = "EMPTY_WRITING_ANSWER";
        throw error;
    }

    if (userAnswer.length > MAX_WRITING_CHARACTERS) {
        const error = new Error("Writing answer is too long");
        error.code = "WRITING_ANSWER_TOO_LONG";
        throw error;
    }

    return {
        isFullyCorrect: false,
        totalGaps: 0,
        correctGaps: 0,
        score: 0,
        gradingStatus: "pending_feedback"
    };
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
