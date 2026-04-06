import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Layers, Radio, Film, Calendar, LogOut, Mic } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Escenas', href: '/scenes', icon: Layers },
  { name: 'Streaming', href: '/stream', icon: Radio },
  { name: 'Biblioteca', href: '/media', icon: Film },
  { name: 'Playout', href: '/playout', icon: Calendar },
  { name: 'RadioSync', href: '/radiosync', icon: Mic },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { connected } = useSocketStore()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold text-primary-400">Maxim Broadcast</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">{connected ? 'Conectado' : 'Sin conexión'}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map(({ name, href, icon: Icon }) => {
            const active = location.pathname === href
            return (
              <Link key={name} to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  active ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                <Icon size={18} />
                {name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.username || 'Usuario'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-danger-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
