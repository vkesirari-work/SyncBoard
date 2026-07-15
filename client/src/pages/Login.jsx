import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const [form, setForm] = useState({ email: '', password: '' })
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
      const { data } = await api.post('/auth/login', form)
      setSession(data.token, data.user)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand compact">
          <div className="brand-mark">S</div>
          <strong>Sirari Fitness</strong>
        </div>
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to Sirari Fitness</h1>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" type="email" placeholder="owner@sirarifitness.com" value={form.email} onChange={updateField} autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="Enter password" value={form.password} onChange={updateField} autoComplete="current-password" required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          First-time gym setup? <Link to="/register">Create owner account</Link>
        </p>
        <p className="auth-switch">Staff forgot password? Contact the gym owner for a secure reset.</p>
      </section>
    </main>
  )
}

export default Login
