import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'
import { createToken, publicUser } from './auth.js'

describe('auth utilities', () => {
  it('creates a seven-day JWT containing subject and role', () => {
    const token = createToken({ id: 'user-1', role: 'trainer' })
    const payload = jwt.decode(token)
    expect(payload).toMatchObject({ sub: 'user-1', role: 'trainer' }); expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60)
  })
  it('never exposes password fields in the public user shape', () => {
    const result = publicUser({ id: 'user-1', name: 'Owner', email: 'owner@example.com', role: 'admin', password: 'secret', isActive: true })
    expect(result).not.toHaveProperty('password'); expect(result).toMatchObject({ id: 'user-1', role: 'admin', isActive: true })
  })
})
