export function hasValidResultContext(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Number.isInteger(value.exerciseId) &&
      value.exerciseId > 0 &&
      typeof value.isCorrect === "boolean",
  );
}
