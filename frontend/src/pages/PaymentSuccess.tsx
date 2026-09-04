import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
      fetch(`${API_BASE}/payments/verify-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {})
    }
  }, [sessionId])

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <Card className="p-8 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-mint text-white flex items-center justify-center shadow-btn-mint">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl font-black text-slateText-main">¡Suscripción Activada!</h1>
        <p className="text-xs font-bold text-slateText-muted">
          Gracias por confiar en Ceferly Pro. Ya tienes acceso ilimitado a todas las herramientas de preparación Cambridge y tutoría con IA.
        </p>

        <Link to="/learn" className="w-full mt-2">
          <Button variant="mint" size="lg" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
            Empezar a practicar
          </Button>
        </Link>
      </Card>
    </div>
  )
}
