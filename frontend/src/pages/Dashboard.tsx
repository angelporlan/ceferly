import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Flame, Star, Trophy, Sparkles, BookOpen, ChevronRight, CheckCircle2, Lock } from 'lucide-react'

interface SkillNode {
  id: string
  title: string
  category: string
  status: 'completed' | 'active' | 'locked'
  stars: number
  totalStars: number
}

const DEMO_SKILL_NODES: SkillNode[] = [
  { id: '1', title: 'Conditionals (Zero, 1st, 2nd, 3rd)', category: 'Grammar', status: 'active', stars: 2, totalStars: 3 },
  { id: '2', title: 'Past & Present Perfect', category: 'Grammar', status: 'active', stars: 1, totalStars: 3 },
  { id: '3', title: 'Passive Voice & Causatives', category: 'Grammar', status: 'active', stars: 0, totalStars: 3 },
  { id: '4', title: 'Work & Employment Idioms', category: 'Vocabulary', status: 'active', stars: 1, totalStars: 3 },
  { id: '5', title: 'Word Formation (Prefixes & Suffixes)', category: 'Vocabulary', status: 'active', stars: 0, totalStars: 3 },
  { id: '6', title: 'Key Word Transformation', category: 'Use of English', status: 'active', stars: 0, totalStars: 3 },
]

export const Dashboard: React.FC = () => {
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(DEMO_SKILL_NODES)
  const [streak, setStreak] = useState(1)
  const [attemptsToday, setAttemptsToday] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(5)

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    // 1. Fetch subcategories to populate dynamic skill tree
    fetch(`${API_BASE}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const allSubs: SkillNode[] = []
          data.forEach((cat: any) => {
            const subs = cat.subcategories || cat.Subcategories || []
            subs.forEach((sub: any, idx: number) => {
              allSubs.push({
                id: String(sub.id),
                title: sub.name,
                category: cat.name,
                status: idx === 0 ? 'completed' : 'active',
                stars: idx === 0 ? 3 : idx === 1 ? 1 : 0,
                totalStars: 3,
              })
            })
          })
          if (allSubs.length > 0) {
            setSkillNodes(allSubs.slice(0, 10))
          }
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
            setStreak(userData.streak ?? 1)
            setDailyGoal(userData.daily_goal ?? 5)
          }
        })
        .catch(() => {})

      fetch(`${API_BASE}/users/me/numberOfAttemptsToday`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((attemptData) => {
          if (attemptData && attemptData.attemptsToday !== undefined) {
            setAttemptsToday(attemptData.attemptsToday)
          }
        })
        .catch(() => {})
    }
  }, [])
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Main Learning Pathway */}
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Unit Banner */}
        <div className="w-full card-playful p-6 bg-gradient-to-r from-mint to-mint-hover text-white mb-8 border-mint-dark shadow-btn-mint">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-mint-light">
                Unidad 1 · Nivel B2 First
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Dominio de Gramática y Vocabulario
              </h1>
              <p className="text-white/90 text-sm font-bold mt-1">
                Aprende las estructuras clave para superar el examen Cambridge B2 First.
              </p>
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
          {skillNodes.map((node, index) => {
            // Slight horizontal offset to give the playful winding path feel
            const offsets = ['translate-x-0', 'translate-x-10', 'translate-x-0', '-translate-x-10', 'translate-x-0', 'translate-x-8']
            const offset = offsets[index % offsets.length]

            const isCompleted = node.status === 'completed'
            const isActive = node.status === 'active'
            const isLocked = node.status === 'locked'

            return (
              <div key={node.id} className={`flex flex-col items-center ${offset} transition-transform`}>
                <Link
                  to={isLocked ? '#' : `/categories/${node.id}/exercises`}
                  className={`
                    relative group flex flex-col items-center select-none
                    ${isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                  `}
                >
                  {/* Outer circle with 3D press */}
                  <div
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150
                      ${
                        isCompleted
                          ? 'bg-amber text-white shadow-btn-amber hover:scale-105 active:shadow-btn-amber-pressed active:translate-y-1'
                          : isActive
                          ? 'bg-mint text-white shadow-btn-mint hover:scale-105 active:shadow-btn-mint-pressed active:translate-y-1 ring-4 ring-mint/20'
                          : 'bg-slate-200 text-slate-400 border-2 border-slate-300'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                    ) : isActive ? (
                      <BookOpen className="w-9 h-9 stroke-[2.5]" />
                    ) : (
                      <Lock className="w-7 h-7" />
                    )}

                    {/* Active pulse ring */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-mint border-2 border-white"></span>
                      </span>
                    )}
                  </div>

                  {/* Stars counter / label */}
                  <div className="mt-2 text-center max-w-[140px]">
                    <span className="text-xs font-black text-slateText-main group-hover:text-mint transition-colors truncate block">
                      {node.title}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      {Array.from({ length: node.totalStars }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`w-3.5 h-3.5 ${
                            starIndex < node.stars
                              ? 'text-amber fill-amber'
                              : 'text-slate-300 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
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
            Los estudiantes con más de 7 días de racha tienen un 84% más de probabilidades de aprobar su examen B2/C1.
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
              Liga Zafiro
            </h3>
            <Link to="/leaderboard" className="text-xs font-black text-mint hover:underline">
              Ver tabla
            </Link>
          </div>
          <p className="text-xs text-slateText-muted">
            Estás en el puesto <strong className="text-slateText-main">#4</strong>. ¡El Top 10 asciende a la Liga Rubí!
          </p>
        </Card>
      </div>
    </div>
  )
}
