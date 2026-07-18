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

  it('exposes mobile card labels for session details', async () => {
    setupApi({
      '/training-sessions': { sessions: [{ _id: 'session-1', scheduledAt: '2026-07-18T06:00:00.000Z', member: { name: 'Asha', phone: '9000000000' }, trainer: { name: 'Coach Aman', shift: 'morning' }, focus: 'Strength', durationMinutes: 60, status: 'scheduled' }] },
      '/members': { members: [] },
      '/trainers': { trainers: [] },
    })
    const { container } = renderPage(<TrainingSessions />)
    expect(await screen.findByText('Asha')).toBeInTheDocument()
    expect([...container.querySelectorAll('tbody td')].map((cell) => cell.dataset.label)).toEqual(['Date & time', 'Member', 'Trainer', 'Focus', 'Duration', 'Status', 'Actions'])
  })
})
