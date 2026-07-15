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
})
