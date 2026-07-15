import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderPage, setAuth } from '../../test/test-utils'
import ProtectedRoute from './ProtectedRoute'

describe('ProtectedRoute', () => {
  it('renders private content for an authenticated session', () => {
    setAuth()
    renderPage(<ProtectedRoute><h1>Private dashboard</h1></ProtectedRoute>)
    expect(screen.getByRole('heading', { name: 'Private dashboard' })).toBeInTheDocument()
  })
  it('does not expose private content without a token', () => {
    setAuth(null, null)
    render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/dashboard" element={<ProtectedRoute><h1>Private dashboard</h1></ProtectedRoute>} /><Route path="/login" element={<h1>Sign in</h1>} /></Routes></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})
