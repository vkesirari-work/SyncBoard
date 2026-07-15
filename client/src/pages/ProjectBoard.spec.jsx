import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderPage } from '../test/test-utils'
import ProjectBoard from './ProjectBoard'

describe('ProjectBoard', () => {
  it('renders the selected operations board and opens member-note creation', () => {
    renderPage(<ProjectBoard />, '/dashboard/projects/syncboard-web', '/dashboard/projects/:projectId')
    expect(screen.getByText(/live gym desk enabled/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /add member note/i }))
    expect(screen.getByRole('heading', { name: /add member note/i })).toBeInTheDocument()
  })
})
