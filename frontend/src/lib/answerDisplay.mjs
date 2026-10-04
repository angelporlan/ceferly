const isNumericKey = (key) => /^\d+$/.test(key);

const compareAnswerKeys = ([left], [right]) => {
  const leftIsNumeric = isNumericKey(left);
  const rightIsNumeric = isNumericKey(right);

  if (leftIsNumeric && rightIsNumeric) return Number(left) - Number(right);
  if (leftIsNumeric) return -1;
  if (rightIsNumeric) return 1;
  return left.localeCompare(right);
};

const formatAnswerValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value.map(formatAnswerValue).filter(Boolean).join(" / ");
  }

  if (typeof value !== "object") return "";

  return Object.entries(value)
    .sort(compareAnswerKeys)
    .map(([key, answer]) => {
      const formattedAnswer = formatAnswerValue(answer);
      return formattedAnswer ? `${key}. ${formattedAnswer}` : "";
    })
    .filter(Boolean)
    .join(" · ");
};

export function formatCorrectAnswer(answer) {
  return formatAnswerValue(answer);
}
