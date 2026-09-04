import React, { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { authService, type UserProfile } from '../services/auth.service'
import { Flame, Coins, LogOut, Key } from 'lucide-react'

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    authService
      .getProfile()
      .then(setProfile)
      .catch(() => {
        setProfile({
          id: 1,
          name: 'Ángel Porlán',
          username: 'angelporlan',
          email: 'angel@example.com',
          subscription_role: 'pro',
          coins: 140,
          streak: 3,
          daily_goal: 5,
        })
      })
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) return
    try {
      await authService.updatePassword(oldPassword, newPassword)
      setMsg({ text: 'Contraseña actualizada correctamente', type: 'success' })
      setOldPassword('')
      setNewPassword('')
    } catch (err: any) {
      setMsg({ text: err.message || 'Error al cambiar contraseña', type: 'error' })
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Profile Overview Card */}
      <Card className="p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-full bg-mint text-white font-black text-3xl flex items-center justify-center border-4 border-mint-light shadow-lg">
          {profile?.name.charAt(0).toUpperCase() ?? 'U'}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slateText-main">{profile?.name}</h1>
            <Badge variant="amethyst">{profile?.subscription_role?.toUpperCase()} MEMBER</Badge>
          </div>
          <p className="text-xs font-bold text-slateText-muted mb-3">@{profile?.username} · {profile?.email}</p>

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-dark">
              <Flame className="w-4 h-4 text-amber fill-amber" />
              <span>{profile?.streak} días racha</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-dark">
              <Coins className="w-4 h-4 text-amber fill-amber" />
              <span>{profile?.coins} monedas</span>
            </div>
          </div>
        </div>
      </Card>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${
          msg.type === 'success' ? 'bg-mint-50 text-mint-dark border-2 border-mint/30' : 'bg-coral-50 text-coral-dark border-2 border-coral/30'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Security: Change Password */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-sky" />
          <h2 className="text-lg font-black text-slateText-main">Seguridad y Contraseña</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <Input
            label="Contraseña actual"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <Button variant="sky" size="sm" type="submit" className="self-start mt-1">
            Actualizar Contraseña
          </Button>
        </form>
      </Card>

      {/* Session Management */}
      <Card className="p-6 flex items-center justify-between">
        <div>
          <h3 className="font-black text-base text-slateText-main">Cerrar Sesión</h3>
          <p className="text-xs font-bold text-slateText-muted">Desconéctate de este dispositivo</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
          Salir
        </Button>
      </Card>
    </div>
  )
}
