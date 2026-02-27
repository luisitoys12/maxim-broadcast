import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

export const useSceneStore = create((set, get) => ({
  scenes: [],
  activeScene: null,
  loading: false,

  fetchScenes: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/scenes')
      set({ scenes: data.scenes })
      const active = data.scenes.find(s => s.active)
      set({ activeScene: active })
    } catch (error) {
      console.error('Failed to fetch scenes:', error)
      toast.error('Error al cargar escenas')
    } finally {
      set({ loading: false })
    }
  },

  createScene: async (name) => {
    try {
      const { data } = await api.post('/scenes', { name })
      set({ scenes: [...get().scenes, data.scene] })
      toast.success('Escena creada')
      return data.scene
    } catch (error) {
      toast.error('Error al crear escena')
      throw error
    }
  },

  deleteScene: async (id) => {
    try {
      await api.delete(`/scenes/${id}`)
      set({ scenes: get().scenes.filter(s => s.id !== id) })
      toast.success('Escena eliminada')
    } catch (error) {
      toast.error('Error al eliminar escena')
      throw error
    }
  },

  activateScene: async (id) => {
    try {
      await api.post(`/scenes/${id}/activate`)
      const scenes = get().scenes.map(s => ({
        ...s,
        active: s.id === id
      }))
      set({ scenes, activeScene: scenes.find(s => s.id === id) })
      toast.success('Escena activada')
    } catch (error) {
      toast.error('Error al activar escena')
      throw error
    }
  }
}))
