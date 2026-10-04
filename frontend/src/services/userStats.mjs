export const USER_STATS_UPDATED_EVENT = 'ceferly:user-stats-updated'

export function publishUserStats(update) {
  window.dispatchEvent(new CustomEvent(USER_STATS_UPDATED_EVENT, { detail: update }))
}

export function subscribeToUserStats(listener) {
  const handleUpdate = (event) => listener(event.detail)
  window.addEventListener(USER_STATS_UPDATED_EVENT, handleUpdate)
  return () => window.removeEventListener(USER_STATS_UPDATED_EVENT, handleUpdate)
}

export function mergeUserStats(current, update) {
  return { ...current, ...update }
}

export function getStreakBadge(streak) {
  const days = Number(streak)
  if (!Number.isFinite(days) || days < 3) return null

  const milestone = days >= 30 ? 30 : days >= 7 ? 7 : 3
  return {
    label: `${milestone}d`,
    accessibleLabel: `Hito alcanzado: racha de ${milestone} días o más`,
  }
}

export function getAttemptRewardMessage({ isSaved, coinsEarned, coins, streak }) {
  if (!isSaved) return 'Intento sin guardar · sin recompensa de monedas'
  return `+${coinsEarned} monedas · saldo ${coins} · racha ${streak}`
}
