import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Leads from './Leads'

describe('Leads', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads the CRM and renders every pipeline stage', async () => {
    renderPage(<Leads />)
    expect(await screen.findByRole('heading', { name: 'Leads' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/leads')
    expect(screen.getByRole('heading', { name: /new leads/i })).toBeInTheDocument()
  })

  it('creates, edits, moves and deletes leads through the pipeline', async () => {
    const user = userEvent.setup()
    const lead = { _id: 'lead-1', name: 'Riya Sharma', phone: '9999999999', email: 'riya@example.com', fitnessGoal: 'fat_loss', message: 'Evening tour', source: 'website', status: 'new', createdAt: '2026-07-15T10:00:00.000Z' }
    setupApi({ '/leads': { leads: [lead] } })
    renderPage(<Leads />)
    expect(await screen.findByText('Riya Sharma')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(/search name/i), 'unknown')
    expect(screen.getAllByText('No leads')).toHaveLength(4)
    await user.clear(screen.getByPlaceholderText(/search name/i))

    await user.click(screen.getByRole('button', { name: 'Edit Riya Sharma' }))
    await user.clear(screen.getByLabelText('Message and follow-up notes'))
    await user.type(screen.getByLabelText('Message and follow-up notes'), 'Called successfully')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(api.patch).toHaveBeenCalledWith('/leads/lead-1', expect.objectContaining({ message: 'Called successfully' }))

    const card = screen.getByText('Riya Sharma').closest('article')
    const contactedColumn = screen.getByRole('heading', { name: 'Contacted' }).closest('section')
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData: vi.fn(), getData: vi.fn(() => 'lead-1') }
    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.dragEnter(contactedColumn, { dataTransfer })
    fireEvent.dragOver(contactedColumn, { dataTransfer })
    fireEvent.drop(contactedColumn, { dataTransfer })
    expect(api.patch).toHaveBeenCalledWith('/leads/lead-1', { status: 'contacted' })

    await user.click(screen.getByRole('button', { name: 'Delete Riya Sharma' }))
    expect(api.delete).toHaveBeenCalledWith('/leads/lead-1')

    await user.click(screen.getByRole('button', { name: /add lead/i }))
    await user.type(screen.getByLabelText('Name'), 'Karan Gill')
    await user.type(screen.getByLabelText('Phone'), '9888888888')
    await user.click(screen.getAllByRole('button', { name: 'Add lead' }).at(-1))
    expect(api.post).toHaveBeenCalledWith('/leads/admin', expect.objectContaining({ name: 'Karan Gill', fitnessGoal: undefined }))
  })
})
