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
})
