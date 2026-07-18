import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('jsonwebtoken', () => ({ default: { verify: vi.fn() } }))
vi.mock('../models/user.model.js', () => ({ User: { findById: vi.fn() } }))

const jwt = (await import('jsonwebtoken')).default
const { User } = await import('../models/user.model.js')
const { authenticateSocket, authenticatedDashboardRoom, emitDashboardUpdate } = await import('./socket.js')

describe('authenticated realtime updates', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects missing tokens and loads an active user for a valid token', async () => {
    const missingNext = vi.fn()
    await authenticateSocket({ handshake: {}, data: {} }, missingNext)
    expect(missingNext.mock.calls[0][0]).toBeInstanceOf(Error)

    jwt.verify.mockReturnValue({ sub: 'user-1', ver: 0 })
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue({ id: 'user-1', role: 'admin', isActive: true, tokenVersion: 0 }) })
    const socket = { handshake: { auth: { token: 'valid' } }, data: {} }
    const next = vi.fn()
    await authenticateSocket(socket, next)
    expect(next).toHaveBeenCalledWith()
    expect(socket.data.user.id).toBe('user-1')
  })

  it('emits only a resource id into the authenticated dashboard room', () => {
    const emit = vi.fn()
    const to = vi.fn().mockReturnValue({ emit })
    const request = { app: { get: vi.fn().mockReturnValue({ to }) } }
    emitDashboardUpdate(request, 'member:updated', { id: 'member-1', name: 'Private Name', phone: '999' })
    expect(to).toHaveBeenCalledWith(authenticatedDashboardRoom)
    expect(emit).toHaveBeenCalledWith('member:updated', { id: 'member-1' })
  })
})
