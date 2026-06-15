import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../assets/css/service.css'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, loading])

  const handleCloseModal = () => {
    setShowLoginModal(false)
    navigate(-1) // Go back to previous page
  }

  const handleGoToLogin = () => {
    setShowLoginModal(false)
    navigate('/login', { state: { from: location.pathname } })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <>
        {showLoginModal && (
          <div className="login-modal-overlay" onClick={handleCloseModal}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <div className="login-modal-content">
                <h3 className="login-modal-title">Login Required</h3>
                <p className="login-modal-message">
                  You must be logged in to access this page. Please login first to continue.
                </p>
                <div className="login-modal-actions">
                  <button className="btn secondary" onClick={handleCloseModal}>
                    Go Back
                  </button>
                  <button className="btn primary" onClick={handleGoToLogin}>
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return children
}

export default ProtectedRoute

