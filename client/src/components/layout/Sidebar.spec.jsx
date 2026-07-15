import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderPage, setAuth, setupApi } from '../../test/test-utils'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  beforeEach(() => setupApi())
  it('shows a member only their workspace and progress navigation', async () => {
    setAuth({ id: 'member-user', name: 'Member', role: 'member', permissions: [] })
    renderPage(<Sidebar isOpen onClose={() => {}} />)
    expect(await screen.findByRole('link', { name: /my workspace/i })).toBeInTheDocument(); expect(screen.getByRole('link', { name: /my progress/i })).toBeInTheDocument(); expect(screen.queryByRole('link', { name: /payments/i })).not.toBeInTheDocument()
  })
})
