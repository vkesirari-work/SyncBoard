import { CreditCard, IndianRupee, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import { useSearchParams } from 'react-router-dom'
import './Payments.css'
import ModalShell from '../components/ui/ModalShell'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const initialForm = {
  member: '',
  plan: '',
  amount: '',
  method: 'upi',
  status: 'paid',
  paidAt: new Date().toISOString().slice(0, 10),
  reference: '',
  notes: '',
}

function Payments() {
  const [searchParams] = useSearchParams()
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState(initialForm)
  const [query, setQuery] = useState(() => searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkout, setCheckout] = useState({ member: '', plan: '' })
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const loadPayments = useCallback(async () => {
    try {
      const { data } = await api.get('/payments')
      setPayments(data.payments)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load payments.')
    }
  }, [])

  useEffect(() => {
    loadPayments()
    Promise.all([api.get('/members'), api.get('/plans')])
      .then(([memberResponse, planResponse]) => {
        setMembers(memberResponse.data.members)
        setPlans(planResponse.data.plans.filter((plan) => plan.isActive))
      })
      .catch(() => setError('Could not load members or plans.'))
  }, [loadPayments])

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    const socket = getSocket()
    socket.on('payment:created', loadPayments)
    socket.on('payment:updated', loadPayments)
    socket.on('payment:deleted', loadPayments)
    socket.connect()

    return () => {
      socket.off('payment:created', loadPayments)
      socket.off('payment:updated', loadPayments)
      socket.off('payment:deleted', loadPayments)
      socket.disconnect()
    }
  }, [loadPayments])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => {
      if (name === 'plan') {
        const plan = plans.find((item) => item._id === value)
        return { ...current, plan: value, amount: plan ? String(plan.price) : current.amount }
      }
      return { ...current, [name]: value }
    })
  }

  function openCreateForm() {
    setSelectedPayment(null)
    setForm({ ...initialForm, paidAt: new Date().toISOString().slice(0, 10) })
    setIsFormOpen(true)
  }

  function openEditForm(payment) {
    setSelectedPayment(payment)
    setForm({
      member: payment.member?._id || '',
      plan: payment.plan?._id || '',
      amount: String(payment.amount),
      method: payment.method,
      status: payment.status,
      paidAt: new Date(payment.paidAt).toISOString().slice(0, 10),
      reference: payment.reference || '',
      notes: payment.notes || '',
    })
    setIsFormOpen(true)
  }

  async function savePayment(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ''))
    payload.amount = Number(payload.amount)

    try {
      if (selectedPayment) await api.patch(`/payments/${selectedPayment._id}`, payload)
      else await api.post('/payments', payload)
      setForm({ ...initialForm, paidAt: new Date().toISOString().slice(0, 10) })
      setIsFormOpen(false)
      await loadPayments()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not record payment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deletePayment(payment) {
    if (!window.confirm(`Delete this ${payment.status} payment for ${payment.member?.name || 'member'}?`)) return
    setDeletingId(payment._id)
    setError('')
    try {
      await api.delete(`/payments/${payment._id}`)
      await loadPayments()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete payment.')
    } finally {
      setDeletingId(null)
    }
  }

  async function startOnlinePayment(event) {
    event.preventDefault()
    setIsCheckingOut(true)
    setError('')
    try {
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const existing = document.querySelector('script[data-razorpay-checkout]')
          if (existing) { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); return }
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.dataset.razorpayCheckout = 'true'
          script.onload = resolve
          script.onerror = () => reject(new Error('Could not load Razorpay Checkout'))
          document.head.appendChild(script)
        })
      }
      const { data } = await api.post('/payments/checkout/order', checkout)
      const razorpay = new window.Razorpay({
        key: data.keyId, amount: data.order.amount, currency: data.order.currency, order_id: data.order.id,
        name: 'Sirari Fitness', description: data.plan.name,
        prefill: { name: data.member.name, email: data.member.email || '', contact: data.member.phone },
        theme: { color: '#059669' },
        handler: async (result) => {
          try {
            await api.post('/payments/checkout/verify', { ...result, member: checkout.member, plan: checkout.plan })
            setIsCheckoutOpen(false)
            setCheckout({ member: '', plan: '' })
            await loadPayments()
          } catch (requestError) { setError(requestError.response?.data?.message || 'Payment completed but verification failed. Contact support.') }
        },
        modal: { ondismiss: () => setIsCheckingOut(false) },
      })
      razorpay.on('payment.failed', (result) => setError(result.error?.description || 'Online payment failed.'))
      razorpay.open()
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not start online payment.')
    } finally { setIsCheckingOut(false) }
  }

  const filteredPayments = useMemo(() => {
    const search = query.trim().toLowerCase()
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
      const matchesSearch = !search || [payment.member?.name, payment.member?.phone, payment.plan?.name, payment.method, payment.reference]
        .some((value) => value?.toLowerCase().includes(search))
      return matchesStatus && matchesSearch
    })
  }, [payments, query, statusFilter])

  const paidTotal = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((total, payment) => total + payment.amount, 0)

  return (
    <section className="page-stack">
      <div className="page-header">
        <div className="page-title-row"><div className="page-title-icon"><IndianRupee size={22} /></div><div><p className="eyebrow">Revenue desk</p><h1>Payments</h1><p className="page-description">Record fees and review member payment history.</p></div></div>
        <div className="payment-header-actions"><button className="secondary-button" type="button" onClick={() => setIsCheckoutOpen(true)}><CreditCard size={17} /> Online payment</button><button className="primary-button" type="button" onClick={openCreateForm}><Plus size={18} /> Record payment</button></div>
      </div>

      <div className="payment-summary">
        <article className="stat-card"><IndianRupee size={20} /><strong>{currency.format(paidTotal)}</strong><span>Total paid revenue</span></article>
        <article className="stat-card"><strong>{payments.filter((item) => item.status === 'paid').length}</strong><span>Paid transactions</span></article>
        <article className="stat-card"><strong>{payments.filter((item) => item.status === 'pending').length}</strong><span>Pending payments</span></article>
      </div>

      <section className="panel">
        <div className="member-toolbar payment-toolbar">
          <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member, plan, method, or reference" /></div>
          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="secondary-button" type="button" onClick={loadPayments}><RefreshCw size={16} /> Refresh</button>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="member-table-wrap">
          <table className="member-table">
            <thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Reference</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td><strong>{payment.member?.name || 'Member'}</strong><span>{payment.member?.phone || '—'}</span></td>
                  <td>{payment.plan?.name || 'No plan'}</td>
                  <td><strong>{currency.format(payment.amount)}</strong></td>
                  <td className="capitalize">{payment.method.replaceAll('_', ' ')}</td>
                  <td><span className="status-pill">{payment.status}</span></td>
                  <td>{new Date(payment.paidAt).toLocaleDateString('en-IN')}</td>
                  <td>{payment.reference || '—'}</td>
                  <td><div className="table-actions"><button className="icon-button small" type="button" aria-label="Edit payment" title="Edit" onClick={() => openEditForm(payment)}><Pencil size={15} /></button><button className="icon-button small danger" type="button" aria-label="Delete payment" title="Delete" disabled={deletingId === payment._id} onClick={() => deletePayment(payment)}><Trash2 size={15} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && <p className="empty-state">No matching payments found.</p>}
      </section>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
            <div className="modal-header">
              <div><p className="eyebrow">Revenue desk</p><h2 id="payment-modal-title">{selectedPayment ? 'Edit payment' : 'Record payment'}</h2></div>
              <button className="icon-button" type="button" aria-label="Close" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={savePayment}>
              <label>Member<select name="member" value={form.member} onChange={updateField} required><option value="" disabled>Select member</option>{members.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.phone}</option>)}</select></label>
              <div className="form-grid equal">
                <label>Plan<select name="plan" value={form.plan} onChange={updateField}><option value="">No plan</option>{plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}</select></label>
                <label>Amount (₹)<input name="amount" type="number" min="0" value={form.amount} onChange={updateField} required /></label>
              </div>
              <div className="form-grid equal">
                <label>Method<select name="method" value={form.method} onChange={updateField}><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank transfer</option><option value="other">Other</option></select></label>
                <label>Status<select name="status" value={form.status} onChange={updateField}><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label>
              </div>
              <div className="form-grid equal">
                <label>Payment date<input name="paidAt" type="date" value={form.paidAt} onChange={updateField} required /></label>
                <label>Reference<input name="reference" value={form.reference} onChange={updateField} placeholder="UPI or receipt ID" /></label>
              </div>
              <label>Notes<input name="notes" value={form.notes} onChange={updateField} placeholder="Optional payment note" /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : selectedPayment ? 'Save changes' : 'Record payment'}</button></div>
            </form>
          </section>
        </div>
      )}
      {isCheckoutOpen && <ModalShell labelledBy="checkout-title" isBusy={isCheckingOut} onClose={() => setIsCheckoutOpen(false)}><div className="modal-header"><div><p className="eyebrow">Razorpay test mode</p><h2 id="checkout-title">Collect online payment</h2></div><button className="icon-button" type="button" aria-label="Close" onClick={() => setIsCheckoutOpen(false)}><X size={18} /></button></div><form className="modal-form" onSubmit={startOnlinePayment}><label>Member<select value={checkout.member} onChange={(event) => setCheckout((current) => ({ ...current, member: event.target.value }))} required><option value="" disabled>Select member</option>{members.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.phone}</option>)}</select></label><label>Plan<select value={checkout.plan} onChange={(event) => setCheckout((current) => ({ ...current, plan: event.target.value }))} required><option value="" disabled>Select plan</option>{plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name} · {currency.format(plan.price)}</option>)}</select></label><p className="checkout-note">Test Mode checkout will open securely. The amount comes from the selected plan and cannot be changed in the browser.</p><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsCheckoutOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isCheckingOut}>{isCheckingOut ? 'Opening…' : 'Open secure checkout'}</button></div></form></ModalShell>}
    </section>
  )
}

export default Payments
