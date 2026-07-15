import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setupApi } from '../test/test-utils'
import Register from './Register'

describe('Register', () => {
  beforeEach(() => setupApi())
  it('creates the first owner with the registration API', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'jwt', user: { id: 'owner-1', name: 'Owner', role: 'admin' } } })
    renderPage(<Register />, '/register')
    fireEvent.change(screen.getByLabelText(/owner name/i), { target: { value: 'Gym Owner' } }); fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'owner@example.com' } }); fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } }); fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/auth/register', { name: 'Gym Owner', email: 'owner@example.com', password: 'password123' }))
  })
})
