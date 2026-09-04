import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Play } from 'lucide-react'

interface Exercise {
  id: number
  title: string
  type: string
  questionText: string
  level?: { name: string }
}

const FALLBACK_EXERCISES: Exercise[] = [
  { id: 1, title: 'Conditionals Type 1 & 2', type: 'multiple_choice', questionText: 'Choose the correct verb tense to complete the conditional sentence.' },
  { id: 2, title: 'Mixed Conditionals Practice', type: 'gap_fill', questionText: 'Fill in the blank with the appropriate form of the verb in brackets.' },
  { id: 3, title: 'Inverted Conditionals (Had I known...)', type: 'key_word_transformation', questionText: 'Complete the second sentence so that it has a similar meaning to the first sentence.' },
]

export const ExercisesList: React.FC = () => {
  const { subcategoryId } = useParams<{ subcategoryId: string }>()
  const [exercises, setExercises] = useState<Exercise[]>(FALLBACK_EXERCISES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    fetch(`${API_BASE}/exercises?subcategoryId=${subcategoryId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setExercises(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [subcategoryId])

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
          Subcategoría #{subcategoryId ?? '1'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slateText-main mt-1">
          Ejercicios Disponibles
        </h1>
        <p className="text-sm font-bold text-slateText-muted mt-1">
          Elige un ejercicio y pon a prueba tus conocimientos de Cambridge English
        </p>
      </div>

      {loading && (
        <div className="text-center py-8 font-bold text-slateText-muted">
          Cargando ejercicios...
        </div>
      )}

      {/* Exercise cards list */}
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
    </div>
  )
}
