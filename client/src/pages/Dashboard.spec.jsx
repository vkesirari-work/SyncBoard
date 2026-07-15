import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads the owner overview from all operational modules', async () => {
    renderPage(<Dashboard />)
    expect(await screen.findByRole('heading', { name: /your gym, at a glance/i })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/members'); expect(api.get).toHaveBeenCalledWith('/payments'); expect(api.get).toHaveBeenCalledWith('/attendance'); expect(api.get).toHaveBeenCalledWith('/leads')
  })
})
