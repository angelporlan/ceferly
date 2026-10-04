export interface RankingRow {
  id: number | string;
  rank: number;
  name: string;
  username: string;
  streak: number;
  coins: number;
}

export function normalizeRankingPayload(payload: unknown): RankingRow[];
