import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

export const useOBSStore = create((set, get) => ({
  status: {
    initialized: false,
    streaming: false,
    recording: false,
    currentScene: null,
    version: 'unknown'
  },

  fetchStatus: async () => {
    try {
      const { data } = await api.get('/obs/status')
      set({ status: data })
    } catch (error) {
      console.error('Failed to fetch OBS status:', error)
    }
  },

  startStreaming: async () => {
    try {
      await api.post('/obs/start')
      toast.success('Streaming iniciado')
      get().fetchStatus()
    } catch (error) {
      toast.error('Error al iniciar streaming')
      console.error(error)
    }
  },

  stopStreaming: async () => {
    try {
      await api.post('/obs/stop')
      toast.success('Streaming detenido')
      get().fetchStatus()
    } catch (error) {
      toast.error('Error al detener streaming')
      console.error(error)
    }
  },

  startRecording: async () => {
    try {
      await api.post('/obs/start-recording')
      toast.success('Grabación iniciada')
      get().fetchStatus()
    } catch (error) {
      toast.error('Error al iniciar grabación')
      console.error(error)
    }
  },

  stopRecording: async () => {
    try {
      await api.post('/obs/stop-recording')
      toast.success('Grabación detenida')
      get().fetchStatus()
    } catch (error) {
      toast.error('Error al detener grabación')
      console.error(error)
    }
  }
}))
