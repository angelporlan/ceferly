const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export interface UserProfile {
  id: number
  name: string
  username: string
  email: string
  subscription_role: 'free' | 'pro' | 'premium'
  coins: number
  streak: number
  daily_goal: number
  avatar_seed?: string
  level?: { id: number; name: string }
}

export const authService = {
  getToken: (): string | null => {
    return localStorage.getItem('token')
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token)
  },

  removeToken: (): void => {
    localStorage.removeItem('token')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },

  login: async (email: string, password: string): Promise<{ token: string }> => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al iniciar sesión')
    }
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    return data
  },

  register: async (payload: { name: string; username: string; email: string; password: string }): Promise<{ token: string }> => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al registrar usuario')
    }
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    return data
  },

  getProfile: async (): Promise<UserProfile> => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No autenticado')

    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Error al obtener perfil')
    return res.json()
  },

  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Error al actualizar perfil')
    return res.json()
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}/users/me/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al cambiar contraseña')
    }
    return res.json()
  },

  logout: (): void => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  },
}
