import { Film, Upload } from 'lucide-react'

export default function MediaLibrary() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Medios</h1>
          <p className="text-gray-400 mt-1">Gestiona tus archivos multimedia</p>
        </div>
        
        <button className="btn-primary flex items-center gap-2">
          <Upload size={20} />
          Subir Archivo
        </button>
      </div>

      <div className="card p-12 text-center">
        <Film size={64} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No hay archivos aún</h3>
        <p className="text-gray-400">Sube videos, imágenes o audio para comenzar</p>
      </div>
    </div>
  )
}
