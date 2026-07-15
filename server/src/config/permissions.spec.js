import { describe, expect, it } from 'vitest'
import { defaultStaffPermissions, staffPermissions } from './permissions.js'

describe('staff permissions', () => {
  it('keeps dashboard mandatory while sensitive modules stay opt-in', () => {
    expect(defaultStaffPermissions).toContain('dashboard')
    expect(defaultStaffPermissions).not.toContain('analytics')
    expect(defaultStaffPermissions).not.toContain('settings')
    expect(staffPermissions).toEqual(expect.arrayContaining(['members', 'payments', 'attendance', 'trainers', 'sessions']))
    expect(new Set(staffPermissions).size).toBe(staffPermissions.length)
  })
})
