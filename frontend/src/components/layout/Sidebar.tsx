import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Trophy, ShoppingBag, User, Sparkles } from 'lucide-react'

export const Sidebar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { label: 'Aprender', path: '/learn', icon: BookOpen },
    { label: 'Ejercicios', path: '/categories', icon: Sparkles },
    { label: 'Clasificación', path: '/leaderboard', icon: Trophy },
    { label: 'Tienda', path: '/shop', icon: ShoppingBag },
    { label: 'Perfil', path: '/profile', icon: User },
  ]

  return (
    <aside className="w-64 h-screen sticky top-0 hidden md:flex flex-col border-r-2 border-ceferlyBorder bg-white p-4">
      {/* Brand Logo */}
      <Link to="/learn" className="flex items-center gap-3 px-3 py-4 mb-6 group">
        <div className="w-10 h-10 rounded-2xl bg-mint flex items-center justify-center text-white font-black text-xl shadow-btn-mint group-hover:scale-105 transition-transform">
          C
        </div>
        <div className="flex flex-col text-left">
          <span className="font-black text-2xl tracking-tight text-mint leading-none">
            ceferly
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slateText-muted mt-0.5">
            Cambridge & CEFR
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path) || (item.path === '/learn' && location.pathname === '/')

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-100
                ${
                  isActive
                    ? 'bg-mint-50 text-mint border-2 border-mint shadow-[0_4px_0_#10B981]'
                    : 'text-slateText-muted hover:bg-slate-50 border-2 border-transparent hover:border-slate-200'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-mint' : 'text-slateText-muted'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Pro / Super Card */}
      <div className="card-playful p-4 bg-gradient-to-br from-amethyst-50 to-white border-amethyst/30 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amethyst font-black text-xs uppercase tracking-wider">Ceferly Pro</span>
          <span className="badge-pill bg-amethyst text-white text-[10px] px-1.5 py-0.2">AI</span>
        </div>
        <p className="text-xs text-slateText-muted font-bold mb-3">
          Práctica ilimitada y explicaciones inteligentes con IA.
        </p>
        <Link
          to="/shop"
          className="btn-3d-amethyst w-full py-2 text-xs font-black"
        >
          Mejorar Plan
        </Link>
      </div>
    </aside>
  )
}
