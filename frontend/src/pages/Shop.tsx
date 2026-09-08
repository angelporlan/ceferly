import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ShoppingBag, Sparkles, Coins, Check, RefreshCw, Heart } from 'lucide-react'

type Profile = {
  username: string
  coins: number
  hearts: number
  avatarSeed: string
}

type Status = 'loading' | 'ready' | 'purchasing' | 'success' | 'error'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

const EMPTY_PROFILE: Profile = {
  username: 'Invitado',
  coins: 0,
  hearts: 0,
  avatarSeed: 'ceferly-guest',
}

const SHOP_ITEMS = [
  { id: 'heart-refill', name: 'Recarga de 5 vidas', cost: 30, color: 'coral', description: 'Restaura tus corazones para seguir la racha diaria' },
  { id: 'pack-classic', name: 'Cambridge Classic', cost: 30, color: 'mint', description: 'Paleta académica tradicional de Cambridge' },
  { id: 'pack-fire', name: 'Streak Flame', cost: 50, color: 'amber', description: 'Destello ardiente para estudiantes constantes' },
  { id: 'pack-sky', name: 'Oxford Cerulean', cost: 75, color: 'sky', description: 'Azul cielo real con aura luminosa' },
  { id: 'pack-royal', name: 'C1 Advanced Royal', cost: 100, color: 'amethyst', description: 'Avatar violeta de maestría C1' },
]

export function Shop() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE)
  const [status, setStatus] = useState<Status>('loading')
  const [notice, setNotice] = useState('Cargando tu tienda de recompensas...')
  const [selectedPack, setSelectedPack] = useState(SHOP_ITEMS[0])

  const token = useMemo(() => localStorage.getItem('token'), [])

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setProfile(EMPTY_PROFILE)
        setStatus('ready')
        setNotice('Inicia sesión para gastar monedas reales y recargar vidas.')
        return
      }

      try {
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('No se pudo cargar el perfil')

        const data = await response.json()
        setProfile({
          username: data.username || EMPTY_PROFILE.username,
          coins: data.coins ?? 0,
          hearts: data.hearts ?? 0,
          avatarSeed: data.avatar_seed || `ceferly-${data.id ?? 'default'}`,
        })
        setStatus('ready')
        setNotice('¡Tu avatar y tus vidas están listos para personalizarse!')
      } catch {
        setStatus('ready')
        setProfile(EMPTY_PROFILE)
        setNotice('No se pudo sincronizar tu saldo. Inicia sesión de nuevo.')
      }
    }

    loadProfile()
  }, [token])

  const handlePurchase = async (pack: typeof SHOP_ITEMS[0]) => {
    if (profile.coins < pack.cost) {
      setNotice(`Necesitas ${pack.cost - profile.coins} monedas más para este artículo. ¡Sigue practicando!`)
      return
    }

    if (!token) {
      setNotice('Inicia sesión para guardar compras reales.')
      return
    }

    setStatus('purchasing')

    try {
      const res = await fetch(`${API_BASE}/users/me/shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: pack.id })
      })

      if (!res.ok) throw new Error('Error al comprar')
      const data = await res.json()
      setProfile(prev => ({
        ...prev,
        coins: data.coins ?? prev.coins,
        hearts: data.hearts ?? prev.hearts,
        avatarSeed: data.avatar_seed ?? prev.avatarSeed
      }))
      setStatus('success')
      setNotice(pack.id === 'heart-refill' ? '¡Vidas recargadas!' : `¡Has desbloqueado ${pack.name}!`)
    } catch {
      setStatus('error')
      setNotice('Hubo un error al procesar la compra.')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-playful p-6 bg-gradient-to-r from-mint-50 to-sky-50 border-mint/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center text-white shadow-btn-mint">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slateText-main">Tienda de Recompensas</h1>
            <p className="text-slateText-muted text-sm font-bold">Gasta gemas ganadas en ejercicios reales de Cambridge</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-pill bg-white border-2 border-amber/40 shadow-sm">
            <Coins className="w-5 h-5 text-amber fill-amber" />
            <span className="font-black text-amber-dark text-lg">{profile.coins}</span>
            <span className="text-xs font-bold text-slateText-muted">Monedas</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-pill bg-white border-2 border-coral/40 shadow-sm">
            <Heart className="w-5 h-5 text-coral fill-coral" />
            <span className="font-black text-coral-dark text-lg">{profile.hearts}</span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-3 rounded-2xl bg-white border-2 border-ceferlyBorder flex items-center gap-3 text-sm font-bold text-slateText-main">
          <Sparkles className="w-5 h-5 text-mint" />
          <span>{notice}</span>
        </div>
      )}

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
            Gana monedas completando ejercicios B1, B2 y C1. Las vidas se descuentan al fallar.
          </p>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-black text-slateText-main mb-4 flex items-center gap-2">
          <span>Vidas y estilos desbloqueables</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SHOP_ITEMS.map((pack) => {
            const isAffordable = profile.coins >= pack.cost
            const isSelected = selectedPack.id === pack.id
            const variant = pack.color === 'mint' ? 'mint' : pack.color === 'amber' ? 'amber' : pack.color === 'sky' ? 'sky' : pack.color === 'coral' ? 'coral' : 'amethyst'

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
                      pack.color === 'sky' ? 'bg-sky' :
                      pack.color === 'coral' ? 'bg-coral' : 'bg-amethyst'
                    }`}>
                      {pack.id === 'heart-refill' ? <Heart className="w-6 h-6 fill-white" /> : pack.name.charAt(0)}
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
                  variant={variant}
                  fullWidth
                  size="sm"
                  disabled={!token || !isAffordable || status === 'purchasing'}
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
