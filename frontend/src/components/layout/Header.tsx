import React, { useEffect, useState } from 'react'
import { Flame, Coins, Heart, Sparkles, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UserStats {
  streak: number
  coins: number
  hearts: number
  level: string
  name: string
  avatarSeed?: string
}

export const Header: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    streak: 3,
    coins: 140,
    hearts: 5,
    level: 'B2 First',
    name: 'Estudiante',
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
      fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setStats(prev => ({
              ...prev,
              streak: data.streak ?? prev.streak,
              coins: data.coins ?? prev.coins,
              level: data.level?.name ?? prev.level,
              name: data.name ?? prev.name,
              avatarSeed: data.avatar_seed
            }))
          }
        })
        .catch(() => {})
    }
  }, [])

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
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-amber/30 bg-amber-50 shadow-sm cursor-pointer hover:scale-105 transition-transform" title="Racha de días de estudio">
          <Flame className="w-5 h-5 text-amber fill-amber animate-pulse" />
          <span className="font-black text-amber-dark text-sm">{stats.streak}</span>
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
