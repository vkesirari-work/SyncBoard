import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import StaffWorkspace from './StaffWorkspace'

describe('StaffWorkspace', () => {
  beforeEach(() => { setupApi(); setAuth({ id: 'staff-1', name: 'Aman Staff', role: 'staff', permissions: ['dashboard', 'members'] }) })
  it('shows only modules assigned by the owner', () => {
    renderPage(<StaffWorkspace />)
    expect(screen.getByRole('heading', { name: /welcome, aman/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /members/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /payments/i })).not.toBeInTheDocument()
  })

  it('shows notifications when that is the staff member’s only operational permission', () => {
    setAuth({ id: 'staff-2', name: 'Nisha Staff', role: 'staff', permissions: ['dashboard', 'notifications'] })
    renderPage(<StaffWorkspace />)
    expect(screen.getByRole('link', { name: /notifications/i })).toBeInTheDocument()
    expect(screen.queryByText(/no operational modules assigned/i)).not.toBeInTheDocument()
  })
})
