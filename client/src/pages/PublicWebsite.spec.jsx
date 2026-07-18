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
    expect(screen.getByRole('heading', { name: /your strongest era/i })).toBeInTheDocument()
    expect(screen.getAllByText(/opening 2027/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('₹', { selector: 'sup' })).toHaveLength(4)
    expect(screen.getAllByText('999').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /dashboard login/i })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /dashboard login/i })[0]).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /chat with sirari fitness on whatsapp/i })).toHaveAttribute('href', expect.stringContaining('wa.me/919012752982'))
    expect(screen.getByRole('link', { name: /open sirari fitness location in google maps/i })).toHaveAttribute('href', expect.stringContaining('google.com/maps'))
    const form = screen.getByRole('button', { name: /join founding list/i }).closest('form')
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'New Lead' } }); fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '9876543210' } }); fireEvent.change(screen.getByLabelText(/primary goal/i), { target: { value: 'fat_loss' } }); fireEvent.submit(form)
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/leads', expect.objectContaining({ name: 'New Lead', phone: '9876543210', fitnessGoal: 'fat_loss' })))
  })
})
