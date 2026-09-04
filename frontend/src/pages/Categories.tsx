import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { BookOpen, Sparkles, ChevronRight, GraduationCap } from 'lucide-react'

interface Subcategory {
  id: number
  name: string
  description: string
  categoryId: number
}

interface Category {
  id: number
  name: string
  subcategories: Subcategory[]
}

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Grammar (Gramática)',
    subcategories: [
      { id: 1, name: 'Conditionals', description: 'Zero, First, Second, Third & Mixed Conditionals', categoryId: 1 },
      { id: 2, name: 'Past & Present Perfect', description: 'Contrast between Simple and Continuous forms', categoryId: 1 },
      { id: 3, name: 'Passive Voice & Causatives', description: 'Have/get something done and passive reporting verbs', categoryId: 1 },
    ],
  },
  {
    id: 2,
    name: 'Vocabulary (Vocabulario)',
    subcategories: [
      { id: 4, name: 'Work & Business English', description: 'Employment idioms, formal expressions and phrasal verbs', categoryId: 2 },
      { id: 5, name: 'Travel & Environment', description: 'Collocations, adjectives and descriptive idioms', categoryId: 2 },
      { id: 6, name: 'Word Formation', description: 'Prefixes, suffixes and compound nouns for Cambridge B2/C1', categoryId: 2 },
    ],
  },
  {
    id: 3,
    name: 'Use of English & Reading',
    subcategories: [
      { id: 7, name: 'Multiple Choice (Part 1)', description: 'Vocabulary collocations and fixed prepositions', categoryId: 3 },
      { id: 8, name: 'Open Cloze (Part 2)', description: 'Prepositions, pronouns, conjunctions and modal auxiliaries', categoryId: 3 },
      { id: 9, name: 'Key Word Transformation (Part 4)', description: 'Sentence transformations with strict word limits', categoryId: 3 },
    ],
  },
]

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
    const token = localStorage.getItem('token')

    fetch(`${API_BASE}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
        <Badge variant="sky">Nivel B2 / C1</Badge>
      </div>

      {loading && (
        <div className="text-center py-10 font-bold text-slateText-muted">
          Cargando categorías...
        </div>
      )}

      {/* Categories Grid */}
      <div className="flex flex-col gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mint" />
              <h2 className="text-xl font-black text-slateText-main">{cat.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(cat.subcategories || []).map((sub) => (
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
    </div>
  )
}
