import { Link } from 'react-router-dom'
import './login.css'

function Login() {
  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>LOGIN</h1>
        <form className="auth-form">
          <input placeholder="Email/Username" />
          <input placeholder="Password" type="password" />
          <button type="button" className="btn primary full">Login</button>
        </form>
        <div className="auth-links">
          <a href="#">Forgot Password?</a>
          <span> · </span>
          <Link to="/register">Create Account?</Link>
        </div>
        <div className="social-row">
          <div className="circle">F</div>
          <div className="circle">G</div>
        </div>
      </div>
    </section>
  )
}

export default Login


