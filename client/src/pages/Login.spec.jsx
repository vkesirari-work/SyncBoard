import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setupApi } from '../test/test-utils'
import Login from './Login'

describe('Login', () => {
  beforeEach(() => setupApi())
  it('submits credentials to the login endpoint', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'jwt', user: { id: 'owner-1', name: 'Owner', role: 'admin' } } })
    renderPage(<Login />, '/login')
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'owner@example.com' } }); fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } }); fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'owner@example.com', password: 'password123' }))
  })
})
