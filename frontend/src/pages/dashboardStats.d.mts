export interface DashboardStats {
  attemptsToday: number
  dailyGoal: number
  streak: number
}

export function parseDashboardStats(data: unknown): DashboardStats | null
