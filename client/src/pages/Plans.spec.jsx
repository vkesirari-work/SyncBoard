import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Plans from './Plans'

describe('Plans', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('opens the plan creation workflow', async () => {
    renderPage(<Plans />)
    fireEvent.click(await screen.findByRole('button', { name: /new plan/i }))
    expect(screen.getByRole('heading', { name: /create plan/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
  })

  it('creates, updates, searches and deletes a membership plan', async () => {
    const user = userEvent.setup()
    const plan = { _id: 'plan-1', name: 'Annual Gold', durationMonths: 12, price: 15000, description: 'Complete access', isActive: true }
    setupApi({ '/plans': { plans: [plan] } })
    renderPage(<Plans />)
    expect(await screen.findByText('Annual Gold')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Search plans'), 'quarterly')
    expect(screen.getByText('No matching plans found.')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Search plans'))

    await user.click(screen.getByRole('button', { name: /^Edit$/ }))
    await user.clear(screen.getByLabelText('Price (₹)'))
    await user.type(screen.getByLabelText('Price (₹)'), '16000')
    await user.selectOptions(screen.getByLabelText('Status'), 'false')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(api.patch).toHaveBeenCalledWith('/plans/plan-1', expect.objectContaining({ price: 16000, isActive: false }))

    await user.click(screen.getByRole('button', { name: 'Delete Annual Gold' }))
    expect(api.delete).toHaveBeenCalledWith('/plans/plan-1')

    await user.click(screen.getByRole('button', { name: /new plan/i }))
    await user.type(screen.getByLabelText('Plan name'), 'Monthly')
    await user.type(screen.getByLabelText('Price (₹)'), '2000')
    await user.click(screen.getByRole('button', { name: 'Create plan' }))
    expect(api.post).toHaveBeenCalledWith('/plans', expect.objectContaining({ name: 'Monthly', durationMonths: 1, price: 2000 }))
  })
})
