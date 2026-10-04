export interface UserStatsUpdate {
  coins?: number
  hearts?: number
  streak?: number
}

export interface UserStatsSnapshot {
  coins: number
  hearts: number
  streak: number
  level: string
  name: string
  avatarSeed?: string
}

export interface StreakBadge {
  label: string
  accessibleLabel: string
}

export function publishUserStats(update: UserStatsUpdate): void
export function subscribeToUserStats(listener: (update: UserStatsUpdate) => void): () => void
export function mergeUserStats<T extends object>(current: T, update: Partial<T>): T
export function getStreakBadge(streak: number): StreakBadge | null
