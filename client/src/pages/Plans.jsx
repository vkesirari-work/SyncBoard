import { Plus, RefreshCw, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

const initialForm = { name: '', durationMonths: '1', price: '', description: '' }

function Plans() {
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState(initialForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadPlans = useCallback(async () => {
    try {
      const { data } = await api.get('/plans')
      setPlans(data.plans)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load plans.')
    }
  }, [])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function createPlan(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/plans', {
        ...form,
        durationMonths: Number(form.durationMonths),
        price: Number(form.price),
      })
      setForm(initialForm)
      setIsFormOpen(false)
      await loadPlans()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create plan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Membership setup</p>
          <h1>Plans</h1>
          <p className="page-description">Create membership options used when adding members.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsFormOpen(true)}>
          <Plus size={18} /> New plan
        </button>
      </div>

      {error && <p className="dashboard-notice error" role="alert">{error}</p>}

      <div className="plan-admin-grid">
        {plans.map((plan) => (
          <article className="panel plan-admin-card" key={plan._id}>
            <div>
              <p className="eyebrow">{plan.durationMonths} month{plan.durationMonths === 1 ? '' : 's'}</p>
              <h2>{plan.name}</h2>
              <strong>₹{plan.price.toLocaleString('en-IN')}</strong>
            </div>
            <p>{plan.description || 'No description'}</p>
            <span className="status-pill">{plan.isActive ? 'Active' : 'Inactive'}</span>
          </article>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="panel empty-plan-state">
          <p>No plans yet. Add Monthly, Quarterly, or Annual membership.</p>
          <button className="secondary-button" type="button" onClick={loadPlans}><RefreshCw size={16} /> Refresh</button>
        </div>
      )}

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
            <div className="modal-header">
              <div><p className="eyebrow">Membership setup</p><h2 id="plan-modal-title">Create plan</h2></div>
              <button className="icon-button" type="button" aria-label="Close" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={createPlan}>
              <label>Plan name<input autoFocus name="name" value={form.name} onChange={updateField} placeholder="Monthly" required /></label>
              <div className="form-grid equal">
                <label>Duration (months)<input name="durationMonths" type="number" min="1" value={form.durationMonths} onChange={updateField} required /></label>
                <label>Price (₹)<input name="price" type="number" min="0" value={form.price} onChange={updateField} required /></label>
              </div>
              <label>Description<input name="description" value={form.description} onChange={updateField} placeholder="Gym access and strength floor" /></label>
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Create plan'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default Plans
