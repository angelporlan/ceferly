import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { BookOpen, Sparkles, ChevronRight, GraduationCap } from 'lucide-react'
import { normalizeCategoriesPayload, type CategoryRow } from '../lib/categoriesData.mjs'

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [requestState, setRequestState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    fetch(`${API_BASE}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Categories request failed')
        return res.json()
      })
      .then((payload: unknown) => {
        const normalized = normalizeCategoriesPayload(payload)
        if (normalized === null) throw new Error('Invalid categories response')
        if (cancelled) return
        setCategories(normalized)
        setRequestState('ready')
      })
      .catch(() => {
        if (!cancelled) setRequestState('error')
      })
    return () => {
      cancelled = true
    }
  }, [retryCount])

  const retry = () => {
    setRequestState('loading')
    setRetryCount((count) => count + 1)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="card-playful p-6 bg-gradient-to-r from-sky-50 to-mint-50 border-sky/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky flex items-center justify-center text-white shadow-btn-sky">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slateText-main">
              Categorías de Examen
            </h1>
            <p className="text-sm font-bold text-slateText-muted">
              Explora y practica las secciones oficiales del examen Cambridge
            </p>
          </div>
        </div>
        <Badge variant="sky">B1 Preliminary · B2 First · C1 Advanced</Badge>
      </div>

      {requestState === 'loading' && (
        <div role="status" aria-live="polite" className="text-center py-10 font-bold text-slateText-muted">
          Cargando categorías...
        </div>
      )}

      {requestState === 'error' && (
        <Card role="alert" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm font-bold text-slateText-muted">
            No se pudieron cargar las categorías. Comprueba tu conexión e inténtalo de nuevo.
          </p>
          <Button variant="secondary" size="sm" onClick={retry}>Reintentar</Button>
        </Card>
      )}

      {requestState === 'ready' && categories.length === 0 && (
        <Card className="text-sm font-bold text-slateText-muted">
          Todavía no hay categorías con ejercicios disponibles. Vuelve más tarde para seguir practicando.
        </Card>
      )}

      {/* Categories Grid */}
      {requestState === 'ready' && categories.length > 0 && (
        <div className="flex flex-col gap-8">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mint" />
                <h2 className="text-xl font-black text-slateText-main">{cat.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.subcategories.map((sub) => (
                  <Link key={sub.id} to={`/categories/${sub.id}/exercises`}>
                    <Card interactive className="p-5 flex items-center justify-between group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-mint-50 border border-mint/30 flex items-center justify-center text-mint group-hover:scale-105 transition-transform">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-slateText-main group-hover:text-mint transition-colors">
                            {sub.name}
                          </h3>
                          <p className="text-xs text-slateText-muted font-bold line-clamp-2 mt-0.5">
                            {sub.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-mint group-hover:translate-x-1 transition-all" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
