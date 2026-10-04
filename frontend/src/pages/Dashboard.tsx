import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Flame, Trophy, Sparkles, BookOpen, ChevronRight } from 'lucide-react'
import { mapDashboardCatalog, type DashboardCatalogItem } from './dashboardCatalog.mjs'
import { parseDailyGoal } from '../utils/dailyGoal.mjs'
import { parseDashboardStats, type DashboardStats } from './dashboardStats.mjs'
type StatsState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'error' }
  | { status: 'ready'; stats: DashboardStats }
  
  

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

interface DailyGoalFeedback {
  message: string
  kind: 'success' | 'error'
}



interface LevelResponse {
  name: string
  exam?: string
  totalExercises?: number
}

type CatalogState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; nodes: DashboardCatalogItem[] }

export const Dashboard: React.FC = () => {
  const [catalogState, setCatalogState] = useState<CatalogState>({ status: 'loading' })
  const [catalogRequest, setCatalogRequest] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(5)
  const [dailyGoalDraft, setDailyGoalDraft] = useState('5')
  const [isEditingDailyGoal, setIsEditingDailyGoal] = useState(false)
  const [isSavingDailyGoal, setIsSavingDailyGoal] = useState(false)
  const [dailyGoalFeedback, setDailyGoalFeedback] = useState<DailyGoalFeedback | null>(null)
  const [statsState, setStatsState] = useState<StatsState>(() =>
    localStorage.getItem('token') ? { status: 'loading' } : { status: 'anonymous' }
  )
const [statsRequest, setStatsRequest] = useState(0)
  const [selectedLevel, setSelectedLevel] = useState(localStorage.getItem('ceferly-level') || 'B2')
  const isAuthenticated = Boolean(localStorage.getItem('token'))
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
      .then((data: LevelResponse[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setLevels(data.filter((level) => ['B1', 'B2', 'C1'].includes(level.name)))
        }
      })
      .catch(() => {})

  }, [])

  useEffect(() => {
    let isCurrentRequest = true
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    if (!token) {
      return () => {
        isCurrentRequest = false
      }
    }

    const loadStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/me/numberOfAttemptsToday`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('User statistics request failed')

        const data: unknown = await response.json()
        const stats = parseDashboardStats(data)
        if (!stats) throw new Error('User statistics response is incomplete')
        if (isCurrentRequest) {
          setDailyGoal(stats.dailyGoal)
          setDailyGoalDraft(String(stats.dailyGoal))
          setStatsState({ status: 'ready', stats })
        }
      } catch {
        if (isCurrentRequest) setStatsState({ status: 'error' })
      }
    }

    void loadStats()

    return () => {
      isCurrentRequest = false
    }
  }, [statsRequest])


  const startEditingDailyGoal = () => {
    setDailyGoalDraft(String(dailyGoal))
    setDailyGoalFeedback(null)
    setIsEditingDailyGoal(true)
  }

  const handleSaveDailyGoal = async () => {
    const requestedGoal = parseDailyGoal(dailyGoalDraft)
    if (requestedGoal === null) {
      setDailyGoalFeedback({ message: 'Introduce un número entero entre 1 y 100.', kind: 'error' })
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setDailyGoalFeedback({ message: 'Inicia sesión para guardar tu meta diaria.', kind: 'error' })
      return
    }

    setIsSavingDailyGoal(true)
    setDailyGoalFeedback(null)
    try {
            const response = await fetch(`${API_BASE_URL}/users/me/daily-goal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ daily_goal: requestedGoal }),
      })
      const data: { daily_goal?: unknown } = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error('No se pudo guardar la meta diaria.')

      const savedGoal = parseDailyGoal(data.daily_goal)
      if (savedGoal === null) throw new Error('El servidor devolvió una meta inválida.')

      setDailyGoal(savedGoal)
      setStatsState((current) =>
        current.status === 'ready'
          ? { ...current, stats: { ...current.stats, dailyGoal: savedGoal } }
          : current,
      )
      setDailyGoalDraft(String(savedGoal))
      setIsEditingDailyGoal(false)
      setDailyGoalFeedback({ message: 'Meta diaria guardada.', kind: 'success' })
    } catch {
      setDailyGoalFeedback({
        message: 'No se pudo guardar la meta diaria. Inténtalo de nuevo.',
        kind: 'error',
      })
    } finally {
      setIsSavingDailyGoal(false)
    }
  }
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
        {statsState.status === 'ready' ? (
          <>
            {/* Daily Goal Card */}
            <Card className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slateText-main flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-mint" />
                  Meta diaria
                </h2>
                <Badge variant="mint">{statsState.stats.attemptsToday} / {statsState.stats.dailyGoal}</Badge>
              </div>
              <p className="text-xs text-slateText-muted font-bold">
                {statsState.stats.attemptsToday >= statsState.stats.dailyGoal
                  ? '¡Enhorabuena! Has completado tu meta diaria.'
                  : `Completa ${Math.max(0, statsState.stats.dailyGoal - statsState.stats.attemptsToday)} ejercicios más hoy para mantener tu racha al máximo.`}
              </p>
              <ProgressBar value={statsState.stats.attemptsToday} max={statsState.stats.dailyGoal} color="mint" showLabel />
              {isEditingDailyGoal ? (
                <form
                  className="flex flex-col gap-3 border-t border-ceferlyBorder pt-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleSaveDailyGoal()
                  }}
                >
                  <label className="flex flex-col gap-2 text-xs font-black text-slateText-main">
                    Ejercicios por día
                    <input
                      aria-label="Meta diaria en ejercicios"
                      className="w-full rounded-xl border border-ceferlyBorder px-3 py-2 text-sm font-bold"
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      required
                      value={dailyGoalDraft}
                      disabled={isSavingDailyGoal}
                      onChange={(event) => setDailyGoalDraft(event.target.value)}
                    />
                  </label>
                  <p className="text-xs text-slateText-muted">Elige entre 1 y 100 ejercicios diarios.</p>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isSavingDailyGoal}>
                      {isSavingDailyGoal ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSavingDailyGoal}
                      onClick={() => {
                        setIsEditingDailyGoal(false)
                        setDailyGoalFeedback(null)
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end">
                  {isAuthenticated ? (
                    <Button variant="ghost" size="sm" onClick={startEditingDailyGoal}>
                      Editar meta
                    </Button>
                  ) : (
                    <Link to="/login" className="text-xs font-black text-mint hover:underline">
                      Inicia sesión para ajustar tu meta
                    </Link>
                  )}
                </div>
              )}
              {dailyGoalFeedback && (
                <p
                  className={dailyGoalFeedback.kind === 'success' ? 'text-xs text-mint-dark' : 'text-xs text-red-600'}
                  role={dailyGoalFeedback.kind === 'error' ? 'alert' : 'status'}
                  aria-live="polite"
                >
                  {dailyGoalFeedback.message}
                </p>
              )}
            </Card>

            {/* Streak Challenge Card */}
            <Card className="p-5 bg-gradient-to-br from-amber-50 to-white border-amber/30 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber text-white flex items-center justify-center shadow-btn-amber">
                  <Flame className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slateText-main">Racha activa de {statsState.stats.streak} {statsState.stats.streak === 1 ? 'día' : 'días'}</h3>
                  <p className="text-xs text-amber-dark font-bold">¡No pierdas tu progreso!</p>
                </div>
              </div>
              <p className="text-xs text-slateText-muted">
                Practica un poco cada día para consolidar lo aprendido.
              </p>
            </Card>
          </>
        ) : (
          <Card
            className="p-5 flex flex-col gap-3"
            role={statsState.status === 'loading' ? 'status' : statsState.status === 'error' ? 'alert' : undefined}
          >
            <h2 className="text-base font-black text-slateText-main flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-mint" />
              Tu progreso
            </h2>
            {statsState.status === 'loading' && (
              <p className="text-xs text-slateText-muted font-bold">Cargando tu meta diaria y racha...</p>
            )}
            {statsState.status === 'anonymous' && (
              <>
                <p className="text-xs text-slateText-muted font-bold">
                  Inicia sesión para consultar tu meta diaria y tu racha.
                </p>
                <Link to="/login" className="text-xs font-black text-mint hover:underline">
                  Iniciar sesión
                </Link>
              </>
            )}
            {statsState.status === 'error' && (
              <>
                <p className="text-xs text-slateText-muted font-bold">
                  No se pudo cargar tu progreso. Inténtalo de nuevo.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setStatsState({ status: 'loading' })
                    setStatsRequest((request) => request + 1)
                  }}
                >
                  Reintentar
                </Button>
              </>
            )}
          </Card>
        )}

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
