import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import StaffSecurity from './StaffSecurity'

describe('StaffSecurity', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads staff accounts and audit history for the owner', async () => {
    renderPage(<StaffSecurity />)
    expect(await screen.findByRole('heading', { name: 'Staff & security' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/staff'); expect(api.get).toHaveBeenCalledWith('/staff/audit/logs?limit=150')
    expect(screen.getByText(/no staff accounts yet/i)).toBeInTheDocument()
  })
})
