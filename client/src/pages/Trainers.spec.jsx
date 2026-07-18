import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Trainers from './Trainers'

describe('Trainers', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads trainers and opens account/profile creation', async () => {
    renderPage(<Trainers />)
    expect(await screen.findByRole('heading', { name: 'Trainers' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/trainers'); expect(api.get).toHaveBeenCalledWith('/members')
    fireEvent.click(screen.getByRole('button', { name: /add trainer/i }))
    expect(screen.getByRole('heading', { name: /add trainer/i })).toBeInTheDocument()
  })

  it('exposes mobile card labels for trainer details', async () => {
    setupApi({ '/trainers': { trainers: [{ _id: 'trainer-1', name: 'Coach Aman', phone: '9000000000', specialties: ['Strength'], shift: 'morning', workingDays: ['monday'], assignedMembers: [], isActive: true }] }, '/members': { members: [] } })
    const { container } = renderPage(<Trainers />)
    expect(await screen.findByText('Coach Aman')).toBeInTheDocument()
    expect([...container.querySelectorAll('tbody td')].map((cell) => cell.dataset.label)).toEqual(['Trainer', 'Specialties', 'Shift', 'Working days', 'Members', 'Status', 'Actions'])
  })
})
