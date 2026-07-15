import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { owner } from '../test/test-utils'
import { useAuthStore } from './useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, user: null, isChecking: false })
  })

  it('persists and clears an authenticated session', () => {
    useAuthStore.getState().setSession('token-1', owner)
    expect(localStorage.getItem('authToken')).toBe('token-1')
    expect(JSON.parse(localStorage.getItem('authUser'))).toEqual(owner)
    expect(useAuthStore.getState()).toMatchObject({ token: 'token-1', user: owner, isChecking: false })

    useAuthStore.getState().clearSession()
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null, isChecking: false })
  })

  it('finishes immediately when there is no stored token', async () => {
    useAuthStore.setState({ isChecking: true })
    await useAuthStore.getState().checkSession()
    expect(api.get).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isChecking).toBe(false)
  })

  it('refreshes a valid stored user from the API', async () => {
    localStorage.setItem('authToken', 'token-1')
    api.get.mockResolvedValueOnce({ data: { user: owner } })
    await useAuthStore.getState().checkSession()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(useAuthStore.getState().user).toEqual(owner)
    expect(JSON.parse(localStorage.getItem('authUser'))).toEqual(owner)
  })

  it('removes an expired session when validation fails', async () => {
    localStorage.setItem('authToken', 'expired')
    localStorage.setItem('authUser', JSON.stringify(owner))
    api.get.mockRejectedValueOnce(new Error('Unauthorized'))
    await useAuthStore.getState().checkSession()

    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()
    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null, isChecking: false })
  })
})
