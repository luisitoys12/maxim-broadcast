import { create } from 'zustand'
import api from '../lib/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('maxim_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('maxim_token', data.token)
      set({ token: data.token, user: data.user, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'Error al iniciar sesión', loading: false })
      return false
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { username, email, password })
      localStorage.setItem('maxim_token', data.token)
      set({ token: data.token, user: data.user, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'Error al registrarse', loading: false })
      return false
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user })
    } catch {
      localStorage.removeItem('maxim_token')
      set({ token: null, user: null })
    }
  },

  logout: () => {
    localStorage.removeItem('maxim_token')
    set({ token: null, user: null })
  }
}))
