import { Link } from 'react-router-dom'

function Register() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand compact">
          <div className="brand-mark">G</div>
          <strong>GymDesk</strong>
        </div>
        <div>
          <p className="eyebrow">Start gym desk</p>
          <h1>Create your GymDesk account</h1>
        </div>
        <form className="auth-form">
          <label>
            Owner name
            <input type="text" placeholder="Vikram Singh" />
          </label>
          <label>
            Email
            <input type="email" placeholder="owner@gymdesk.com" />
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
