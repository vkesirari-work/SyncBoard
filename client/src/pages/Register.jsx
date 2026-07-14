import { Link } from 'react-router-dom'

function Register() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand compact">
          <div className="brand-mark">S</div>
          <strong>Sirari Fitness</strong>
        </div>
        <div>
          <p className="eyebrow">Start Sirari admin</p>
          <h1>Create your Sirari Fitness account</h1>
        </div>
        <form className="auth-form">
          <label>
            Owner name
            <input type="text" placeholder="Vikram Singh" />
          </label>
          <label>
            Email
            <input type="email" placeholder="owner@sirarifitness.com" />
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
