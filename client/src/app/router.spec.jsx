import { describe, expect, it } from 'vitest'
import { router } from './router'

describe('application router', () => {
  it('exposes every public and protected V1 route', () => {
    const routes = router.routes
    const dashboard = routes.find((route) => route.path === '/dashboard')

    expect(routes.map((route) => route.path)).toEqual([
      '/', '/dashboard', '/login', '/register', '*',
    ])
    expect(dashboard.children.map((route) => route.index ? 'index' : route.path)).toEqual([
      'index', 'members', 'progress/:memberId', 'plans', 'payments', 'attendance',
      'leads', 'trainers', 'sessions', 'availability', 'renewals', 'settings',
      'notifications', 'analytics', 'staff-security',
    ])
  })
})
