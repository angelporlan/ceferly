export interface ExerciseRow {
  id: number;
  title: string;
  type: string;
  questionText: string;
  level?: { name: string };
}

export function normalizeExercisesPayload(payload: unknown): ExerciseRow[] | null;
