import { Link } from 'react-router-dom'

function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand compact">
          <div className="brand-mark">G</div>
          <strong>GymDesk</strong>
        </div>
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your gym desk</h1>
        </div>
        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="owner@gymdesk.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter password" />
          </label>
          <button className="primary-button full" type="button">
            Sign in
          </button>
        </form>
        <p className="auth-switch">
          New gym owner? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
