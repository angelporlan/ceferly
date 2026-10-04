import React, { useEffect, useState } from 'react'
import { Flame, Coins, Heart, Sparkles, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getStreakBadge,
  mergeUserStats,
  subscribeToUserStats,
  type UserStatsUpdate,
} from '../../services/userStats.mjs'
import { parseHeaderCounters } from './headerStats.mjs'

interface UserStats {
  streak: number
  coins: number
  hearts: number
  level: string
  name: string
  avatarSeed?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export const Header: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    coins: 0,
    hearts: 0,
    level: 'Cambridge',
    name: 'Estudiante',
  })
  const [statsStatus, setStatsStatus] = useState<'loading' | 'anonymous' | 'unavailable' | 'ready'>(
    () => localStorage.getItem('token') ? 'loading' : 'anonymous'
  )

  useEffect(() => {
    let isCurrentRequest = true
    const eventChangedFields = new Set<keyof UserStats>()
    const token = localStorage.getItem('token')

    if (!token) {
      return () => {
        isCurrentRequest = false
      }
    }

    const unsubscribe = subscribeToUserStats((update: UserStatsUpdate) => {
      Object.keys(update).forEach((key) => eventChangedFields.add(key as keyof UserStats))
      setStats((current) => mergeUserStats(current, update))
    })

    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('User profile request failed')

        const data: unknown = await response.json()
        const counters = parseHeaderCounters(data)
        if (!counters || !isRecord(data)) throw new Error('User profile response is incomplete')
        if (!isCurrentRequest) return

        const level = isRecord(data.level) ? data.level.name : undefined
        const profileUpdate: Partial<UserStats> = {
          ...(eventChangedFields.has('streak') ? {} : { streak: counters.streak }),
          ...(eventChangedFields.has('coins') ? {} : { coins: counters.coins }),
          ...(eventChangedFields.has('hearts') ? {} : { hearts: counters.hearts }),
          ...(typeof level === 'string' ? { level } : {}),
          ...(typeof data.name === 'string' ? { name: data.name } : {}),
          ...(typeof data.avatar_seed === 'string' ? { avatarSeed: data.avatar_seed } : {}),
        }
        setStats((previous) => mergeUserStats(previous, profileUpdate))
        setStatsStatus('ready')
      } catch {
        if (isCurrentRequest) setStatsStatus('unavailable')
      }
    }

    void loadProfile()

    return () => {
      isCurrentRequest = false
      unsubscribe()
    }
  }, [])
        })
        if (!response.ok) throw new Error('User profile request failed')

        const data: unknown = await response.json()
        const counters = parseHeaderCounters(data)
        if (!counters || !isRecord(data)) throw new Error('User profile response is incomplete')
        if (!isCurrentRequest) return

        const level = isRecord(data.level) ? data.level.name : undefined
        setStats((previous) => ({
          ...previous,
          ...counters,
          level: typeof level === 'string' ? level : previous.level,
          name: typeof data.name === 'string' ? data.name : previous.name,
          avatarSeed: typeof data.avatar_seed === 'string' ? data.avatar_seed : previous.avatarSeed,
        }))
        setStatsStatus('ready')
      } catch {
        if (isCurrentRequest) setStatsStatus('unavailable')
      }
    }

    void loadProfile()

    return () => {
      isCurrentRequest = false
    }

    return unsubscribe
  }, [])

  const streakBadge = getStreakBadge(stats.streak)

  return (
    <header className="h-16 border-b-2 border-ceferlyBorder bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      {/* Mobile brand indicator */}
      <div className="flex md:hidden items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-mint flex items-center justify-center text-white font-black text-lg shadow-btn-mint">
          C
        </div>
        <span className="font-black text-xl text-mint tracking-tight">ceferly</span>
      </div>

      {/* Level badge */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="badge-pill bg-sky-light text-sky-dark border border-sky/30">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          {stats.level}
        </span>
      </div>

      {/* Gamification Counters (Streaks, Coins, Hearts) */}
      <div className="flex items-center gap-2 sm:gap-4">
        {statsStatus === 'ready' && (
          <>
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-amber/30 bg-amber-50 shadow-sm cursor-pointer hover:scale-105 transition-transform" title={`Racha de ${stats.streak} ${stats.streak === 1 ? 'día' : 'días'}`}>
              <Flame className="w-5 h-5 text-amber fill-amber animate-pulse" />
              <span className="font-black text-amber-dark text-sm">{stats.streak}</span>
              {streakBadge && (
                <span
                  className="rounded-md bg-amber/20 px-1 py-0.5 text-[9px] font-black leading-none text-amber-dark"
                  role="img"
                  aria-label={streakBadge.accessibleLabel}
                  title={streakBadge.accessibleLabel}
                >
                  {streakBadge.label}
                </span>
              )}
            </div>

            {/* Coins / Gems */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-amber/30 bg-amber-50 shadow-sm cursor-pointer hover:scale-105 transition-transform" title="Monedas Ceferly">
              <Coins className="w-5 h-5 text-amber fill-amber" />
              <span className="font-black text-amber-dark text-sm">{stats.coins}</span>
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-coral/30 bg-coral-50 shadow-sm cursor-pointer hover:scale-105 transition-transform" title="Vidas disponibles">
              <Heart className="w-5 h-5 text-coral fill-coral" />
              <span className="font-black text-coral-dark text-sm">{stats.hearts}</span>
            </div>
          </>
        )}

        {statsStatus === 'loading' && (
          <span role="status" className="sr-only">Cargando tus estadísticas...</span>
        )}
        {statsStatus === 'unavailable' && (
          <span role="status" className="sr-only">Tus estadísticas no están disponibles.</span>
        )}

        {/* Auth status / Profile button */}
        {isAuthenticated ? (
          <Link to="/profile" className="ml-2 flex items-center">
            <div className="w-9 h-9 rounded-full bg-mint text-white font-black flex items-center justify-center border-2 border-mint-dark shadow-sm hover:scale-105 transition-transform">
              {stats.name.charAt(0).toUpperCase()}
            </div>
          </Link>
        ) : (
          <Link
            to="/login"
            className="btn-3d-mint py-1.5 px-4 text-xs ml-2 hidden sm:inline-flex"
          >
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
