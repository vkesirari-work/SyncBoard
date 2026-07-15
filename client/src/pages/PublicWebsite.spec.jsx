import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setupApi } from '../test/test-utils'
import PublicWebsite from './PublicWebsite'

describe('PublicWebsite', () => {
  beforeEach(() => setupApi())
  it('renders the marketing site and submits a lead to the backend', async () => {
    api.post.mockResolvedValueOnce({ data: { lead: { _id: 'lead-1' } } })
    renderPage(<PublicWebsite />, '/')
    expect(screen.getByRole('heading', { name: /break your limits/i })).toBeInTheDocument()
    const form = screen.getByRole('button', { name: /claim free trial/i }).closest('form')
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'New Lead' } }); fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '9876543210' } }); fireEvent.change(screen.getByLabelText(/primary goal/i), { target: { value: 'fat_loss' } }); fireEvent.submit(form)
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/leads', expect.objectContaining({ name: 'New Lead', phone: '9876543210', fitnessGoal: 'fat_loss' })))
  })
})
