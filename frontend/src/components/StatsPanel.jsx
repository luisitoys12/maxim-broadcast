import { Activity, AlertCircle } from 'lucide-react'

export default function StatsPanel({ stats }) {
  if (!stats) return null

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">FPS</span>
            <span className="font-medium">{stats.fps}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-success-500 transition-all"
              style={{ width: `${(stats.fps / 60) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Bitrate</span>
            <span className="font-medium">{stats.bitrate} kbps</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${(stats.bitrate / 5000) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">CPU</span>
            <span className="font-medium">{stats.cpuUsage}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-warning-500 transition-all"
              style={{ width: `${stats.cpuUsage}%` }}
            />
          </div>
        </div>

        {stats.droppedFrames > 0 && (
          <div className="flex items-center gap-2 text-danger-500 text-sm">
            <AlertCircle size={16} />
            <span>{stats.droppedFrames} frames perdidos</span>
          </div>
        )}
      </div>
    </div>
  )
}
