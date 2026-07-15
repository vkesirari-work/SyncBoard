import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import MemberPortal from './MemberPortal'

describe('MemberPortal', () => {
  beforeEach(() => { setupApi(); setAuth({ id: 'user-member', name: 'Test Member', role: 'member', memberProfile: 'member-1' }) })
  it('loads only the signed-in member data and personal sessions', async () => {
    renderPage(<MemberPortal />)
    expect(await screen.findByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/members/me'); expect(api.get).toHaveBeenCalledWith('/training-sessions')
    expect(screen.getByRole('link', { name: /view my body progress/i })).toHaveAttribute('href', '/dashboard/progress/me')
  })
})
