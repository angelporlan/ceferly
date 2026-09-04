import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { X, Heart, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

interface ExerciseData {
  id: number
  title: string
  type: string
  questionText: string
  readingText?: string
  options?: string[]
  correctAnswer: any
}

const DEMO_EXERCISE: ExerciseData = {
  id: 1,
  title: 'Cambridge B2 — Second Conditional',
  type: 'multiple_choice',
  questionText: 'If I ______ enough money, I would travel around the world next year.',
  options: ['had', 'have', 'would have', 'will have'],
  correctAnswer: 'had',
}

export const ExercisePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState<ExerciseData>(DEMO_EXERCISE)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [gapInput, setGapInput] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [hearts, setHearts] = useState(5)

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    fetch(`${API_BASE}/exercises/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (data.title || data.id)) {
          const resolvedQuestionText = data.questionText || data.question_text || ''
          const resolvedCorrectAnswer = data.correctAnswer !== undefined ? data.correctAnswer : data.correct_answer
          const resolvedReadingText = data.readingText || data.reading_text || ''
          const resolvedOptions = Array.isArray(data.options)
            ? data.options
            : (typeof data.options === 'object' && data.options !== null ? Object.values(data.options) : DEMO_EXERCISE.options)

          setExercise({
            ...data,
            title: data.title || DEMO_EXERCISE.title,
            type: data.type || DEMO_EXERCISE.type,
            questionText: resolvedQuestionText || DEMO_EXERCISE.questionText,
            correctAnswer: resolvedCorrectAnswer !== undefined ? resolvedCorrectAnswer : DEMO_EXERCISE.correctAnswer,
            readingText: resolvedReadingText,
            options: resolvedOptions,
          })
        }
      })
      .catch(() => {})
  }, [id])

  const handleCheckAnswer = () => {
    const userAnswer = exercise.type === 'multiple_choice' ? selectedOption : gapInput.trim()
    let isCorrect = false
    const expected = exercise.correctAnswer

    if (typeof expected === 'string') {
      const slashParts = expected.split('/').map((s) => s.trim().toLowerCase())
      isCorrect = slashParts.includes(String(userAnswer).toLowerCase()) || String(userAnswer).toLowerCase() === expected.toLowerCase()
    } else if (typeof expected === 'object' && expected !== null) {
      const values = Object.values(expected).map((v: any) => String(v).toLowerCase())
      isCorrect = values.includes(String(userAnswer).toLowerCase())
    } else {
      isCorrect = String(userAnswer).toLowerCase() === String(expected).toLowerCase()
    }

    if (isCorrect) {
      setStatus('correct')
    } else {
      setStatus('incorrect')
      setHearts((prev) => Math.max(0, prev - 1))
    }
  }

  const handleContinue = async () => {
    const token = localStorage.getItem('token')
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const isCorrect = status === 'correct'
    const userAnswer = exercise.type === 'multiple_choice' ? selectedOption : gapInput
    let attemptId: number | undefined

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/exercises/${id}/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userAnswer,
            totalGaps: 1,
            correctGaps: isCorrect ? 1 : 0,
            isFullyCorrect: isCorrect,
            score: isCorrect ? 100 : 0,
          }),
        })
        if (res.ok) {
          const attemptData = await res.json()
          attemptId = attemptData?.attempt?.id
        }
      } catch {
        // Continue even if network error
      }
    }

    // Navigate to results page with state
    navigate('/results', {
      state: {
        exerciseId: exercise.id,
        attemptId,
        exerciseTitle: exercise.title,
        isCorrect,
        correctAnswer: typeof exercise.correctAnswer === 'object' ? JSON.stringify(exercise.correctAnswer) : exercise.correctAnswer,
        userAnswer,
        questionText: exercise.questionText,
      },
    })
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Top Exercise Header */}
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

      {/* Main Question Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="sky">{exercise.type.replace('_', ' ')}</Badge>
          <span className="text-xs font-bold text-slateText-muted">{exercise.title}</span>
        </div>

        {exercise.readingText && (
          <Card className="p-4 mb-4 bg-slate-50 text-sm font-medium text-slateText-muted leading-relaxed">
            {exercise.readingText}
          </Card>
        )}

        {/* Prompt question with high contrast */}
        <h1 className="text-xl sm:text-2xl font-black text-slateText-main mb-8 leading-snug">
          {exercise.questionText}
        </h1>

        {/* Interactive Widgets: Multiple Choice Options or Gap Fill */}
        {exercise.type === 'multiple_choice' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(exercise.options || []).map((option) => {
              const isSelected = selectedOption === option
              return (
                <Card
                  key={option}
                  interactive
                  selected={isSelected}
                  onClick={() => status === 'idle' && setSelectedOption(option)}
                  className={`
                    p-5 text-center font-black text-base cursor-pointer select-none transition-all
                    ${isSelected ? '!border-mint !bg-mint-50 shadow-[0_4px_0_#10B981]' : ''}
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
              disabled={status !== 'idle'}
            />
          </div>
        )}
      </main>

      {/* Bottom Sheet Feedback and Action */}
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
              Selecciona una opción para verificar tu respuesta
            </div>
          ) : status === 'correct' ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-mint text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-lg text-mint-dark">¡Excelente trabajo!</h3>
                <p className="text-xs font-bold text-mint-hover">Tu respuesta es 100% correcta</p>
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
                disabled={exercise.type === 'multiple_choice' ? !selectedOption : !gapInput.trim()}
                onClick={handleCheckAnswer}
              >
                Comprobar
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
