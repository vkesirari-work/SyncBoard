import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestUse = vi.fn()
const create = vi.fn(() => ({ interceptors: { request: { use: requestUse } } }))

vi.unmock('./api')
vi.mock('axios', () => ({ default: { create } }))

describe('API client', () => {
  beforeEach(() => {
    vi.resetModules()
    requestUse.mockClear()
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
})
