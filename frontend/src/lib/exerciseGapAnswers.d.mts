export function getExerciseGapNumbers(questionText: unknown): string[]
export function buildNumberedGapAnswers(
  gapNumbers: string[],
  answers?: Record<string, string>,
): Record<string, string>
export function areNumberedGapAnswersComplete(
  gapNumbers: string[],
  answers?: Record<string, string>,
): boolean
