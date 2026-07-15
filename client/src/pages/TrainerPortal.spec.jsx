import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import TrainerPortal from './TrainerPortal'

describe('TrainerPortal', () => {
  beforeEach(() => { setupApi(); setAuth({ id: 'trainer-user', name: 'Test Trainer', role: 'trainer', trainerProfile: 'trainer-1' }) })
  it('loads only the trainer profile, sessions, and leave records', async () => {
    renderPage(<TrainerPortal />)
    expect(await screen.findByRole('heading', { name: /welcome, test/i })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/trainers/me'); expect(api.get).toHaveBeenCalledWith('/training-sessions'); expect(api.get).toHaveBeenCalledWith('/trainer-leaves')
  })
})
