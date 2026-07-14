import axios from 'axios'

const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const defaultApiUrl = isLocalBrowser
  ? 'http://localhost:5001/api'
  : 'https://sirari-fitness-api.onrender.com/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
