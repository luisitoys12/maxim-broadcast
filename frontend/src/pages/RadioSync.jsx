import { useEffect, useState, useRef } from 'react'
import {
  Radio, Bot, MessageSquare, Users, BarChart3, Zap,
  Play, Square, Send, Trash2, Lightbulb, Phone,
  ToggleLeft, ToggleRight, Mic, Volume2, AlertCircle, Music
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const TYPE_BADGES = {
  song_request: { label: '🎵 Canción', color: 'bg-purple-600' },
  greeting: { label: '👋 Saludo', color: 'bg-blue-600' },
  general: { label: 'General', color: 'bg-gray-600' },
  ia_intervention: { label: '🤖 IA', color: 'bg-emerald-600' },
  ia_greeting: { label: '🤖 Saludo IA', color: 'bg-teal-600' },
}

export default function RadioSync() {
  const [tab, setTab] = useState('cabina')
  const [messages, setMessages] = useState([])
  const [ia, setIA] = useState({ enabled: false, voice: '', mode: 'assistant', state: 'idle', nextIntervention: null })
  const [voices, setVoices] = useState([])
  const [metrics, setMetrics] = useState({ activeListeners: 0, messagesPerMinute: 0, interactionLevel: 0, alerts: 0 })
  const [suggestions, setSuggestions] = useState([])
  const [listeners, setListeners] = useState([])
  const [automation, setAutomation] = useState({})
  const [sessionActive, setSessionActive] = useState(false)
  const [newMsg, setNewMsg] = useState({ sender: '', text: '' })
  const pollRef = useRef(null)

  const fetchAll = async () => {
    try {
      const [msgR, iaR, metR] = await Promise.all([
        api.get('/radiosync/messages'),
        api.get('/radiosync/ia'),
        api.get('/radiosync/metrics')
      ])
      setMessages(msgR.data.messages)
      setIA(iaR.data.ia)
      setVoices(iaR.data.voices)
      setMetrics(metR.data.metrics)
    } catch {}
  }

  useEffect(() => {
    fetchAll()
    api.get('/radiosync/automation').then(r => setAutomation(r.data.automation)).catch(() => {})
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const startSession = async () => {
    await api.post('/radiosync/session/start')
    setSessionActive(true)
    toast.success('Cabina en vivo')
    pollRef.current = setInterval(fetchAll, 3000)
    fetchAll()
  }

  const endSession = async () => {
    const { data } = await api.post('/radiosync/session/end')
    setSessionActive(false)
    if (pollRef.current) clearInterval(pollRef.current)
    toast.success(`Sesión finalizada: ${data.summary?.totalMessages || 0} msgs, ${data.summary?.duration}`)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.sender || !newMsg.text) return
    await api.post('/radiosync/messages', newMsg)
    setNewMsg({ sender: newMsg.sender, text: '' })
    fetchAll()
  }

  const deleteMsg = async (id) => {
    await api.delete(`/radiosync/messages/${id}`)
    setMessages(m => m.filter(x => x.id !== id))
  }

  const toggleIA = async (enabled) => {
    const { data } = await api.post('/radiosync/ia/toggle', { enabled, voice: ia.voice, mode: ia.mode })
    setIA(data.ia)
    toast.success(enabled ? 'Conducción IA activada' : 'Conducción IA desactivada')
  }

  const changeVoice = async (voice) => {
    const { data } = await api.post('/radiosync/ia/toggle', { voice })
    setIA(data.ia)
  }

  const generateNow = async () => {
    await api.post('/radiosync/ia/generate')
    toast.success('Intervención generada')
    fetchAll()
  }

  const loadSuggestions = async () => {
    const { data } = await api.get('/radiosync/suggestions')
    setSuggestions(data.suggestions)
  }

  const loadListeners = async () => {
    const { data } = await api.get('/radiosync/listeners')
    setListeners(data.listeners)
  }

  const toggleAuto = async (key) => {
    const updated = { ...automation, [key]: !automation[key] }
    const { data } = await api.put('/radiosync/automation', updated)
    setAutomation(data.automation)
  }

  const TABS = [
    { id: 'cabina', label: 'Cabina', icon: Mic },
    { id: 'ia', label: 'Conducción IA', icon: Bot },
    { id: 'metrics', label: 'Métricas', icon: BarChart3 },
    { id: 'auto', label: 'Automatización', icon: Zap },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
            <Radio size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">RadioSync</h1>
            <p className="text-gray-400 text-sm">Cabina Inteligente con IA</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sessionActive && (
            <span className="flex items-center gap-2 bg-red-600/20 border border-red-500 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> EN VIVO
            </span>
          )}
          {!sessionActive ? (
            <button onClick={startSession} className="btn-success flex items-center gap-2">
              <Play size={16} /> Iniciar Cabina
            </button>
          ) : (
            <button onClick={endSession} className="btn-danger flex items-center gap-2">
              <Square size={16} /> Finalizar
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-800 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); if (id === 'metrics') loadListeners(); if (id === 'ia') loadSuggestions(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: CABINA ═══ */}
      {tab === 'cabina' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages feed */}
          <div className="lg:col-span-2 card p-0 flex flex-col" style={{maxHeight: '70vh'}}>
            <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><MessageSquare size={18} /> Mensajes en Vivo</h2>
              <span className="text-xs text-gray-400">{messages.length} mensajes</span>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay mensajes. Inicia la cabina para recibir.</p>
              ) : messages.map(msg => (
                <div key={msg.id} className={`p-3 rounded-lg border ${
                  msg.priority >= 3 ? 'border-purple-500/50 bg-purple-900/20' :
                  msg.priority >= 2 ? 'border-blue-500/30 bg-blue-900/10' :
                  'border-gray-700 bg-gray-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{msg.sender}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${TYPE_BADGES[msg.type]?.color || 'bg-gray-600'}`}>
                        {TYPE_BADGES[msg.type]?.label || msg.type}
                      </span>
                      {msg.source === 'whatsapp' && <Phone size={12} className="text-green-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString('es-MX')}</span>
                      <button onClick={() => deleteMsg(msg.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200">{msg.text}</p>
                </div>
              ))}
            </div>
            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 flex gap-2">
              <input className="input w-32" placeholder="Nombre" value={newMsg.sender}
                onChange={e => setNewMsg(n => ({ ...n, sender: e.target.value }))} />
              <input className="input flex-1" placeholder="Escribir mensaje..." value={newMsg.text}
                onChange={e => setNewMsg(n => ({ ...n, text: e.target.value }))} />
              <button type="submit" className="btn-primary"><Send size={16} /></button>
            </form>
          </div>

          {/* Right sidebar: metrics + quick IA */}
          <div className="space-y-4">
            {/* Mini metrics */}
            <div className="card p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><BarChart3 size={16} /> Métricas</h3>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Oyentes" value={metrics.activeListeners} icon={<Users size={14} />} />
                <Stat label="Msgs/min" value={metrics.messagesPerMinute} icon={<MessageSquare size={14} />} />
                <Stat label="Interacción" value={`${metrics.interactionLevel}%`} icon={<Zap size={14} />} />
                <Stat label="Alertas" value={metrics.alerts} icon={<AlertCircle size={14} />} />
              </div>
            </div>

            {/* Quick IA toggle */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"><Bot size={16} /> Conducción IA</h3>
                <button onClick={() => toggleIA(!ia.enabled)}>
                  {ia.enabled
                    ? <ToggleRight size={28} className="text-emerald-400" />
                    : <ToggleLeft size={28} className="text-gray-500" />}
                </button>
              </div>
              {ia.enabled && (
                <div className="space-y-2">
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    {ia.state === 'generating' ? 'Generando intervención...' : 'Conduciendo programa...'}
                  </p>
                  <p className="text-xs text-gray-400">Voz: {ia.voice}</p>
                  <button onClick={generateNow} className="btn-primary w-full text-xs py-1.5">
                    <Volume2 size={14} className="inline mr-1" /> Generar ahora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: IA ═══ */}
      {tab === 'ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-5">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Bot size={22} /> Conducción IA</h2>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900">
              <div>
                <p className="font-medium">{ia.enabled ? 'IA Activada' : 'IA Desactivada'}</p>
                <p className="text-sm text-gray-400">{ia.enabled ? `Modo: ${ia.mode === 'autonomous' ? 'Autónomo' : 'Asistente'}` : 'Clic para activar'}</p>
              </div>
              <button onClick={() => toggleIA(!ia.enabled)}
                className={`px-5 py-2.5 rounded-lg font-medium ${ia.enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {ia.enabled ? 'Desactivar' : 'Activar'}
              </button>
            </div>

            <div>
              <label className="label">Voz seleccionada</label>
              <select className="input" value={ia.voice} onChange={e => changeVoice(e.target.value)}>
                {voices.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Modo</label>
              <div className="flex gap-2">
                {[['assistant', 'Asistente'], ['autonomous', 'Autónomo']].map(([m, l]) => (
                  <button key={m} onClick={() => api.post('/radiosync/ia/toggle', { mode: m }).then(r => setIA(r.data.ia))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${ia.mode === m ? 'bg-primary-600' : 'bg-gray-800 border border-gray-700'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Autónomo = la IA conduce sola. Asistente = sugiere contenido.</p>
            </div>

            <button onClick={generateNow} className="btn-primary w-full flex items-center justify-center gap-2">
              <Mic size={18} /> Generar intervención ahora
            </button>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Lightbulb size={22} /> Sugerencias para el Locutor</h2>
            <button onClick={loadSuggestions} className="text-sm text-primary-400 hover:underline">Generar nuevas sugerencias</button>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-gray-900 rounded-lg flex items-start gap-3">
                  <Lightbulb size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: METRICS ═══ */}
      {tab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Oyentes Activos" value={metrics.activeListeners} icon={<Users size={20} />} color="text-blue-400" />
            <MetricCard label="Mensajes/min" value={metrics.messagesPerMinute} icon={<MessageSquare size={20} />} color="text-green-400" />
            <MetricCard label="Nivel de Interacción" value={`${metrics.interactionLevel}%`} icon={<Zap size={20} />} color="text-yellow-400" />
            <MetricCard label="Alertas" value={metrics.alerts} icon={<AlertCircle size={20} />} color="text-red-400" />
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Users size={18} /> Oyentes ({listeners.length})</h3>
            {listeners.length === 0
              ? <p className="text-gray-500 text-sm">No hay oyentes registrados aún.</p>
              : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {listeners.map((l, i) => (
                    <div key={i} className="p-3 bg-gray-900 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{l.name}</p>
                        <p className="text-xs text-gray-500">{l.count} msgs</p>
                      </div>
                      {l.count > 3 && <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">Recurrente</span>}
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* ═══ TAB: AUTOMATION ═══ */}
      {tab === 'auto' && (
        <div className="card p-6 max-w-xl">
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2"><Zap size={22} /> Automatización Inteligente</h2>
          <div className="space-y-4">
            {[
              ['autoReply', 'Auto respuestas', 'La IA responde saludos automáticamente'],
              ['autoMessages', 'Mensajes automáticos', 'Enviar mensajes promocionales programados'],
              ['autoOrganize', 'Organización automática', 'Priorizar mensajes importantes arriba'],
              ['spamFilter', 'Filtro de spam', 'Bloquear mensajes sospechosos automáticamente'],
            ].map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <button onClick={() => toggleAuto(key)}>
                  {automation[key]
                    ? <ToggleRight size={26} className="text-emerald-400" />
                    : <ToggleLeft size={26} className="text-gray-500" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, icon }) {
  return (
    <div className="bg-gray-900 rounded-lg p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="card p-5">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}
