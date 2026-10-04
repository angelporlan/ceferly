const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0

export const parseHeaderCounters = (profile) => {
  if (!isRecord(profile)) return null

  const { streak, coins, hearts } = profile
  if (
    !isNonNegativeInteger(streak) ||
    !isNonNegativeInteger(coins) ||
    !isNonNegativeInteger(hearts)
  ) {
    return null
  }

  return { streak, coins, hearts }
}
