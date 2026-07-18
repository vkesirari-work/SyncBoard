import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../../lib/api'
import { renderPage, setupApi } from '../../test/test-utils'
import GlobalSearch from './GlobalSearch'

describe('GlobalSearch', () => {
  beforeEach(() => setupApi({ '/admin/search': { results: [{ id: 'member-1', type: 'Member', title: 'Rahul Singh', detail: '9999999999', searchTerm: '9999999999', path: '/dashboard/members' }] } }))
  it('waits for a useful query then uses the scoped search endpoint', async () => {
    renderPage(<GlobalSearch />)
    fireEvent.change(screen.getByLabelText(/search all gym data/i), { target: { value: 'Rahul' } })
    expect(await screen.findByRole('button', { name: /rahul singh/i })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/admin/search', expect.objectContaining({ params: { q: 'Rahul' }, signal: expect.any(AbortSignal) }))
  })
})
