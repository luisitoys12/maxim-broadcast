import { useEffect, useState } from 'react'
import { Plus, Trash2, Calendar, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Playout() {
  const [schedule, setSchedule] = useState([])
  const [media, setMedia] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ mediaId: '', startTime: '', duration: '', repeat: 'none' })

  useEffect(() => {
    fetchSchedule()
    fetchMedia()
  }, [])

  const fetchSchedule = async () => {
    const { data } = await api.get('/playout/schedule').catch(() => ({ data: { schedule: [] } }))
    setSchedule(data.schedule)
  }

  const fetchMedia = async () => {
    const { data } = await api.get('/media').catch(() => ({ data: { media: [] } }))
    setMedia(data.media)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/playout/schedule', form)
      toast.success('Ítem programado')
      setShowModal(false)
      setForm({ mediaId: '', startTime: '', duration: '', repeat: 'none' })
      fetchSchedule()
    } catch {
      toast.error('Error al programar')
    }
  }

  const handleToggle = async (item) => {
    try {
      await api.put(`/playout/schedule/${item.id}`, { enabled: !item.enabled })
      setSchedule(s => s.map(x => x.id === item.id ? { ...x, enabled: !x.enabled } : x))
    } catch {
      toast.error('Error')
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/playout/schedule/${id}`).catch(() => {})
    setSchedule(s => s.filter(x => x.id !== id))
    toast.success('Eliminado')
  }

  const mediaName = (id) => media.find(m => m.id === id)?.filename || id

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Playout 24/7</h1>
          <p className="text-gray-400 mt-1">Programa tu contenido automáticamente</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Programar
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No hay programación. Agrega ítems para el playout automático.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 text-left">
                <th className="p-4 font-medium">Archivo</th>
                <th className="p-4 font-medium">Hora de Inicio</th>
                <th className="p-4 font-medium">Duración</th>
                <th className="p-4 font-medium">Repetición</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {schedule.map(item => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-4 truncate max-w-xs">{mediaName(item.mediaId)}</td>
                  <td className="p-4 text-gray-300">{item.startTime}</td>
                  <td className="p-4 text-gray-400">{item.duration ? `${item.duration}s` : '-'}</td>
                  <td className="p-4 text-gray-400 capitalize">{item.repeat}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggle(item)}>
                      {item.enabled
                        ? <ToggleRight size={22} className="text-success-500" />
                        : <ToggleLeft size={22} className="text-gray-500" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(item.id)} className="text-danger-500 hover:text-danger-400">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Programar Contenido</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Archivo de Medios</label>
                <select className="input" required value={form.mediaId}
                  onChange={e => setForm(f => ({ ...f, mediaId: e.target.value }))}>
                  <option value="">-- Seleccionar --</option>
                  {media.map(m => <option key={m.id} value={m.id}>{m.filename}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Hora de inicio</label>
                <input className="input" type="datetime-local" required
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div>
                <label className="label">Duración (segundos, opcional)</label>
                <input className="input" type="number" placeholder="0 = completo"
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <div>
                <label className="label">Repetición</label>
                <select className="input" value={form.repeat}
                  onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}>
                  <option value="none">Sin repetición</option>
                  <option value="daily">Diaria</option>
                  <option value="weekly">Semanal</option>
                  <option value="loop">Loop continuo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn bg-gray-700 hover:bg-gray-600 flex-1"
                  onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Programar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
