import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const { login, register, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    let ok
    if (mode === 'login') {
      ok = await login(form.email, form.password)
    } else {
      ok = await register(form.username, form.email, form.password)
    }
    if (ok) {
      toast.success('Bienvenido a Maxim Broadcast')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary-600 rounded-xl">
            <Radio size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Maxim Broadcast</h1>
            <p className="text-gray-400 text-sm">Panel de Control</p>
          </div>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-primary-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setMode('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-primary-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="label">Usuario</label>
              <input className="input" type="text" placeholder="admin" required
                value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="admin@maxim.tv" required
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" placeholder="••••••••" required
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>

          {error && <p className="text-danger-400 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
