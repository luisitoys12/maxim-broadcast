import { useEffect, useState } from 'react'
import {
  Newspaper, Plus, Trash2, Volume2, Mic, X, FileText, Crown
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function NewsBulletin() {
  const [bulletins, setBulletins] = useState([])
  const [voices, setVoices] = useState([])
  const [templates, setTemplates] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', voice: '', template: 'general', headlines: [''] })

  useEffect(() => {
    api.get('/news/bulletins').then(r => setBulletins(r.data.bulletins)).catch(() => {})
    api.get('/news/voices').then(r => {
      setVoices(r.data.voices)
      setTemplates(r.data.templates)
      if (r.data.voices.length) setForm(f => ({ ...f, voice: r.data.voices[0].id }))
    }).catch(() => {})
  }, [])

  const addHeadline = () => setForm(f => ({ ...f, headlines: [...f.headlines, ''] }))

  const updateHeadline = (i, val) => {
    const h = [...form.headlines]
    h[i] = val
    setForm(f => ({ ...f, headlines: h }))
  }

  const removeHeadline = (i) => {
    if (form.headlines.length <= 1) return
    setForm(f => ({ ...f, headlines: f.headlines.filter((_, idx) => idx !== i) }))
  }

  const create = async (e) => {
    e.preventDefault()
    const headlines = form.headlines.filter(h => h.trim())
    if (!headlines.length) return toast.error('Agrega al menos un titular')
    try {
      const { data } = await api.post('/news/bulletins', { ...form, headlines })
      setBulletins(b => [...b, data.bulletin])
      setShowCreate(false)
      setForm(f => ({ ...f, title: '', headlines: [''] }))
      toast.success('Boletín creado')
    } catch { toast.error('Error al crear') }
  }

  const genAudio = async (id) => {
    try {
      const { data } = await api.post(`/news/bulletins/${id}/audio`)
      setBulletins(b => b.map(x => x.id === id ? data.bulletin : x))
      toast.success('Audio generado (SSML listo)')
    } catch { toast.error('Error') }
  }

  const del = async (id) => {
    await api.delete(`/news/bulletins/${id}`).catch(() => {})
    setBulletins(b => b.filter(x => x.id !== id))
  }

  const TEMPLATE_LABELS = { general: 'General', radio: 'Radio', formal: 'Formal' }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
            <Newspaper size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Boletín de Noticias</h1>
            <p className="text-gray-400 text-sm">Crea boletines con voces IA de Microsoft — gratis</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Crear Boletín
        </button>
      </div>

      {/* Free / Premium banner */}
      <div className="card p-4 mb-6 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 border-primary-600/30">
        <div className="flex items-center gap-3">
          <Mic size={20} className="text-primary-400" />
          <div>
            <p className="text-sm font-medium">Plan Free: Voces IA de Microsoft incluidas</p>
            <p className="text-xs text-gray-400">Upgrade a Premium para clonación de voz personalizada</p>
          </div>
        </div>
        <a href="https://wa.me/59891782920" target="_blank" rel="noopener"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 text-xs font-medium hover:bg-yellow-600/30">
          <Crown size={14} /> Premium
        </a>
      </div>

      {/* Bulletins list */}
      {bulletins.length === 0 ? (
        <div className="card p-12 text-center">
          <Newspaper size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No hay boletines. Crea uno con tus titulares.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bulletins.map(b => (
            <div key={b.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {b.voice?.name} · {TEMPLATE_LABELS[b.template] || b.template} · {b.headlines.length} titulares
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.status === 'done' ? 'bg-emerald-600/30 text-emerald-400' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {b.status === 'done' ? 'Audio listo' : 'Listo'}
                  </span>
                  <button onClick={() => genAudio(b.id)} className="text-primary-400 hover:text-primary-300" title="Generar audio">
                    <Volume2 size={16} />
                  </button>
                  <button onClick={() => del(b.id)} className="text-gray-500 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {b.headlines.map((h, i) => (
                  <p key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-primary-400 font-bold shrink-0">•</span> {h}
                  </p>
                ))}
              </div>
              {b.ssml && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 flex items-center gap-1">
                    <FileText size={12} /> Ver script generado
                  </summary>
                  <p className="text-xs text-gray-400 mt-2 p-3 bg-gray-900 rounded-lg whitespace-pre-wrap">{b.script}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Crear Boletín</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="label">Título</label>
                <input className="input" placeholder="Boletín de las 8pm" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Voz IA</label>
                  <select className="input" value={form.voice} onChange={e => setForm(f => ({ ...f, voice: e.target.value }))}>
                    {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Estilo</label>
                  <select className="input" value={form.template} onChange={e => setForm(f => ({ ...f, template: e.target.value }))}>
                    {templates.map(t => <option key={t} value={t}>{TEMPLATE_LABELS[t] || t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Titulares</label>
                <div className="space-y-2">
                  {form.headlines.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="input flex-1" placeholder={`Titular ${i + 1}`}
                        value={h} onChange={e => updateHeadline(i, e.target.value)} />
                      {form.headlines.length > 1 && (
                        <button type="button" onClick={() => removeHeadline(i)}
                          className="text-gray-500 hover:text-red-400 px-2"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addHeadline}
                  className="mt-2 text-sm text-primary-400 hover:underline">+ Agregar titular</button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="btn bg-gray-700 hover:bg-gray-600 flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
