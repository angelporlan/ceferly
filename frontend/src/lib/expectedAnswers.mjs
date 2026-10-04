const INVALID_JSON = Symbol("invalid-json-answer");
const NUMBERED_KEY = /^\d+$/;
const UNDISPLAYABLE_TEXT = /^(?:undefined|null|\[object object\])$/i;

const parseStructuredText = (value) => {
  const text = value.trim();
  if (!text) return "";
  if (!/^[{[\"]/.test(text)) return text;

  try {
    return JSON.parse(text);
  } catch {
    return INVALID_JSON;
  }
};

const isNumberedAnswerMap = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(([key]) => NUMBERED_KEY.test(key));
};

const formatAnswerValue = (value) => {
  if (typeof value === "string") {
    const parsed = parseStructuredText(value);
    if (parsed === INVALID_JSON) return "";
    if (parsed !== value.trim()) return formatExpectedAnswers(parsed);
    return UNDISPLAYABLE_TEXT.test(parsed) ? "" : parsed;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatAnswerValue).filter(Boolean).join(" / ");
  }

  if (value && typeof value === "object") {
    if (isNumberedAnswerMap(value)) return formatExpectedAnswers(value);
    return Object.values(value).map(formatAnswerValue).filter(Boolean).join(" / ");
  }

  return "";
};

export const formatExpectedAnswers = (answer) => {
  if (typeof answer === "string") {
    const parsed = parseStructuredText(answer);
    if (parsed === INVALID_JSON) return "";
    if (parsed !== answer.trim()) return formatExpectedAnswers(parsed);
  }

  if (isNumberedAnswerMap(answer)) {
    return Object.entries(answer)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([key, value]) => {
        const formatted = formatAnswerValue(value);
        return formatted ? `${Number(key)}. ${formatted}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return formatAnswerValue(answer);
};

export const getExpectedAnswerFeedback = (status, answer) => {
  if (status !== "incorrect") return null;
  return formatExpectedAnswers(answer) || null;
};
