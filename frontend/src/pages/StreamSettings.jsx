import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function StreamSettings() {
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data } = await api.get('/stream/profiles')
      setProfiles(data.profiles)
      if (data.profiles.length > 0) {
        setSelectedProfile(data.profiles[0])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSave = async () => {
    try {
      await api.put(`/stream/profiles/${selectedProfile.id}`, selectedProfile)
      toast.success('Configuración guardada')
    } catch (error) {
      toast.error('Error al guardar')
    }
  }

  if (!selectedProfile) return null

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Streaming</h1>
          <p className="text-gray-400 mt-1">Configura tus perfiles de transmisión</p>
        </div>
        
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={20} />
          Guardar
        </button>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre del Perfil</label>
          <input
            type="text"
            className="input"
            value={selectedProfile.name}
            onChange={(e) => setSelectedProfile({ ...selectedProfile, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Plataforma</label>
          <select
            className="input"
            value={selectedProfile.platform}
            onChange={(e) => setSelectedProfile({ ...selectedProfile, platform: e.target.value })}
          >
            <option value="custom">Custom RTMP</option>
            <option value="youtube">YouTube</option>
            <option value="twitch">Twitch</option>
            <option value="facebook">Facebook Live</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Servidor RTMP</label>
          <input
            type="text"
            className="input"
            value={selectedProfile.server}
            onChange={(e) => setSelectedProfile({ ...selectedProfile, server: e.target.value })}
            placeholder="rtmp://servidor/live"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Stream Key</label>
          <input
            type="password"
            className="input"
            value={selectedProfile.key}
            onChange={(e) => setSelectedProfile({ ...selectedProfile, key: e.target.value })}
            placeholder="Tu stream key"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Encoder</label>
            <select
              className="input"
              value={selectedProfile.encoder}
              onChange={(e) => setSelectedProfile({ ...selectedProfile, encoder: e.target.value })}
            >
              <option value="x264">x264 (CPU)</option>
              <option value="nvenc">NVENC (NVIDIA)</option>
              <option value="qsv">QuickSync (Intel)</option>
              <option value="amf">AMF (AMD)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bitrate (kbps)</label>
            <input
              type="number"
              className="input"
              value={selectedProfile.bitrate}
              onChange={(e) => setSelectedProfile({ ...selectedProfile, bitrate: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Resolución</label>
            <select
              className="input"
              value={selectedProfile.resolution}
              onChange={(e) => setSelectedProfile({ ...selectedProfile, resolution: e.target.value })}
            >
              <option value="1920x1080">1920x1080 (Full HD)</option>
              <option value="1280x720">1280x720 (HD)</option>
              <option value="854x480">854x480 (SD)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">FPS</label>
            <select
              className="input"
              value={selectedProfile.fps}
              onChange={(e) => setSelectedProfile({ ...selectedProfile, fps: parseInt(e.target.value) })}
            >
              <option value="60">60 FPS</option>
              <option value="30">30 FPS</option>
              <option value="25">25 FPS</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
