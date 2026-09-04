import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ShoppingBag, Sparkles, Coins, Check, RefreshCw } from 'lucide-react'

type Profile = {
  username: string
  coins: number
  avatarSeed: string
}

type Status = 'loading' | 'ready' | 'purchasing' | 'success' | 'error'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

const DEMO_PROFILE: Profile = {
  username: 'Guest scholar',
  coins: 120,
  avatarSeed: 'ceferly-scholar-mint',
}

const AVATAR_PACKS = [
  { id: 'pack-classic', name: 'Cambridge Classic', cost: 30, color: 'mint', description: 'Paleta académica tradicional de Cambridge' },
  { id: 'pack-fire', name: 'Streak Flame', cost: 50, color: 'amber', description: 'Destello ardiente para estudiantes constantes' },
  { id: 'pack-sky', name: 'Oxford Cerulean', cost: 75, color: 'sky', description: 'Azul cielo real con aura luminosa' },
  { id: 'pack-royal', name: 'C2 Proficiency Royal', cost: 100, color: 'amethyst', description: 'Exclusivo avatar violeta de maestría' },
]

export function Shop() {
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE)
  const [status, setStatus] = useState<Status>('loading')
  const [notice, setNotice] = useState('Cargando tu tienda de avatares...')
  const [selectedPack, setSelectedPack] = useState(AVATAR_PACKS[0])

  const token = useMemo(() => localStorage.getItem('token'), [])

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setStatus('ready')
        setNotice('Modo demostración activo. Inicia sesión para guardar compras reales.')
        return
      }

      try {
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('No se pudo cargar el perfil')

        const data = await response.json()
        setProfile({
          username: data.username || DEMO_PROFILE.username,
          coins: data.coins ?? 0,
          avatarSeed: data.avatar_seed || `ceferly-${data.id ?? 'default'}`,
        })
        setStatus('ready')
        setNotice('¡Tu avatar está listo para ser personalizado!')
      } catch {
        setStatus('ready')
        setProfile(DEMO_PROFILE)
        setNotice('Modo demostración con datos de prueba.')
      }
    }

    loadProfile()
  }, [token])

  const handlePurchase = async (pack: typeof AVATAR_PACKS[0]) => {
    if (profile.coins < pack.cost) {
      setNotice(`Necesitas ${pack.cost - profile.coins} monedas más para este avatar. ¡Sigue practicando!`)
      return
    }

    setStatus('purchasing')

    if (!token) {
      setTimeout(() => {
        setProfile(prev => ({
          ...prev,
          coins: prev.coins - pack.cost,
          avatarSeed: `seed-${pack.id}-${Date.now()}`
        }))
        setStatus('success')
        setNotice(`¡Has desbloqueado el estilo ${pack.name}!`)
      }, 500)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cost: pack.cost, packId: pack.id })
      })

      if (!res.ok) throw new Error('Error al comprar avatar')
      const data = await res.json()
      setProfile(prev => ({
        ...prev,
        coins: data.coins ?? (prev.coins - pack.cost),
        avatarSeed: data.avatar_seed ?? `seed-${pack.id}`
      }))
      setStatus('success')
      setNotice(`¡Avatar ${pack.name} equipado con éxito!`)
    } catch {
      setStatus('error')
      setNotice('Hubo un error al procesar la compra.')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-playful p-6 bg-gradient-to-r from-mint-50 to-sky-50 border-mint/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center text-white shadow-btn-mint">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slateText-main">Tienda de Recompensas</h1>
            <p className="text-slateText-muted text-sm font-bold">Personaliza tu experiencia y luce tu nivel en Ceferly</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-pill bg-white border-2 border-amber/40 shadow-sm">
          <Coins className="w-5 h-5 text-amber fill-amber" />
          <span className="font-black text-amber-dark text-lg">{profile.coins}</span>
          <span className="text-xs font-bold text-slateText-muted">Monedas</span>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-3 rounded-2xl bg-white border-2 border-ceferlyBorder flex items-center gap-3 text-sm font-bold text-slateText-main">
          <Sparkles className="w-5 h-5 text-mint" />
          <span>{notice}</span>
        </div>
      )}

      {/* Active Avatar Preview Card */}
      <Card className="flex flex-col sm:flex-row items-center gap-6 p-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-mint to-sky flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-lg">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl font-black text-slateText-main">{profile.username}</h2>
            <Badge variant="mint">Equipado</Badge>
          </div>
          <p className="text-xs text-slateText-muted font-bold mb-2">Semilla de avatar: {profile.avatarSeed}</p>
          <p className="text-sm text-slateText-muted">
            Gana más monedas completando ejercicios diarios con buena precisión.
          </p>
        </div>
      </Card>

      {/* Avatar Packs Grid */}
      <div>
        <h2 className="text-xl font-black text-slateText-main mb-4 flex items-center gap-2">
          <span>Estilos de Avatar Desbloqueables</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AVATAR_PACKS.map((pack) => {
            const isAffordable = profile.coins >= pack.cost
            const isSelected = selectedPack.id === pack.id

            return (
              <Card
                key={pack.id}
                interactive
                selected={isSelected}
                onClick={() => setSelectedPack(pack)}
                className="flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                      pack.color === 'mint' ? 'bg-mint' :
                      pack.color === 'amber' ? 'bg-amber' :
                      pack.color === 'sky' ? 'bg-sky' : 'bg-amethyst'
                    }`}>
                      {pack.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-amber-50 border border-amber/30">
                      <Coins className="w-4 h-4 text-amber fill-amber" />
                      <span className="font-black text-amber-dark text-xs">{pack.cost}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slateText-main mb-1">{pack.name}</h3>
                  <p className="text-xs text-slateText-muted font-bold mb-4">{pack.description}</p>
                </div>

                <Button
                  variant={pack.color === 'mint' ? 'mint' : pack.color === 'amber' ? 'amber' : pack.color === 'sky' ? 'sky' : 'amethyst'}
                  fullWidth
                  size="sm"
                  disabled={!isAffordable || status === 'purchasing'}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePurchase(pack)
                  }}
                  leftIcon={status === 'purchasing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                >
                  {status === 'purchasing' ? 'Procesando...' : isAffordable ? `Desbloquear por ${pack.cost}` : 'Monedas insuficientes'}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
