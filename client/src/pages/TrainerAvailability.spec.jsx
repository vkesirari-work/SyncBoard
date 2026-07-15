import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import TrainerAvailability from './TrainerAvailability'

describe('TrainerAvailability', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads leave requests and trainer choices', async () => {
    renderPage(<TrainerAvailability />)
    expect(await screen.findByRole('heading', { name: 'Trainer availability' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/trainer-leaves'); expect(api.get).toHaveBeenCalledWith('/trainers')
  })
})
