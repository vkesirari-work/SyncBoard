import { Link } from 'react-router-dom'

function Register() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand compact">
          <div className="brand-mark">S</div>
          <strong>SyncBoard</strong>
        </div>
        <div>
          <p className="eyebrow">Start workspace</p>
          <h1>Create your SyncBoard account</h1>
        </div>
        <form className="auth-form">
          <label>
            Name
            <input type="text" placeholder="Vikram Singh" />
          </label>
          <label>
            Email
            <input type="email" placeholder="vikram@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Create password" />
          </label>
          <button className="primary-button full" type="button">
            Create account
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
