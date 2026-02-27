import { useEffect, useState } from 'react'
import { Plus, Trash2, Play } from 'lucide-react'
import { useSceneStore } from '../store/sceneStore'

export default function Scenes() {
  const { scenes, activeScene, fetchScenes, createScene, deleteScene, activateScene } = useSceneStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSceneName, setNewSceneName] = useState('')

  useEffect(() => {
    fetchScenes()
  }, [])

  const handleCreateScene = async () => {
    if (!newSceneName.trim()) return
    
    try {
      await createScene(newSceneName)
      setNewSceneName('')
      setShowCreateModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Escenas</h1>
          <p className="text-gray-400 mt-1">Gestiona tus escenas y fuentes</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Escena
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {scenes.map(scene => (
          <div
            key={scene.id}
            className={`card p-6 cursor-pointer transition-all ${
              scene.active ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => !scene.active && activateScene(scene.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{scene.name}</h3>
                <p className="text-sm text-gray-400">
                  {scene.sources?.length || 0} fuentes
                </p>
              </div>
              
              {scene.active ? (
                <span className="px-2 py-1 bg-success-500/20 text-success-500 text-xs rounded">
                  Activa
                </span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteScene(scene.id)
                  }}
                  className="text-danger-500 hover:text-danger-400"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="aspect-video bg-gray-900 rounded border border-gray-700 mb-3" />

            {!scene.active && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  activateScene(scene.id)
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Activar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create Scene Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nueva Escena</h2>
            
            <input
              type="text"
              className="input mb-4"
              placeholder="Nombre de la escena"
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateScene()}
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn bg-gray-700 hover:bg-gray-600 flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateScene}
                className="btn-primary flex-1"
                disabled={!newSceneName.trim()}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
