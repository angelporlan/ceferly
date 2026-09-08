import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { X, Heart, CheckCircle2, AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react'

interface ExerciseData {
  id: number
  title: string
  type: string
  questionText: string
  readingText?: string
  options?: string[]
  correctAnswer: unknown
  explanation_rule?: string
  content?: {
    exam?: string
    part?: number
    keyword?: string | null
    stem?: string | null
    original?: string | null
    level?: string
  }
  level?: { id: number; name: string }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

const isChoiceExercise = (exercise: ExerciseData) => {
  const type = exercise.type || ''
  return type.includes('multiple_choice') || (Array.isArray(exercise.options) && exercise.options.length >= 2)
}

export const ExercisePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [gapInput, setGapInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [hearts, setHearts] = useState(0)
  const [coins, setCoins] = useState(0)
  const [streak, setStreak] = useState(0)
  const [attemptId, setAttemptId] = useState<number | undefined>()
  const [blocked, setBlocked] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')

    const loadHearts = token
      ? fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data) return
            setHearts(data.hearts ?? 0)
            setCoins(data.coins ?? 0)
            setStreak(data.streak ?? 0)
            setBlocked((data.hearts ?? 0) <= 0)
          })
          .catch(() => {})
      : Promise.resolve()

    const loadExercise = fetch(`${API_BASE}/exercises/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Exercise not found')
        return res.json()
      })
      .then((data) => {
        const resolvedQuestionText = data.questionText || data.question_text || ''
        const resolvedCorrectAnswer = data.correctAnswer !== undefined ? data.correctAnswer : data.correct_answer
        const resolvedReadingText = data.readingText || data.reading_text || data.content?.original || ''
        const resolvedOptions = Array.isArray(data.options)
          ? data.options
          : (typeof data.options === 'object' && data.options !== null ? Object.values(data.options) : [])

        if (!data.id && !resolvedQuestionText) {
          throw new Error('Empty exercise payload')
        }

        setExercise({
          id: data.id,
          title: data.title,
          type: data.type,
          questionText: resolvedQuestionText,
          correctAnswer: resolvedCorrectAnswer,
          readingText: resolvedReadingText,
          options: resolvedOptions as string[],
          explanation_rule: data.explanation_rule,
          content: data.content,
          level: data.level || data.Level,
        })
      })
      .catch((error) => {
        setLoadError(error.message || 'No se pudo cargar el ejercicio')
      })

    Promise.all([loadHearts, loadExercise]).finally(() => setLoading(false))
  }, [id])

  const handleCheckAnswer = async () => {
    if (!exercise || blocked || submitting) return
    const userAnswer = isChoiceExercise(exercise) ? selectedOption : gapInput.trim()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      let serverCorrect: boolean | undefined

      if (token) {
        const res = await fetch(`${API_BASE}/exercises/${id}/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userAnswer, totalGaps: 1 }),
        })
        const payload = await res.json().catch(() => ({}))
        if (res.status === 403) {
          setBlocked(true)
          setHearts(payload.hearts ?? 0)
          return
        }
        if (res.ok) {
          if (payload.attempt?.id) setAttemptId(payload.attempt.id)
          if (payload.rewards) {
            setHearts(payload.rewards.hearts)
            setCoins(payload.rewards.coins)
            setStreak(payload.rewards.streak)
            setBlocked(!!payload.rewards.playBlocked)
          }
          if (payload.scored) {
            serverCorrect = !!payload.scored.isFullyCorrect
          }
        }
      }

      const expected = exercise.correctAnswer
      let isCorrect = serverCorrect
      if (isCorrect === undefined) {
        if (typeof expected === 'string') {
          const slashParts = expected.split('/').map((s) => s.trim().toLowerCase())
          isCorrect = slashParts.includes(String(userAnswer).toLowerCase())
        } else if (typeof expected === 'object' && expected !== null) {
          const values = Object.values(expected as Record<string, unknown>).map((v) => String(v).toLowerCase())
          isCorrect = values.includes(String(userAnswer).toLowerCase())
        } else {
          isCorrect = String(userAnswer).toLowerCase() === String(expected).toLowerCase()
        }
      }
      setStatus(isCorrect ? 'correct' : 'incorrect')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    if (!exercise) return
    const isCorrect = status === 'correct'
    const userAnswer = isChoiceExercise(exercise) ? selectedOption : gapInput
    navigate('/results', {
      state: {
        exerciseId: exercise.id,
        attemptId,
        exerciseTitle: exercise.title,
        isCorrect,
        correctAnswer: typeof exercise.correctAnswer === 'object' ? JSON.stringify(exercise.correctAnswer) : exercise.correctAnswer,
        userAnswer,
        questionText: exercise.questionText,
        explanationRule: exercise.explanation_rule,
        hearts,
        coins,
        streak,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center font-black text-slateText-muted">
        Cargando ejercicio Cambridge...
      </div>
    )
  }

  if (loadError || !exercise) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-black text-slateText-main">No hay ejercicio para mostrar</h1>
        <p className="text-sm font-bold text-slateText-muted">{loadError || 'El API no devolvió contenido.'}</p>
        <Link to="/categories">
          <Button variant="mint">Volver a categorías</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <header className="h-16 max-w-4xl w-full mx-auto px-4 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-slateText-main rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 max-w-xl">
          <ProgressBar value={status === 'idle' ? 50 : 100} max={100} color="mint" />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral-50 border border-coral/30">
          <Heart className="w-5 h-5 text-coral fill-coral" />
          <span className="font-black text-coral-dark text-sm">{hearts}</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {blocked && (
          <Card className="p-6 mb-6 border-coral/40 bg-coral-50 text-center">
            <h2 className="font-black text-lg text-coral-dark mb-2">Sin vidas</h2>
            <p className="text-sm font-bold text-slateText-muted mb-4">
              Recarga vidas en la tienda para seguir practicando.
            </p>
            <Link to="/shop">
              <Button variant="coral" leftIcon={<ShoppingBag className="w-4 h-4" />}>Ir a la tienda</Button>
            </Link>
          </Card>
        )}

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="sky">{exercise.type.replaceAll('_', ' ')}</Badge>
          {exercise.level?.name && <Badge variant="mint">{exercise.level.name}</Badge>}
          <span className="text-xs font-bold text-slateText-muted">{exercise.title}</span>
        </div>

        {exercise.content?.keyword && (
          <div className="mb-3">
            <Badge variant="amber">KEY WORD: {exercise.content.keyword}</Badge>
          </div>
        )}
        {exercise.content?.stem && (
          <div className="mb-3">
            <Badge variant="amethyst">STEM: {exercise.content.stem}</Badge>
          </div>
        )}

        {exercise.readingText && (
          <Card className="p-4 mb-4 bg-slate-50 text-sm font-medium text-slateText-muted leading-relaxed">
            {exercise.readingText}
          </Card>
        )}

        <h1 className="text-xl sm:text-2xl font-black text-slateText-main mb-8 leading-snug">
          {exercise.questionText}
        </h1>

        {isChoiceExercise(exercise) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(exercise.options || []).map((option) => {
              const isSelected = selectedOption === option
              return (
                <Card
                  key={option}
                  interactive
                  selected={isSelected}
                  onClick={() => status === 'idle' && !blocked && setSelectedOption(option)}
                  className={`
                    p-5 text-center font-black text-base cursor-pointer select-none transition-all
                    ${isSelected ? '!border-mint !bg-mint-50 shadow-[0_4px_0_#58CC02]' : ''}
                  `}
                >
                  <span className={isSelected ? 'text-mint' : 'text-slateText-main'}>
                    {option}
                  </span>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={gapInput}
              onChange={(e) => status === 'idle' && setGapInput(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="input-playful text-lg font-black text-center py-4"
              disabled={status !== 'idle' || blocked}
            />
          </div>
        )}

        {status !== 'idle' && exercise.explanation_rule && (
          <Card className="p-4 mt-6 bg-sky-50 border-sky/30 text-sm font-bold text-slateText-main">
            {exercise.explanation_rule}
          </Card>
        )}
      </main>

      <div
        className={`
          w-full border-t-2 transition-all duration-200 py-4 px-4 sm:px-8
          ${
            status === 'correct'
              ? 'bg-mint-50 border-mint/40 text-mint-dark'
              : status === 'incorrect'
              ? 'bg-coral-50 border-coral/40 text-coral-dark'
              : 'bg-white border-ceferlyBorder'
          }
        `}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {status === 'idle' ? (
            <div className="hidden sm:block text-xs font-bold text-slateText-muted">
              {blocked ? 'Necesitas vidas para comprobar' : 'Selecciona o escribe una respuesta para verificar'}
            </div>
          ) : status === 'correct' ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-mint text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-lg text-mint-dark">¡Excelente trabajo!</h3>
                <p className="text-xs font-bold text-mint-hover">+ monedas · racha {streak} · {coins} 💎</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-coral text-white flex items-center justify-center shadow-md">
                <AlertCircle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-lg text-coral-dark">Respuesta incorrecta</h3>
                <p className="text-xs font-bold text-coral-hover">
                  Solución esperada: <strong className="underline">{String(exercise.correctAnswer)}</strong>
                </p>
              </div>
            </div>
          )}

          <div className="w-full sm:w-auto">
            {status === 'idle' ? (
              <Button
                variant="mint"
                size="lg"
                fullWidth
                disabled={blocked || submitting || (isChoiceExercise(exercise) ? !selectedOption : !gapInput.trim())}
                onClick={handleCheckAnswer}
              >
                {submitting ? 'Guardando...' : 'Comprobar'}
              </Button>
            ) : (
              <Button
                variant={status === 'correct' ? 'mint' : 'coral'}
                size="lg"
                fullWidth
                onClick={handleContinue}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
