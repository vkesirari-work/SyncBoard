import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Attendance from './Attendance'

describe('Attendance', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads visits and active members for check-in', async () => {
    renderPage(<Attendance />)
    expect(await screen.findByRole('heading', { name: 'Attendance' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/attendance'); expect(api.get).toHaveBeenCalledWith('/members')
    expect(screen.getByRole('button', { name: /check in member/i })).toBeInTheDocument()
  })

  it('exposes mobile card labels for each attendance value', async () => {
    setupApi({
      '/attendance': { attendance: [{ _id: 'visit-1', member: { name: 'Asha', phone: '9000000000' }, checkIn: '2026-07-18T04:00:00.000Z', checkOut: null, notes: 'Morning' }] },
      '/members': { members: [] },
    })
    const { container } = renderPage(<Attendance />)
    expect(await screen.findByText('Asha')).toBeInTheDocument()
    expect([...container.querySelectorAll('tbody td')].map((cell) => cell.dataset.label)).toEqual(['Member', 'Check in', 'Check out', 'Duration', 'Notes', 'Actions'])
  })
})
