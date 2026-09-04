import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

    try {
      await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {}

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-12">
      <Card className="max-w-md w-full p-8 shadow-card-3d border-2 border-ceferlyBorder text-center">
        <div className="flex justify-start mb-4">
          <Link to="/login" className="flex items-center gap-1.5 text-xs font-black text-slateText-muted hover:text-mint">
            <ArrowLeft className="w-4 h-4" />
            Volver a inicio
          </Link>
        </div>

        <h1 className="text-2xl font-black text-slateText-main mb-2">Recuperar Contraseña</h1>
        <p className="text-xs font-bold text-slateText-muted mb-6">
          Introduce tu correo y te enviaremos las instrucciones de restablecimiento.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-mint-50 border-2 border-mint/30 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-mint" />
            <span className="text-sm font-black text-mint-dark">¡Correo enviado!</span>
            <p className="text-xs text-mint-hover">
              Si el correo está registrado, recibirás un enlace de recuperación.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Button variant="mint" size="lg" type="submit" fullWidth disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
