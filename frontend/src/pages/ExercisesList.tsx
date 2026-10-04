import React, { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Play } from 'lucide-react'
import { normalizeExercisesPayload, type ExerciseRow } from '../lib/exercisesData.mjs'

export const ExercisesList: React.FC = () => {
  const { subcategoryId } = useParams<{ subcategoryId: string }>()
  const [searchParams] = useSearchParams()
  const level = searchParams.get('level') || ''
  const [retryCount, setRetryCount] = useState(0)
  const [result, setResult] = useState<{
    requestKey: string
    state: 'ready' | 'error'
    exercises: ExerciseRow[]
  } | null>(null)
  const requestKey = `${subcategoryId ?? ''}:${level}:${retryCount}`
  const currentResult = result?.requestKey === requestKey ? result : null
  const requestState = currentResult?.state ?? 'loading'
  const exercises = currentResult?.exercises ?? []

  useEffect(() => {
    let cancelled = false
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')
    const levelQuery = level ? `&level=${encodeURIComponent(level)}` : ''

    fetch(`${API_BASE}/exercises?subcategoryId=${subcategoryId}${levelQuery}&limit=20`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Exercises request failed')
        return res.json()
      })
      .then((payload: unknown) => {
        const normalized = normalizeExercisesPayload(payload)
        if (normalized === null) throw new Error('Invalid exercises response')
        if (cancelled) return
        setResult({ requestKey, state: 'ready', exercises: normalized })
      })
      .catch(() => {
        if (!cancelled) setResult({ requestKey, state: 'error', exercises: [] })
      })
    return () => {
      cancelled = true
    }
  }, [subcategoryId, level, retryCount, requestKey])

  const retry = () => {
    setRetryCount((count) => count + 1)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Back button & title */}
      <div className="flex items-center gap-4">
        <Link to="/categories">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver a categorías
          </Button>
        </Link>
      </div>

      <div className="card-playful p-6 bg-gradient-to-r from-mint-50 to-white border-mint/30">
        <span className="text-xs font-black uppercase tracking-wider text-mint-dark">
          Subcategoría #{subcategoryId ?? '1'} {level ? `· ${level}` : ''}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slateText-main mt-1">
          Ejercicios Disponibles
        </h1>
        <p className="text-sm font-bold text-slateText-muted mt-1">
          Elige un ejercicio y pon a prueba tus conocimientos de Cambridge English
        </p>
      </div>

      {requestState === 'loading' && (
        <div role="status" aria-live="polite" className="text-center py-8 font-bold text-slateText-muted">
          Cargando ejercicios...
        </div>
      )}

      {requestState === 'error' && (
        <Card role="alert" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm font-bold text-slateText-muted">
            No se pudieron cargar los ejercicios. Comprueba tu conexión e inténtalo de nuevo.
          </p>
          <Button variant="secondary" size="sm" onClick={retry}>Reintentar</Button>
        </Card>
      )}

      {requestState === 'ready' && exercises.length === 0 && (
        <Card className="p-6 text-sm font-bold text-slateText-muted">
          No hay ejercicios en esta combinación todavía. Prueba otro nivel o categoría.
        </Card>
      )}

      {/* Exercise cards list */}
      {requestState === 'ready' && exercises.length > 0 && (
        <div className="flex flex-col gap-4">
          {exercises.map((ex, index) => (
            <Card key={ex.id} interactive className="p-5 flex items-center justify-between group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-white font-black text-lg shadow-btn-mint group-hover:scale-105 transition-transform">
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base text-slateText-main group-hover:text-mint transition-colors">
                      {ex.title}
                    </h3>
                    <Badge variant={ex.type === 'multiple_choice' ? 'sky' : 'amber'}>
                      {ex.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slateText-muted font-bold line-clamp-2">
                    {ex.questionText}
                  </p>
                </div>
              </div>

              <Link to={`/exercises/${ex.id}`}>
                <Button variant="mint" size="sm" rightIcon={<Play className="w-3.5 h-3.5 fill-white" />}>
                  Practicar
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
