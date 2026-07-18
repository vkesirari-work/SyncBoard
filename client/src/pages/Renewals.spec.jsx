import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Renewals from './Renewals'

describe('Renewals', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('derives renewal work from membership end dates', async () => {
    renderPage(<Renewals />)
    expect(await screen.findByRole('heading', { name: 'Renewals' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/members')
    expect(screen.getByText('0 due')).toBeInTheDocument()
  })

  it('exposes mobile card labels for renewal details', async () => {
    setupApi({ '/members': { members: [{ _id: 'member-1', name: 'Asha', phone: '9000000000', plan: { name: 'Monthly' }, membershipEnd: '2026-07-20T00:00:00.000Z', status: 'active' }] } })
    const { container } = renderPage(<Renewals />)
    expect(await screen.findByText('Asha')).toBeInTheDocument()
    expect([...container.querySelectorAll('tbody td')].map((cell) => cell.dataset.label)).toEqual(['Member', 'Plan', 'End date', 'Renewal status', 'Member status', 'Actions'])
  })
})
