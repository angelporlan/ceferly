export type AnswerFeedbackStatus = "idle" | "correct" | "incorrect";

export function formatExpectedAnswers(answer: unknown): string;
export function getExpectedAnswerFeedback(
  status: AnswerFeedbackStatus,
  answer: unknown
): string | null;
