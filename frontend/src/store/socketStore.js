import { create } from 'zustand'
import { io } from 'socket.io-client'

let socket = null

export const useSocketStore = create((set, get) => ({
  connected: false,
  stats: null,

  connect: () => {
    if (socket) return

    socket = io('http://localhost:4000', {
      transports: ['websocket']
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      set({ connected: true })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      set({ connected: false })
    })

    socket.on('stats-update', (stats) => {
      set({ stats })
    })

    socket.on('scene-changed', (data) => {
      console.log('Scene changed:', data)
    })

    socket.on('source-toggled', (data) => {
      console.log('Source toggled:', data)
    })
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect()
      socket = null
      set({ connected: false })
    }
  },

  emit: (event, data) => {
    if (socket && socket.connected) {
      socket.emit(event, data)
    }
  }
}))
