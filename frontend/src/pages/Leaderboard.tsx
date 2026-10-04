import React, { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Coins, Trophy, Flame, Medal } from 'lucide-react'
import { normalizeRankingPayload, type RankingRow } from '../lib/leaderboardData.mjs'

export const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState<RankingRow[]>([])
  const [requestState, setRequestState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    fetch(`${API_BASE}/users/rankings?type=coins`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Ranking request failed')
        return res.json()
      })
      .then((payload: unknown) => {
        if (cancelled) return
        setRankings(normalizeRankingPayload(payload))
        setRequestState('ready')
      })
      .catch(() => {
        if (!cancelled) setRequestState('error')
      })
    return () => {
      cancelled = true
    }
  }, [retryCount])

  const retry = () => {
    setRequestState('loading')
    setRetryCount((count) => count + 1)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Global ranking banner */}
      <div className="card-playful p-6 bg-gradient-to-r from-amber-50 via-white to-sky-50 border-amber/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber text-white flex items-center justify-center shadow-btn-amber">
            <Trophy className="w-9 h-9 fill-white" />
          </div>
          <div className="text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-amber-dark">
              Clasificación global
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slateText-main">
              Ranking de monedas
            </h1>
            <p className="text-xs font-bold text-slateText-muted mt-0.5">
              Más monedas, mejor posición. La racha desempata los empates.
            </p>
          </div>
        </div>
        <Badge variant="amber" icon={<Coins className="w-3.5 h-3.5" />}>Monedas</Badge>
      </div>

      {requestState === 'loading' && (
        <Card role="status" aria-live="polite" className="text-sm font-bold text-slateText-muted">
          Cargando clasificación…
        </Card>
      )}

      {requestState === 'error' && (
        <Card role="alert" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm font-bold text-slateText-muted">
            No se pudo cargar la clasificación. Comprueba tu conexión e inténtalo de nuevo.
          </p>
          <Button variant="secondary" size="sm" onClick={retry}>Reintentar</Button>
        </Card>
      )}

      {requestState === 'ready' && rankings.length === 0 && (
        <Card className="text-sm font-bold text-slateText-muted">
          Todavía no hay alumnos en la clasificación. Completa ejercicios para sumar monedas y aparecer aquí.
        </Card>
      )}

      {requestState === 'ready' && rankings.length > 0 && (
        <Card className="p-0 overflow-hidden divide-y-2 divide-ceferlyBorder">
          {rankings.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-slate-50"
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
                  user.rank === 1 ? 'bg-mint shadow-sm' : 'bg-slate-400'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slateText-main">
                      {user.name}
                    </span>
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

                <div className="flex items-center gap-1 text-right min-w-[90px]">
                  <Coins className="w-4 h-4 text-amber" aria-hidden="true" />
                  <span className="text-base font-black text-slateText-main">{user.coins}</span>
                  <span className="text-xs font-bold text-slateText-muted">monedas</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
