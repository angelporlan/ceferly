const NUMBERED_GAP_MARKER = /\((\d+)\)\s*(?=(?:\.{2,}|…{2,}|_{2,}))/g

export const getExerciseGapNumbers = (questionText) => {
  if (typeof questionText !== 'string') return []

  return [...new Set(Array.from(questionText.matchAll(NUMBERED_GAP_MARKER), ([, number]) => number))]
    .sort((left, right) => Number(left) - Number(right))
}

export const buildNumberedGapAnswers = (gapNumbers, answers = {}) => Object.fromEntries(
  gapNumbers.map((number) => [number, String(answers[number] ?? '').trim()]),
)

export const areNumberedGapAnswersComplete = (gapNumbers, answers = {}) => (
  gapNumbers.length > 0 && gapNumbers.every((number) => String(answers[number] ?? '').trim().length > 0)
)
