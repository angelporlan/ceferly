import React, { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Trophy, Flame, Medal } from 'lucide-react'

interface RankingUser {
  id: number
  rank: number
  name: string
  username: string
  streak: number
  score: number
  isCurrentUser?: boolean
}

const FALLBACK_RANKINGS: RankingUser[] = [
  { id: 101, rank: 1, name: 'Elena Rostova', username: 'elena_c2', streak: 42, score: 1840 },
  { id: 102, rank: 2, name: 'Lucas Silva', username: 'lucas_cambridge', streak: 28, score: 1620 },
  { id: 103, rank: 3, name: 'Marc Benet', username: 'marc_b2', streak: 15, score: 1480 },
  { id: 1, rank: 4, name: 'Ángel Porlán (Tú)', username: 'angelporlan', streak: 7, score: 1210, isCurrentUser: true },
  { id: 104, rank: 5, name: 'Sophie Martin', username: 'sophie_uk', streak: 12, score: 1150 },
  { id: 105, rank: 6, name: 'David Müller', username: 'd_muller', streak: 5, score: 980 },
  { id: 106, rank: 7, name: 'Carla Díaz', username: 'carla_en', streak: 9, score: 850 },
]

export const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState<RankingUser[]>(FALLBACK_RANKINGS)

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    fetch(`${API_BASE}/users/rankings`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || [])
        if (Array.isArray(list) && list.length > 0) {
          setRankings(
            list.map((item: any, idx: number) => ({
              id: item.id ?? idx + 1,
              rank: idx + 1,
              name: item.name || item.username,
              username: item.username,
              streak: item.streak ?? 0,
              score: item.score ?? item.coins ?? 100,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* League Banner */}
      <div className="card-playful p-6 bg-gradient-to-r from-amber-50 via-white to-sky-50 border-amber/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber text-white flex items-center justify-center shadow-btn-amber">
            <Trophy className="w-9 h-9 fill-white" />
          </div>
          <div className="text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-amber-dark">
              División Competitiva
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slateText-main">
              Liga Zafiro
            </h1>
            <p className="text-xs font-bold text-slateText-muted mt-0.5">
              Los 5 primeros ascienden a la Liga Rubí al final de la semana
            </p>
          </div>
        </div>
        <Badge variant="amber">Termina en 2 días</Badge>
      </div>

      {/* Rankings List */}
      <Card className="p-0 overflow-hidden divide-y-2 divide-ceferlyBorder">
        {rankings.map((user) => {
          return (
            <div
              key={user.id}
              className={`
                flex items-center justify-between p-4 px-6 transition-colors
                ${user.isCurrentUser ? 'bg-mint-50/70 border-l-4 border-mint font-black' : 'hover:bg-slate-50'}
              `}
            >
              {/* Rank position and user info */}
              <div className="flex items-center gap-4">
                <div className="w-8 text-center">
                  {user.rank === 1 ? (
                    <Medal className="w-7 h-7 text-amber fill-amber mx-auto" />
                  ) : user.rank === 2 ? (
                    <Medal className="w-6 h-6 text-slate-400 fill-slate-300 mx-auto" />
                  ) : user.rank === 3 ? (
                    <Medal className="w-6 h-6 text-amber-700 fill-amber-600 mx-auto" />
                  ) : (
                    <span className="text-base font-black text-slateText-muted">{user.rank}</span>
                  )}
                </div>

                {/* Avatar circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm ${
                  user.isCurrentUser ? 'bg-mint shadow-sm' : 'bg-slate-400'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slateText-main">
                      {user.name}
                    </span>
                    {user.isCurrentUser && (
                      <Badge variant="mint" className="text-[10px] py-0 px-1.5">TÚ</Badge>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slateText-muted">@{user.username}</span>
                </div>
              </div>

              {/* Stats & score */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber fill-amber" />
                  <span className="text-xs font-bold text-amber-dark">{user.streak} d</span>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-base font-black text-slateText-main">{user.score}</span>
                  <span className="text-xs font-bold text-slateText-muted ml-1">XP</span>
                </div>
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
