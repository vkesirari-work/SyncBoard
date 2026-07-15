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
})
