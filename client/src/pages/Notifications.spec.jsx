import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Notifications from './Notifications'

describe('Notifications', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads the action centre and disables read-all when nothing is unread', async () => {
    renderPage(<Notifications />)
    expect(await screen.findByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/notifications', expect.any(Object))
    expect(screen.getByRole('button', { name: /mark all read/i })).toBeDisabled()
  })
})
