import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api'
import { renderPage, setAuth, setupApi } from '../test/test-utils'
import Payments from './Payments'

describe('Payments', () => {
  beforeEach(() => { setupApi(); setAuth() })
  it('loads payments together with member and plan choices', async () => {
    renderPage(<Payments />)
    expect(await screen.findByRole('heading', { name: 'Payments' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/payments'); expect(api.get).toHaveBeenCalledWith('/members'); expect(api.get).toHaveBeenCalledWith('/plans')
  })

  const member = { _id: 'member-1', name: 'Aman Singh', phone: '9876543210', email: 'aman@example.com' }
  const plan = { _id: 'plan-1', name: 'Annual', price: 12000, durationMonths: 12, isActive: true }
  const payment = { _id: 'payment12345678', member, plan, amount: 12000, method: 'bank_transfer', status: 'paid', paidAt: '2026-07-15T10:00:00.000Z', reference: 'TXN-1', notes: 'Annual fee' }

  it('creates, edits, deletes, filters and prints payment records', async () => {
    const user = userEvent.setup()
    setupApi({ '/payments': { payments: [payment] }, '/members': { members: [member] }, '/plans': { plans: [plan] } })
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    renderPage(<Payments />)

    expect(await screen.findByText('Aman Singh')).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText(/search member/i), 'missing')
    expect(screen.getByText('No matching payments found.')).toBeInTheDocument()
    await user.clear(screen.getByPlaceholderText(/search member/i))

    await user.click(screen.getByRole('button', { name: 'View receipt' }))
    expect(screen.getByRole('heading', { name: 'Payment receipt' })).toBeInTheDocument()
    expect(screen.getByText('SF-2026-12345678')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Print$/i }))
    expect(print).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Close receipt' }))

    await user.click(screen.getByRole('button', { name: 'Edit payment' }))
    await user.clear(screen.getByLabelText(/Amount/))
    await user.type(screen.getByLabelText(/Amount/), '12500')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(api.patch).toHaveBeenCalledWith('/payments/payment12345678', expect.objectContaining({ amount: 12500 }))

    await user.click(screen.getByRole('button', { name: 'Delete payment' }))
    expect(api.delete).toHaveBeenCalledWith('/payments/payment12345678')

    await user.click(screen.getByRole('button', { name: /record payment/i }))
    await user.selectOptions(screen.getByLabelText(/^Member/), 'member-1')
    await user.selectOptions(screen.getByLabelText(/^Plan/), 'plan-1')
    expect(screen.getByLabelText(/Amount/)).toHaveValue(12000)
    await user.click(screen.getAllByRole('button', { name: 'Record payment' }).at(-1))
    expect(api.post).toHaveBeenCalledWith('/payments', expect.objectContaining({ member: 'member-1', plan: 'plan-1', amount: 12000 }))
  })

  it('opens Razorpay, verifies success and shows the generated receipt', async () => {
    const user = userEvent.setup()
    let options
    const on = vi.fn()
    const open = vi.fn()
    window.Razorpay = vi.fn(function Razorpay(configuration) {
      options = configuration
      return { on, open }
    })
    setupApi({ '/payments': { payments: [] }, '/members': { members: [member] }, '/plans': { plans: [plan] } })
    api.post.mockImplementation(async (url) => {
      if (url === '/payments/checkout/order') return { data: { keyId: 'rzp_test', order: { amount: 1200000, currency: 'INR', id: 'order-1' }, member, plan } }
      if (url === '/payments/checkout/verify') return { data: { payment } }
      return { data: {} }
    })
    renderPage(<Payments />)
    await screen.findByRole('heading', { name: 'Payments' })

    await user.click(screen.getByRole('button', { name: /online payment/i }))
    await user.selectOptions(screen.getByLabelText(/^Member/), 'member-1')
    await user.selectOptions(screen.getByLabelText(/^Plan/), 'plan-1')
    await user.click(screen.getByRole('button', { name: /open secure checkout/i }))
    expect(open).toHaveBeenCalledOnce()
    expect(on).toHaveBeenCalledWith('payment.failed', expect.any(Function))

    await act(() => options.handler({ razorpay_payment_id: 'pay-1', razorpay_order_id: 'order-1', razorpay_signature: 'signed' }))
    expect(api.post).toHaveBeenCalledWith('/payments/checkout/verify', expect.objectContaining({ member: 'member-1', plan: 'plan-1' }))
    expect(await screen.findByRole('heading', { name: 'Payment receipt' })).toBeInTheDocument()
    delete window.Razorpay
  })
})
