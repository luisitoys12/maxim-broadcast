import { useEffect, useState } from 'react'
import { Play, Square, Circle, Users, Activity, Cpu } from 'lucide-react'
import { useOBSStore } from '../store/obsStore'
import { useSocketStore } from '../store/socketStore'
import PreviewPanel from '../components/PreviewPanel'
import StatsPanel from '../components/StatsPanel'

export default function Dashboard() {
  const { status, startStreaming, stopStreaming, startRecording, stopRecording } = useOBSStore()
  const { stats, connected } = useSocketStore()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Control central de producción</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connected ? 'bg-success-500' : 'bg-danger-500'
          }`} />
          <span className="text-sm text-gray-400">
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Activity className="text-primary-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">FPS</p>
              <p className="text-2xl font-bold">{stats?.fps || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-500/20 rounded-lg">
              <Activity className="text-success-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bitrate</p>
              <p className="text-2xl font-bold">{stats?.bitrate || 0} kbps</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-500/20 rounded-lg">
              <Cpu className="text-warning-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">CPU</p>
              <p className="text-2xl font-bold">{stats?.cpuUsage || 0}%</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger-500/20 rounded-lg">
              <Users className="text-danger-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Frames Perdidos</p>
              <p className="text-2xl font-bold">{stats?.droppedFrames || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-3 gap-6">
        {/* Preview */}
        <div className="col-span-2">
          <PreviewPanel />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Control de Transmisión</h2>
            
            <div className="space-y-3">
              {status.streaming ? (
                <button
                  onClick={stopStreaming}
                  className="btn-danger w-full flex items-center justify-center gap-2"
                >
                  <Square size={20} />
                  Detener Stream
                </button>
              ) : (
                <button
                  onClick={startStreaming}
                  className="btn-success w-full flex items-center justify-center gap-2"
                >
                  <Play size={20} />
                  Iniciar Stream
                </button>
              )}

              {status.recording ? (
                <button
                  onClick={stopRecording}
                  className="btn-danger w-full flex items-center justify-center gap-2"
                >
                  <Square size={20} />
                  Detener Grabación
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Circle size={20} />
                  Iniciar Grabación
                </button>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estado:</span>
                <span className={status.streaming ? 'text-success-500' : 'text-gray-400'}>
                  {status.streaming ? 'En vivo' : 'Fuera de línea'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Escena actual:</span>
                <span>{status.currentScene || 'Ninguna'}</span>
              </div>
            </div>
          </div>

          <StatsPanel stats={stats} />
        </div>
      </div>
    </div>
  )
}
