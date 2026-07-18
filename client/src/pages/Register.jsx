import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import SirariLogo from '../components/branding/SirariLogo'

function Register() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { data } = await api.post('/auth/register', form)
      setSession(data.token, data.user)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand compact">
          <SirariLogo compact size={42} />
          <strong>Sirari Fitness</strong>
        </div>
        <div>
          <p className="eyebrow">Start Sirari admin</p>
          <h1>Create your Sirari Fitness account</h1>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Owner name
            <input name="name" type="text" placeholder="Vikram Singh" value={form.name} onChange={updateField} autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="owner@sirarifitness.com" value={form.email} onChange={updateField} autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={updateField} autoComplete="new-password" minLength={8} required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
