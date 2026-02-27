import { Calendar, Plus } from 'lucide-react'

export default function Playout() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Playout Automático</h1>
          <p className="text-gray-400 mt-1">Programa tu contenido 24/7</p>
        </div>
        
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nuevo Item
        </button>
      </div>

      <div className="card p-12 text-center">
        <Calendar size={64} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sin programación activa</h3>
        <p className="text-gray-400">Crea un schedule para automatizar tu contenido</p>
      </div>
    </div>
  )
}
