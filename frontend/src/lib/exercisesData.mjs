const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const asText = (value) => (typeof value === "string" ? value.trim() : "");

export function normalizeExercisesPayload(payload) {
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray(payload.exercises)
      ? payload.exercises
      : null;

  if (source === null) return null;

  const exercises = [];
  for (const item of source) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;

    const id = parseId(item.id);
    const title = asText(item.title);
    const type = asText(item.type);
    const questionText = asText(item.questionText) || asText(item.question_text);
    if (id === null || !title || !type) return null;

    const levelName = item.level && typeof item.level === "object" ? asText(item.level.name) : "";
    exercises.push({
      id,
      title,
      type,
      questionText,
      ...(levelName ? { level: { name: levelName } } : {}),
    });
  }

  return exercises;
}
