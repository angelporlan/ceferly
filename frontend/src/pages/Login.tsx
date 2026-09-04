import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton'
import { authService } from '../services/auth.service'
import { Lock, Mail } from 'lucide-react'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login(email, password)
      navigate('/learn')
    } catch (err: any) {
      setError(err.message || 'Credenciales no válidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-12">
      {/* Brand logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-white font-black text-2xl shadow-btn-mint">
          C
        </div>
        <span className="font-black text-3xl text-mint tracking-tight">ceferly</span>
      </div>

      <Card className="max-w-md w-full p-8 shadow-card-3d border-2 border-ceferlyBorder">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slateText-main">Iniciar Sesión</h1>
          <p className="text-xs font-bold text-slateText-muted mt-1">
            Continúa preparando tu certificación Cambridge
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-coral-50 border border-coral/30 text-xs font-bold text-coral text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-black text-mint hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            variant="mint"
            size="lg"
            type="submit"
            fullWidth
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-ceferlyBorder"></div>
          </div>
          <div className="relative bg-white px-3 text-[11px] font-black uppercase tracking-wider text-slateText-muted">
            O continúa con
          </div>
        </div>

        <GoogleLoginButton />

        <div className="text-center mt-6 pt-6 border-t-2 border-slate-100">
          <p className="text-xs font-bold text-slateText-muted">
            ¿No tienes cuenta todavía?{' '}
            <Link to="/register" className="font-black text-mint hover:underline">
              Crea una cuenta gratis
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
