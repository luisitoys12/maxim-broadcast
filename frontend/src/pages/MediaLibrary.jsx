import { useEffect, useState, useRef } from 'react'
import { Upload, Trash2, Film, Music, Image } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const typeIcon = (type) => {
  if (type?.startsWith('video')) return <Film size={20} className="text-primary-400" />
  if (type?.startsWith('audio')) return <Music size={20} className="text-success-400" />
  return <Image size={20} className="text-warning-400" />
}

const fmtSize = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaLibrary() {
  const [media, setMedia] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => { fetchMedia() }, [])

  const fetchMedia = async () => {
    try {
      const { data } = await api.get('/media')
      setMedia(data.media)
    } catch {
      toast.error('Error al cargar biblioteca')
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    setUploading(true)
    try {
      await api.post('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Archivo subido')
      fetchMedia()
    } catch {
      toast.error('Error al subir archivo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/media/${id}`)
      setMedia(m => m.filter(x => x.id !== id))
      toast.success('Eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Medios</h1>
          <p className="text-gray-400 mt-1">{media.length} archivos</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-primary flex items-center gap-2"
          disabled={uploading}
        >
          <Upload size={18} />
          {uploading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
        <input ref={fileRef} type="file" accept="video/*,audio/*,image/*"
          className="hidden" onChange={handleUpload} />
      </div>

      {media.length === 0 ? (
        <div className="card p-12 text-center">
          <Film size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No hay archivos. Sube video, audio o imágenes.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 text-left">
                <th className="p-4 font-medium">Archivo</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Tamaño</th>
                <th className="p-4 font-medium">Subido</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {media.map(item => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-4 flex items-center gap-3">
                    {typeIcon(item.type)}
                    <span className="truncate max-w-xs">{item.filename}</span>
                  </td>
                  <td className="p-4 text-gray-400">{item.type}</td>
                  <td className="p-4 text-gray-400">{fmtSize(item.size)}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(item.uploadedAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(item.id)}
                      className="text-danger-500 hover:text-danger-400">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
