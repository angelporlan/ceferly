import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Trophy, Sparkles, RefreshCw, Flame, ArrowRight, Bot } from 'lucide-react'

export const ResultsPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as {
    exerciseId?: number
    exerciseTitle?: string
    isCorrect?: boolean
    correctAnswer?: string
    userAnswer?: string
    questionText?: string
  } | null

  const isCorrect = state?.isCorrect ?? true
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(false)

  const handleGetAiExplanation = async () => {
    setLoadingAi(true)
    const token = localStorage.getItem('token')
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

    try {
      const res = await fetch(`${API_BASE}/ai/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          questionText: state?.questionText ?? 'Exercise question',
          userAnswer: state?.userAnswer ?? '',
          correctAnswer: state?.correctAnswer ?? '',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiExplanation(data.explanation || data.message || 'Explicación generada.')
      } else {
        setAiExplanation(
          `En el examen de Cambridge B2/C1, esta estructura requiere "${state?.correctAnswer}". Recuerda que en este contexto el tiempo verbal o la colocación sigue las reglas de concordancia temporal.`
        )
      }
    } catch {
      setAiExplanation(
        `En el examen de Cambridge B2/C1, esta estructura requiere "${state?.correctAnswer}". Recuerda que en este contexto el tiempo verbal o la colocación sigue las reglas de concordancia temporal.`
      )
    } finally {
      setLoadingAi(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-8 gap-6 text-center">
      {/* Trophy & Mascot illustration */}
      <div className="relative">
        <div
          className={`
            w-28 h-28 rounded-3xl flex items-center justify-center shadow-lg
            ${isCorrect ? 'bg-mint text-white shadow-btn-mint' : 'bg-amber text-white shadow-btn-amber'}
          `}
        >
          {isCorrect ? (
            <Trophy className="w-16 h-16" />
          ) : (
            <Sparkles className="w-16 h-16" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-white shadow-md border border-slate-200">
          <Flame className="w-6 h-6 text-amber fill-amber animate-bounce" />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-black text-slateText-main">
          {isCorrect ? '¡Lección Completada!' : '¡Buen intento! Sigue así'}
        </h1>
        <p className="text-sm font-bold text-slateText-muted mt-1">
          {isCorrect
            ? 'Has demostrado dominio de esta estructura del examen Cambridge.'
            : 'Cada error es una oportunidad para consolidar tu aprendizaje.'}
        </p>
      </div>

      {/* Rewards Summary Grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <Card className="p-4 flex flex-col items-center gap-1 border-mint/40 bg-mint-50/50">
          <span className="text-[10px] font-black uppercase text-mint-dark">Precisión</span>
          <span className="text-2xl font-black text-mint">{isCorrect ? '100%' : '50%'}</span>
        </Card>

        <Card className="p-4 flex flex-col items-center gap-1 border-amber/40 bg-amber-50/50">
          <span className="text-[10px] font-black uppercase text-amber-dark">Puntos XP</span>
          <span className="text-2xl font-black text-amber">+{isCorrect ? '20' : '10'}</span>
        </Card>

        <Card className="p-4 flex flex-col items-center gap-1 border-sky/40 bg-sky-50/50">
          <span className="text-[10px] font-black uppercase text-sky-dark">Racha</span>
          <span className="text-2xl font-black text-sky">3 días</span>
        </Card>
      </div>

      {/* AI Explanation Assistant Box */}
      <Card className="w-full p-5 text-left border-amethyst/30 bg-gradient-to-br from-amethyst-50 to-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amethyst text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slateText-main">Tutor Inteligente IA</h3>
              <span className="text-[10px] font-bold text-amethyst-dark">Análisis pedagógico instantáneo</span>
            </div>
          </div>
          <Badge variant="amethyst">Ceferly AI</Badge>
        </div>

        {aiExplanation ? (
          <div className="p-3.5 rounded-xl bg-white border border-amethyst/20 text-xs font-semibold text-slateText-main leading-relaxed">
            {aiExplanation}
          </div>
        ) : (
          <Button
            variant="amethyst"
            size="sm"
            onClick={handleGetAiExplanation}
            disabled={loadingAi}
            leftIcon={loadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          >
            {loadingAi ? 'Analizando con IA...' : 'Explicar por qué esta es la respuesta'}
          </Button>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => navigate('/categories')}
        >
          Más ejercicios
        </Button>
        <Button
          variant="mint"
          size="lg"
          fullWidth
          onClick={() => navigate('/learn')}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
