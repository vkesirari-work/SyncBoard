import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import TrainingSessions from './TrainingSessions'

describe('TrainingSessions', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads sessions, members, and trainers needed for conflict-safe booking', async () => {
    renderPage(<TrainingSessions />)
    expect(await screen.findByRole('heading', { name: 'Training sessions' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/training-sessions'); expect(api.get).toHaveBeenCalledWith('/members'); expect(api.get).toHaveBeenCalledWith('/trainers')
  })
})
