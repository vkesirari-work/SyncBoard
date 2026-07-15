import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../../lib/api'
import { renderPage, setupApi } from '../../test/test-utils'
import GlobalSearch from './GlobalSearch'

describe('GlobalSearch', () => {
  beforeEach(() => setupApi({ '/members': { members: [{ _id: 'member-1', name: 'Rahul Singh', phone: '9999999999' }] } }))
  it('waits for a useful query then searches every operational collection', async () => {
    renderPage(<GlobalSearch />)
    fireEvent.change(screen.getByLabelText(/search all gym data/i), { target: { value: 'Rahul' } })
    expect(await screen.findByRole('button', { name: /rahul singh/i })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/members')
  })
})
