import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, RouterProvider: () => <div>Application router</div> }
})

describe('App', () => {
  it('mounts the application router provider', () => {
    render(<App />)
    expect(screen.getByText('Application router')).toBeInTheDocument()
  })
})
