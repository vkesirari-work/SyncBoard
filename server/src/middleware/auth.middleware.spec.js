import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('jsonwebtoken', () => ({ default: { verify: vi.fn() } }))
vi.mock('../models/user.model.js', () => ({ User: { findById: vi.fn() } }))

const jwt = (await import('jsonwebtoken')).default
const { User } = await import('../models/user.model.js')
const { requireAuth, requireAnyPermission, requirePermission, requireRole } = await import('./auth.middleware.js')

function responseMock() {
  const response = { status: vi.fn(), json: vi.fn() }
  response.status.mockReturnValue(response); response.json.mockReturnValue(response)
  return response
}

describe('auth middleware', () => {
  beforeEach(() => vi.clearAllMocks())
  it('rejects requests without a bearer token', async () => {
    const response = responseMock(); const next = vi.fn()
    await requireAuth({ get: vi.fn().mockReturnValue(null) }, response, next)
    expect(response.status).toHaveBeenCalledWith(401); expect(next).not.toHaveBeenCalled()
  })
  it('rejects a disabled account even with a valid token', async () => {
    jwt.verify.mockReturnValue({ sub: 'user-1' }); User.findById.mockResolvedValue({ _id: 'user-1', isActive: false })
    const response = responseMock(); const next = vi.fn()
    await requireAuth({ get: vi.fn().mockReturnValue('Bearer valid') }, response, next)
    expect(response.status).toHaveBeenCalledWith(403); expect(next).not.toHaveBeenCalled()
  })
  it('allows owners and correctly scopes staff module permissions', () => {
    const ownerNext = vi.fn(); requirePermission('settings')({ user: { role: 'admin' } }, responseMock(), ownerNext); expect(ownerNext).toHaveBeenCalled()
    const staffNext = vi.fn(); requirePermission('members')({ user: { role: 'staff', permissions: ['members'] } }, responseMock(), staffNext); expect(staffNext).toHaveBeenCalled()
    const deniedResponse = responseMock(); requirePermission('payments')({ user: { role: 'staff', permissions: ['members'] } }, deniedResponse, vi.fn()); expect(deniedResponse.status).toHaveBeenCalledWith(403)
  })
  it('supports any-permission and explicit role checks', () => {
    const next = vi.fn(); requireAnyPermission(['members', 'sessions'])({ user: { role: 'staff', permissions: ['sessions'] } }, responseMock(), next); expect(next).toHaveBeenCalled()
    const deniedResponse = responseMock(); requireRole('admin')({ user: { role: 'trainer' } }, deniedResponse, vi.fn()); expect(deniedResponse.status).toHaveBeenCalledWith(403)
  })
})
