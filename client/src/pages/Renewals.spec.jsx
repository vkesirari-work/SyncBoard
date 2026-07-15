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
})
