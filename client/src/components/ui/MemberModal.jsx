import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  plan: '',
  membershipStart: '',
  membershipEnd: '',
  status: 'active',
  gender: '',
  dateOfBirth: '',
  address: '',
  notes: '',
}

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

function MemberModal({ member, onClose, onSaved }) {
  const isEditing = Boolean(member)
  const [form, setForm] = useState(() => member ? {
    name: member.name || '',
    phone: member.phone || '',
    email: member.email || '',
    plan: member.plan?._id || '',
    membershipStart: toDateInput(member.membershipStart),
    membershipEnd: toDateInput(member.membershipEnd),
    status: member.status || 'active',
    gender: member.gender || '',
    dateOfBirth: toDateInput(member.dateOfBirth),
    address: member.address || '',
    notes: member.notes || '',
  } : initialForm)
  const [plans, setPlans] = useState([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    api.get('/plans')
      .then(({ data }) => setPlans(data.plans.filter((plan) => plan.isActive)))
      .catch(() => setPlans([]))
  }, [])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload = isEditing
      ? {
          ...form,
          plan: form.plan || null,
          membershipStart: form.membershipStart || null,
          membershipEnd: form.membershipEnd || null,
          dateOfBirth: form.dateOfBirth || null,
        }
      : Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ''))

    try {
      const { data } = isEditing
        ? await api.patch(`/members/${member._id}`, payload)
        : await api.post('/members', payload)
      onSaved(data.member)
      onClose()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create member. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Membership desk</p>
            <h2 id="member-modal-title">{isEditing ? 'View and edit member' : 'Add new member'}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input autoFocus name="name" value={form.name} onChange={updateField} required />
          </label>
          <div className="form-grid equal">
            <label>
              Phone
              <input name="phone" type="tel" value={form.phone} onChange={updateField} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={updateField} />
            </label>
          </div>
          <div className="form-grid equal">
            <label>
              Gender
              <select name="gender" value={form.gender} onChange={updateField}>
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Date of birth
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateField} />
            </label>
          </div>
          <label>
            Address
            <input name="address" value={form.address} onChange={updateField} />
          </label>
          <label>
            Notes
            <textarea name="notes" rows="3" value={form.notes} onChange={updateField} placeholder="Medical notes, goals, or staff follow-up" />
          </label>
          <div className="form-grid equal">
            <label>
              Plan
              <select name="plan" value={form.plan} onChange={updateField}>
                <option value="">No plan selected</option>
                {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
              </select>
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
              </select>
            </label>
          </div>
          <div className="form-grid equal">
            <label>
              Membership start
              <input name="membershipStart" type="date" value={form.membershipStart} onChange={updateField} />
            </label>
            <label>
              Membership end
              <input name="membershipEnd" type="date" value={form.membershipEnd} onChange={updateField} />
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add member'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default MemberModal
