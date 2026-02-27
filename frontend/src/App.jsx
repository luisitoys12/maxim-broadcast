import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Scenes from './pages/Scenes'
import StreamSettings from './pages/StreamSettings'
import MediaLibrary from './pages/MediaLibrary'
import Playout from './pages/Playout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/stream" element={<StreamSettings />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/playout" element={<Playout />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
