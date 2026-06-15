import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../assets/css/auth.css'
import Reveal from '../components/Reveal'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Forgot Password States
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      navigate('/service')
    } else {
      setError(result.error || 'Login failed')
      if (result.requiresVerification) {
        setError('Email not verified. Please verify your email first.')
      }
    }

    setLoading(false)
  }

  // Forgot Password Handlers
  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setResetLoading(true)

    try {
      const response = await authAPI.requestPasswordReset(resetEmail)
      setSuccess(response.message || 'Password reset OTP sent to your email!')
      setResetStep(2)
    } catch (err) {
      const errorMessage = err.response?.data?.error
        || err.response?.data?.message
        || (err.message === 'Network Error' ? 'Cannot connect to server. Please try again.' : null)
        || 'Failed to send reset email. Please try again.'
      setError(errorMessage)
    }

    setResetLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setResetLoading(true)

    try {
      const response = await authAPI.verifyResetOtp(resetEmail, otp)
      setSuccess(response.message || 'OTP verified successfully!')
      setResetStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
    }

    setResetLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setResetLoading(true)

    try {
      const response = await authAPI.resetPassword(resetEmail, otp, newPassword, confirmPassword)
      setSuccess(response.message || 'Password reset successfully! You can now login.')
      
      // Reset all states and go back to login
      setTimeout(() => {
        setForgotPasswordMode(false)
        setResetStep(1)
        setResetEmail('')
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setSuccess('Password reset successfully! Please login with your new password.')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.')
    }

    setResetLoading(false)
  }

  const handleResendOtp = async () => {
    setError('')
    setSuccess('')
    setResetLoading(true)

    try {
      const response = await authAPI.resendResetOtp(resetEmail)
      setSuccess(response.message || 'OTP has been resent to your email!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP. Please try again.')
    }

    setResetLoading(false)
  }

  const startForgotPassword = () => {
    setForgotPasswordMode(true)
    setResetStep(1)
    setError('')
    setSuccess('')
    setResetEmail(email) // Pre-fill with login email if available
  }

  const backToLogin = () => {
    setForgotPasswordMode(false)
    setResetStep(1)
    setResetEmail('')
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  // Render Forgot Password Flow
  if (forgotPasswordMode) {
    return (
      <section className="page auth-page container">
        <Reveal immediate>
          <div className="auth-card auth-card--login">
            <h1>
              {resetStep === 1 && 'Forgot Password'}
              {resetStep === 2 && 'Verify OTP'}
              {resetStep === 3 && 'Reset Password'}
            </h1>
            
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}

            {resetStep === 1 && (
              <form className="auth-form" onSubmit={handleRequestReset}>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Enter your email address and we'll send you an OTP to reset your password.
                </p>
                <input
                  placeholder="Email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn primary full" disabled={resetLoading}>
                  {resetLoading ? 'Sending...' : 'Send OTP'}
                </button>
                <button type="button" onClick={backToLogin} className="btn secondary full" style={{ marginTop: '0.5rem' }}>
                  Back to Login
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <>
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  color: '#856404'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                    ⏳ Please Wait for OTP Email 
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    We are sending a 6-digit OTP code to <strong>{resetEmail}</strong>. 
                    Please wait <strong>1-2 minutes</strong> for the email to arrive. 
                    Don't close the page until you receive the email.
                  </p>
                </div>
                <form className="auth-form" onSubmit={handleVerifyOtp}>
                  <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Enter the 6-digit code you receive in your email:
                  </p>
                  <input
                    placeholder="Enter 6-digit OTP"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }}
                  />
                  <button type="submit" className="btn primary full" disabled={resetLoading || otp.length !== 6}>
                    {resetLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" onClick={handleResendOtp} className="btn secondary full" disabled={resetLoading} style={{ marginTop: '0.5rem' }}>
                    Resend OTP
                  </button>
                  <button type="button" onClick={backToLogin} className="btn link" style={{ marginTop: '0.5rem' }}>
                    Back to Login
                  </button>
                </form>
              </>
            )}

            {resetStep === 3 && (
              <form className="auth-form" onSubmit={handleResetPassword}>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Enter your new password below.
                </p>
                <input
                  placeholder="New Password (min. 8 characters)"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <input
                  placeholder="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button type="submit" className="btn primary full" disabled={resetLoading}>
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button type="button" onClick={backToLogin} className="btn link" style={{ marginTop: '0.5rem' }}>
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    )
  }

  // Render Login Form
  return (
    <section className="page auth-page container">
      <Reveal immediate>
        <div className="auth-card auth-card--login">
          <h1>Welcome Back</h1>
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          {success && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn primary full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-links">
            <a href="#" onClick={(e) => { e.preventDefault(); startForgotPassword(); }}>Forgot Password?</a>
            <span> · </span>
            <Link to="/register">New here? Create an account</Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default Login


