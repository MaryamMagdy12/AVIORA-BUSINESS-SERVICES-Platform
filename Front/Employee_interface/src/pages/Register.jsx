import { Link } from 'react-router-dom'
import './register.css'

function Register() {
  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>REGISTER</h1>
        <form className="auth-form">
          <input placeholder="Full Name" />
          <input placeholder="Email" type="email" />
          <input placeholder="Password" type="password" />
          <input placeholder="Confirm Password" type="password" />
          <button type="button" className="btn primary full">Create Account</button>
        </form>
        <div className="auth-links">
          Already have an account? <Link to="/login">Login here.</Link>
        </div>
      </div>
    </section>
  )
}

export default Register


