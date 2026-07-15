import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderPage, setAuth } from '../../test/test-utils'
import AdminRoute from './AdminRoute'

describe('AdminRoute', () => {
  it('allows staff only when the requested module permission exists', () => {
    setAuth({ id: 'staff-1', name: 'Staff', role: 'staff', permissions: ['members'] })
    renderPage(<AdminRoute permission="members"><h1>Member module</h1></AdminRoute>)
    expect(screen.getByRole('heading', { name: 'Member module' })).toBeInTheDocument()
  })
  it('redirects staff away from owner-only controls', () => {
    setAuth({ id: 'staff-1', name: 'Staff', role: 'staff', permissions: ['members'] })
    render(<MemoryRouter initialEntries={['/staff']}><Routes><Route path="/staff" element={<AdminRoute ownerOnly><h1>Owner controls</h1></AdminRoute>} /><Route path="/dashboard" element={<h1>Dashboard fallback</h1>} /></Routes></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Dashboard fallback' })).toBeInTheDocument()
  })
})
