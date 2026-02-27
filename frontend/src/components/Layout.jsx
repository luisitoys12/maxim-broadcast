import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Layers, 
  Radio, 
  Film, 
  Calendar,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Escenas', href: '/scenes', icon: Layers },
  { name: 'Streaming', href: '/stream', icon: Radio },
  { name: 'Biblioteca', href: '/media', icon: Film },
  { name: 'Playout', href: '/playout', icon: Calendar },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-500">Maxim Broadcast</h1>
          <p className="text-sm text-gray-400 mt-1">Control Panel</p>
        </div>
        
        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
