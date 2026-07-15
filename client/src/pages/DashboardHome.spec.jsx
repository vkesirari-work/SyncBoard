import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderPage, setAuth } from '../test/test-utils'
import DashboardHome from './DashboardHome'

vi.mock('./Dashboard', () => ({ default: () => <h1>Owner dashboard</h1> }))
vi.mock('./TrainerPortal', () => ({ default: () => <h1>Trainer dashboard</h1> }))
vi.mock('./MemberPortal', () => ({ default: () => <h1>Member dashboard</h1> }))
vi.mock('./StaffWorkspace', () => ({ default: () => <h1>Staff dashboard</h1> }))

describe('DashboardHome', () => {
  beforeEach(() => setAuth())
  it.each([
    ['admin', 'Owner dashboard'], ['staff', 'Staff dashboard'], ['trainer', 'Trainer dashboard'], ['member', 'Member dashboard'],
  ])('routes %s accounts to the correct private workspace', (role, heading) => {
    setAuth({ id: `${role}-1`, name: role, role, permissions: [] })
    renderPage(<DashboardHome />)
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })
})
