import axios from 'axios'
import { resolveServiceUrl } from './runtime-config'

const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const apiUrl = resolveServiceUrl({
  configured: import.meta.env.VITE_API_URL,
  isLocal: isLocalBrowser,
  localFallback: 'http://localhost:5001/api',
  name: 'VITE_API_URL',
})

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('authToken')) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  },
)
