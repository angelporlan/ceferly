import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Trophy, ShoppingBag, User, Sparkles } from 'lucide-react'

export const MobileNav: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { label: 'Aprender', path: '/learn', icon: BookOpen },
    { label: 'Práctica', path: '/categories', icon: Sparkles },
    { label: 'Ranking', path: '/leaderboard', icon: Trophy },
    { label: 'Tienda', path: '/shop', icon: ShoppingBag },
    { label: 'Perfil', path: '/profile', icon: User },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-2 border-ceferlyBorder flex items-center justify-around px-2 z-30 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname.startsWith(item.path) || (item.path === '/learn' && location.pathname === '/')

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all
              ${isActive ? 'text-mint font-black scale-110' : 'text-slateText-muted font-bold'}
            `}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
