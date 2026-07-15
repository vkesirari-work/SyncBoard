import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import MemberProgress from './MemberProgress'

describe('MemberProgress', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads a role-scoped progress record and renders all tracking areas', async () => {
    renderPage(<MemberProgress />, '/dashboard/progress/member-1', '/dashboard/progress/:memberId')
    expect(await screen.findByRole('heading', { name: 'Test Member' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/member-progress/member-1')
    expect(screen.getByRole('button', { name: 'measurements' })).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'workout' })).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'photos' })).toBeInTheDocument()
  })
})
