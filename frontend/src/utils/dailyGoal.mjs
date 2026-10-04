export function parseDailyGoal(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && value.trim() === '') return null

  const dailyGoal = Number(value)
  return Number.isInteger(dailyGoal) && dailyGoal >= 1 && dailyGoal <= 100
    ? dailyGoal
    : null
}
