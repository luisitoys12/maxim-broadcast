import { Monitor } from 'lucide-react'
import { useEffect } from 'react'
import { useSocketStore } from '../store/socketStore'

export default function PreviewPanel() {
  const { connect, emit } = useSocketStore()

  useEffect(() => {
    connect()
    emit('request-preview')
  }, [])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <Monitor size={20} className="text-gray-400" />
      </div>
      
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-700">
        <div className="text-center">
          <Monitor size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Preview en tiempo real</p>
          <p className="text-sm text-gray-500 mt-1">WebRTC stream próximamente</p>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className="btn-primary flex-1">
          Program
        </button>
        <button className="btn bg-gray-700 hover:bg-gray-600 flex-1">
          Preview
        </button>
      </div>
    </div>
  )
}
