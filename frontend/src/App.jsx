import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useSocketStore } from './store/socketStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Scenes from './pages/Scenes'
import StreamSettings from './pages/StreamSettings'
import MediaLibrary from './pages/MediaLibrary'
import Playout from './pages/Playout'
import RadioSync from './pages/RadioSync'
import NewsBulletin from './pages/NewsBulletin'

function Protected({ children }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { token, fetchMe } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  useEffect(() => {
    if (token) {
      fetchMe()
      connect()
    } else {
      disconnect()
    }
  }, [token])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/scenes" element={<Scenes />} />
                <Route path="/stream" element={<StreamSettings />} />
                <Route path="/media" element={<MediaLibrary />} />
                <Route path="/playout" element={<Playout />} />
                <Route path="/radiosync" element={<RadioSync />} />
                <Route path="/news" element={<NewsBulletin />} />
              </Routes>
            </Layout>
          </Protected>
        } />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  )
}
