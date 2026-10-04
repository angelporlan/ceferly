import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Flame, Trophy, Sparkles, BookOpen, ChevronRight } from 'lucide-react'
import { mapDashboardCatalog, type DashboardCatalogItem } from './dashboardCatalog.mjs'

type CatalogState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; nodes: DashboardCatalogItem[] }

export const Dashboard: React.FC = () => {
  const [catalogState, setCatalogState] = useState<CatalogState>({ status: 'loading' })
  const [catalogRequest, setCatalogRequest] = useState(0)
  const [streak, setStreak] = useState(0)
  const [attemptsToday, setAttemptsToday] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(5)
  const [selectedLevel, setSelectedLevel] = useState(localStorage.getItem('ceferly-level') || 'B2')
  const [levels, setLevels] = useState<{ name: string; exam?: string; totalExercises?: number }[]>([
    { name: 'B1' },
    { name: 'B2' },
    { name: 'C1' },
  ])

  useEffect(() => {
    let isCurrentRequest = true
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    const loadCatalog = async () => {
      setCatalogState({ status: 'loading' })
      try {
        const response = await fetch(`${API_BASE}/categories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) throw new Error('Category catalog request failed')

        const data: unknown = await response.json()
        if (isCurrentRequest) {
          setCatalogState({ status: 'ready', nodes: mapDashboardCatalog(data).slice(0, 10) })
        }
      } catch {
        if (isCurrentRequest) setCatalogState({ status: 'error' })
      }
    }

    void loadCatalog()

    return () => {
      isCurrentRequest = false
    }
  }, [catalogRequest])

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    fetch(`${API_BASE}/levels`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLevels(data.filter((level: { name: string }) => ['B1', 'B2', 'C1'].includes(level.name)))
        }
      })
      .catch(() => {})

    // 2. Fetch user stats if logged in
    if (token) {
      fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => {
          if (userData) {
            setStreak(userData.streak ?? 0)
            setDailyGoal(userData.daily_goal ?? 5)
          }
        })
        .catch(() => {})

      fetch(`${API_BASE}/users/me/numberOfAttemptsToday`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((attemptData) => {
          const todayCount = attemptData.attemptsToday ?? attemptData.numberOfAttempts
          if (todayCount !== undefined) {
            setAttemptsToday(todayCount)
          }
        })
        .catch(() => {})
    }
  }, [])

  const skillNodes = catalogState.status === 'ready' ? catalogState.nodes : []

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Main Learning Pathway */}
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Unit Banner */}
        <div className="w-full card-playful p-6 bg-gradient-to-r from-mint to-mint-hover text-white mb-8 border-mint-dark shadow-btn-mint">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-mint-light">
                Use of English · Nivel {selectedLevel}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {selectedLevel === 'B1' ? 'B1 Preliminary' : selectedLevel === 'C1' ? 'C1 Advanced' : 'B2 First'}
              </h1>
              <p className="text-white/90 text-sm font-bold mt-1">
                Parts 1–4: Multiple Choice Cloze, Open Cloze, Word Formation y Key Word Transformation.
              </p>
              <div className="flex gap-2 mt-3">
                {levels.map((level) => (
                  <button
                    key={level.name}
                    onClick={() => {
                      setSelectedLevel(level.name)
                      localStorage.setItem('ceferly-level', level.name)
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      selectedLevel === level.name ? 'bg-white text-mint' : 'bg-white/20 text-white'
                    }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
            <Link to="/categories">
              <Button variant="secondary" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Ver Todo
              </Button>
            </Link>
          </div>
        </div>

        {/* Skill Tree Path (Duolingo-inspired playful path with Ceferly identity) */}
        <div className="flex flex-col items-center gap-6 my-4 w-full max-w-md">
          {catalogState.status === 'loading' && (
            <Card className="w-full text-center text-sm font-bold text-slateText-muted" role="status">
              Cargando módulos de práctica...
            </Card>
          )}

          {catalogState.status === 'error' && (
            <Card className="w-full flex flex-col items-center gap-3 text-center" role="alert">
              <p className="text-sm font-bold text-slateText-muted">
                No se pudieron cargar los módulos. Comprueba la conexión e inténtalo de nuevo.
              </p>
              <Button
                onClick={() => {
                  setCatalogState({ status: 'loading' })
                  setCatalogRequest((request) => request + 1)
                }}
              >
                Reintentar
              </Button>
            </Card>
          )}

          {catalogState.status === 'ready' && skillNodes.length === 0 && (
            <Card className="w-full flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-bold text-slateText-muted">
                Aún no hay módulos con ejercicios disponibles.
              </p>
              <Link to="/categories" className="text-sm font-black text-mint hover:underline">
                Explorar categorías
              </Link>
            </Card>
          )}

          {catalogState.status === 'ready' && skillNodes.map((node, index) => {
            // Slight horizontal offset to give the playful winding path feel
            const offsets = ['translate-x-0', 'translate-x-10', 'translate-x-0', '-translate-x-10', 'translate-x-0', 'translate-x-8']
            const offset = offsets[index % offsets.length]

            return (
              <div key={node.id} className={`flex flex-col items-center ${offset} transition-transform`}>
                <Link
                  to={`/categories/${node.id}/exercises?level=${selectedLevel}`}
                  className="relative group flex flex-col items-center select-none cursor-pointer"
                  aria-label={`Practicar ${node.title}`}
                >
                  {/* Outer circle with 3D press */}
                  <div
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150
                      bg-mint text-white shadow-btn-mint hover:scale-105 active:shadow-btn-mint-pressed active:translate-y-1 ring-4 ring-mint/20
                    `}
                  >
                    <BookOpen className="w-9 h-9 stroke-[2.5]" />
                  </div>

                  <div className="mt-2 text-center max-w-[140px]">
                    <span className="text-[10px] font-black uppercase tracking-wide text-slateText-muted truncate block">
                      {node.category}
                    </span>
                    <span className="text-xs font-black text-slateText-main group-hover:text-mint transition-colors truncate block">
                      {node.title}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side Widgets Section */}
      <div className="w-full lg:w-80 flex flex-col gap-5 sticky top-24">
        {/* Daily Goal Card */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slateText-main flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-mint" />
              Meta diaria
            </h2>
            <Badge variant="mint">{attemptsToday} / {dailyGoal}</Badge>
          </div>
          <p className="text-xs text-slateText-muted font-bold">
            {attemptsToday >= dailyGoal
              ? '¡Enhorabuena! Has completado tu meta diaria.'
              : `Completa ${Math.max(0, dailyGoal - attemptsToday)} ejercicios más hoy para mantener tu racha al máximo.`}
          </p>
          <ProgressBar value={attemptsToday} max={dailyGoal} color="mint" showLabel />
        </Card>

        {/* Streak Challenge Card */}
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-white border-amber/30 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber text-white flex items-center justify-center shadow-btn-amber">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slateText-main">Racha activa de {streak} {streak === 1 ? 'día' : 'días'}</h3>
              <p className="text-xs text-amber-dark font-bold">¡No pierdas tu progreso!</p>
            </div>
          </div>
          <p className="text-xs text-slateText-muted">
            Practica un poco cada día para consolidar lo aprendido.
          </p>
        </Card>

        {/* Cambridge Exam Tip */}
        <Card className="p-5 flex flex-col gap-2 bg-sky-50 border-sky/30">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-dark">
            Consejo Cambridge del día
          </span>
          <h3 className="text-sm font-black text-slateText-main">Key Word Transformation</h3>
          <p className="text-xs text-slateText-muted font-bold">
            En la parte 4 del Use of English, recuerda no cambiar la palabra dada y escribir entre dos y cinco palabras exactas.
          </p>
        </Card>

        {/* Leaderboard Teaser */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slateText-main flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber fill-amber" />
              Clasificación global
            </h3>
            <Link to="/leaderboard" className="text-xs font-black text-mint hover:underline">
              Ver tabla
            </Link>
          </div>
          <p className="text-xs text-slateText-muted">
            Consulta la clasificación global por monedas.
          </p>
        </Card>
      </div>
    </div>
  )
}
