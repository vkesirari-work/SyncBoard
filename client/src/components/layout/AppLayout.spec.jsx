import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render } from '@testing-library/react'
import AppLayout from './AppLayout'
import { connectSocket, disconnectSocket } from '../../lib/socket'
import { setAuth } from '../../test/test-utils'

vi.mock('./Sidebar', () => ({ default: () => <nav>Test sidebar</nav> }))
vi.mock('./Topbar', () => ({ default: () => <header>Test topbar</header> }))

describe('AppLayout', () => {
  it('renders navigation chrome and the selected child route', () => {
    setAuth()
    const { unmount } = render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/dashboard" element={<AppLayout />}><Route index element={<h1>Dashboard child</h1>} /></Route></Routes></MemoryRouter>)
    expect(screen.getByText('Test sidebar')).toBeInTheDocument(); expect(screen.getByText('Test topbar')).toBeInTheDocument(); expect(screen.getByRole('heading', { name: 'Dashboard child' })).toBeInTheDocument()
    expect(connectSocket).toHaveBeenCalledWith('test-token')
    unmount()
    expect(disconnectSocket).toHaveBeenCalled()
  })
})
