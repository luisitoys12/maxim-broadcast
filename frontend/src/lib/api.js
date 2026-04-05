import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('maxim_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('maxim_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
