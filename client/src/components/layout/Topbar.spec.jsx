import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderPage, setAuth, setupApi } from '../../test/test-utils'
import Topbar from './Topbar'

describe('Topbar', () => {
  beforeEach(() => setupApi())
  it('keeps member accounts inside their private portal controls', () => {
    setAuth({ id: 'member-user', name: 'Test Member', role: 'member', permissions: [] })
    renderPage(<Topbar onOpenNavigation={() => {}} />)
    expect(screen.getByText('Member portal')).toBeInTheDocument(); expect(screen.queryByRole('button', { name: /new member/i })).not.toBeInTheDocument(); expect(screen.queryByRole('link', { name: /notifications/i })).not.toBeInTheDocument()
  })
})
