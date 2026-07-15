import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Settings from './Settings'

describe('Settings', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads protected settings without exposing payment secrets', async () => {
    renderPage(<Settings />)
    expect(await screen.findByRole('heading', { name: 'Gym settings' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/settings')
    expect(screen.getByText('Not configured')).toBeInTheDocument()
  })
})
