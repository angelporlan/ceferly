export interface ResultContext {
  exerciseId: number;
  attemptId?: number;
  exerciseTitle?: string;
  isCorrect: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  questionText?: string;
  explanationRule?: string;
  hearts?: number;
  coins?: number;
  streak?: number;
}

export function hasValidResultContext(value: unknown): value is ResultContext;
