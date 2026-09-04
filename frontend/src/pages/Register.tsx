import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authService } from '../services/auth.service'
import { User, Lock, Mail } from 'lucide-react'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.register({ name, username, email, password })
      navigate('/learn')
    } catch (err: any) {
      setError(err.message || 'Error al registrar la cuenta')
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
          <h1 className="text-2xl font-black text-slateText-main">Crear Cuenta</h1>
          <p className="text-xs font-bold text-slateText-muted mt-1">
            Empieza tu camino hacia el C1/B2 con práctica interactiva
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-coral-50 border border-coral/30 text-xs font-bold text-coral text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre Completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Nombre de Usuario"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario123"
            required
          />

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
            placeholder="Mínimo 6 caracteres"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            variant="mint"
            size="lg"
            type="submit"
            fullWidth
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t-2 border-slate-100">
          <p className="text-xs font-bold text-slateText-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-black text-mint hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
