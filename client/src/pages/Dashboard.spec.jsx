import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads the owner overview from all operational modules', async () => {
    renderPage(<Dashboard />)
    expect(await screen.findByRole('heading', { name: /your gym, in motion/i })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('keeps working while an older backend is still deploying', async () => {
    api.get.mockImplementation(async (url) => {
      if (url === '/admin/dashboard') throw { response: { status: 404 } }
      if (url === '/members') return { data: { members: [] } }
      if (url === '/payments') return { data: { payments: [] } }
      if (url === '/attendance') return { data: { attendance: [] } }
      if (url === '/leads') return { data: { leads: [] } }
      return { data: {} }
    })
    renderPage(<Dashboard />)
    expect(await screen.findByText('No leads yet.')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/members')
  })
})
