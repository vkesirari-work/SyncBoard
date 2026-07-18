import { create } from 'zustand'
import { api } from '../lib/api'

const storedToken = localStorage.getItem('authToken')

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    localStorage.removeItem('authUser')
    return null
  }
}

const storedUser = getStoredUser()

export const useAuthStore = create((set) => ({
  token: storedToken,
  user: storedUser,
  isChecking: Boolean(storedToken),

  setSession(token, user) {
    localStorage.setItem('authToken', token)
    localStorage.setItem('authUser', JSON.stringify(user))
    set({ token, user, isChecking: false })
  },

  clearSession() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    set({ token: null, user: null, isChecking: false })
  },

  async checkSession() {
    if (!localStorage.getItem('authToken')) {
      set({ isChecking: false })
      return
    }

    try {
      const { data } = await api.get('/auth/me')
      localStorage.setItem('authUser', JSON.stringify(data.user))
      set({ user: data.user, isChecking: false })
    } catch {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      set({ token: null, user: null, isChecking: false })
    }
  },
}))

window.addEventListener('auth:expired', () => useAuthStore.getState().clearSession())
