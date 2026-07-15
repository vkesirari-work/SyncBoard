import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Analytics from './Analytics'

describe('Analytics', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('requests protected analytics and renders report controls', async () => {
    renderPage(<Analytics />)
    expect(await screen.findByRole('heading', { name: 'Analytics & reports' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/admin/analytics', expect.any(Object))
    expect(screen.getByRole('button', { name: /export csv/i })).toBeEnabled()
  })
})
