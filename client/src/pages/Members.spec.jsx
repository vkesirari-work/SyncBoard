import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Members from './Members'

describe('Members', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads members and exposes member search', async () => {
    renderPage(<Members />)
    expect(await screen.findByRole('heading', { name: 'Members' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/members', expect.objectContaining({ params: expect.objectContaining({ page: 1, limit: 20 }) }))
    expect(screen.getByRole('textbox', { name: /search members/i })).toBeInTheDocument()
  })
})
