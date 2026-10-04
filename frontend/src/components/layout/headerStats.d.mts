export interface HeaderCounters {
  streak: number
  coins: number
  hearts: number
}

export function parseHeaderCounters(profile: unknown): HeaderCounters | null
