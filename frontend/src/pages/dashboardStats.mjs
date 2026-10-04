const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0

export const parseDashboardStats = (data) => {
  if (!isRecord(data)) return null

  const attemptsToday = data.attemptsToday ?? data.numberOfAttempts
  const { dailyGoal, streak } = data

  if (
    !isNonNegativeInteger(attemptsToday) ||
    !Number.isInteger(dailyGoal) ||
    dailyGoal < 1 ||
    !isNonNegativeInteger(streak)
  ) {
    return null
  }

  return { attemptsToday, dailyGoal, streak }
}
