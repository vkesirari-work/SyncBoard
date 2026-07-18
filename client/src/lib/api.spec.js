import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestUse = vi.fn()
const responseUse = vi.fn()
const create = vi.fn(() => ({ interceptors: { request: { use: requestUse }, response: { use: responseUse } } }))

vi.unmock('./api')
vi.mock('axios', () => ({ default: { create } }))

describe('API client', () => {
  beforeEach(() => {
    vi.resetModules()
    requestUse.mockClear()
    responseUse.mockClear()
    create.mockClear()
  })

  it('uses the local API and attaches an auth token when present', async () => {
    localStorage.setItem('authToken', 'secret-token')
    await import('./api')

    expect(create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:5001/api',
      withCredentials: true,
    })

    const interceptor = requestUse.mock.calls[0][0]
    expect(interceptor({ headers: {} })).toEqual({
      headers: { Authorization: 'Bearer secret-token' },
    })
  })

  it('leaves anonymous request headers unchanged', async () => {
    await import('./api')
    const interceptor = requestUse.mock.calls[0][0]
    expect(interceptor({ headers: {} })).toEqual({ headers: {} })
  })

  it('clears an expired authenticated session and notifies the app', async () => {
    localStorage.setItem('authToken', 'expired-token')
    localStorage.setItem('authUser', '{}')
    const expired = vi.fn()
    window.addEventListener('auth:expired', expired, { once: true })
    await import('./api')

    const rejectResponse = responseUse.mock.calls[0][1]
    const error = { response: { status: 401 } }
    await expect(rejectResponse(error)).rejects.toBe(error)
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()
    expect(expired).toHaveBeenCalledOnce()
  })
})
