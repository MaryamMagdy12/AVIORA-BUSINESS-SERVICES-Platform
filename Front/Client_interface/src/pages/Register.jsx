import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../assets/css/auth.css'
import Reveal from '../components/Reveal'
import { useAuth } from '../context/AuthContext'
import { validateForm, validationRules } from '../utils/validation'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    company_name: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const { register, verifyEmail, resendOtp } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Special handling for phone number - only numbers (no characters allowed)
    if (e.target.name === 'phone') {
      // Remove all non-numeric characters (only keep digits)
      value = value.replace(/\D/g, '');
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Frontend validation
    const { errors, hasErrors } = validateForm(formData, validationRules.register)
    
    if (hasErrors) {
      setFieldErrors(errors)
      // Show first error as general error
      const firstError = Object.values(errors)[0]
      setError(firstError)
      return
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match')
      setFieldErrors({ password_confirmation: 'Passwords do not match' })
      return
    }

    setLoading(true)
    const result = await register(formData)

    if (result.success) {
      setShowOtpForm(true)
    } else {
      // Handle backend validation errors
      if (result.errors) {
        setFieldErrors(result.errors)
        const firstError = Object.values(result.errors)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        const errorMsg = result.error || 'Registration failed'
        setError(errorMsg)
      }
      console.error('Registration error:', result)
    }

    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)

    const result = await verifyEmail(formData.email, otp)

    if (result.success) {
      navigate('/home')
    } else {
      setOtpError(result.error || 'Verification failed')
    }

    setOtpLoading(false)
  }

  const handleResendOtp = async () => {
    setOtpError('')
    const result = await resendOtp(formData.email)
    if (result.success) {
      alert('OTP resent successfully! Check your email.')
    } else {
      setOtpError(result.error || 'Failed to resend OTP')
    }
  }

  if (showOtpForm) {
    return (
      <section className="page auth-page container">
        <Reveal immediate>
          <div className="auth-card auth-card--register">
            <h1>Confirm Your Email</h1>
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
                We are sending a 6-digit OTP code to <strong>{formData.email}</strong>. 
                Please wait <strong>1-2 minutes</strong> for the email to arrive. 
                Don't forget to check your spam folder!
              </p>
            </div>
            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              Enter the 6-digit code you receive in your email:
            </p>
            {otpError && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                {otpError}
              </div>
            )}
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <input
                placeholder="Enter 6-digit OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
              <button type="submit" className="btn primary full" disabled={otpLoading}>
                {otpLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
            <div className="auth-links">
              <button type="button" onClick={handleResendOtp} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
                Resend OTP
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    )
  }

  return (
    <section className="page auth-page container">
      <Reveal immediate>
        <div className="auth-card auth-card--register">
          <h1>Join Aviora</h1>
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <input
                placeholder="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={fieldErrors.name ? 'error' : ''}
              />
              {fieldErrors.name && (
                <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>
            <div>
              <input
                placeholder="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && (
                <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>
            <div>
              <input
                placeholder="Phone (numbers only)"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={fieldErrors.phone ? 'error' : ''}
              />
              {fieldErrors.phone && (
                <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {fieldErrors.phone}
                </span>
              )}
            </div>
            <div>
              <input
                placeholder="Address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                placeholder="Company Name"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className={fieldErrors.company_name ? 'error' : ''}
              />
              {fieldErrors.company_name && (
                <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {fieldErrors.company_name}
                </span>
              )}
            </div>
            <div>
              <input
                placeholder="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={fieldErrors.password ? 'error' : ''}
              />
              {fieldErrors.password && (
                <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {fieldErrors.password}
                </span>
              )}
            </div>
            <div>
              <input
                placeholder="Confirm Password"
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                required
                className={fieldErrors.password_confirmation ? 'error' : ''}
              />
              {fieldErrors.password_confirmation && (
                <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {fieldErrors.password_confirmation}
                </span>
              )}
            </div>
            <button type="submit" className="btn primary full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-links">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default Register


