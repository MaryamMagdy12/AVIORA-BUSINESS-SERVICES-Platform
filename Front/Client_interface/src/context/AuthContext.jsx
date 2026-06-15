import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password)
      const { token, user: userData } = data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true, data }
    } catch (error) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        return {
          success: false,
          error: `Cannot connect to server. Please ensure Laravel backend is running on ${apiBaseUrl}.`,
          networkError: true,
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed',
        requiresVerification: error.response?.data?.requires_verification || false,
      }
    }
  }

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData)
      return { success: true, data }
    } catch (error) {
      // Handle network errors
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        const baseURL = apiBaseUrl.replace('/api', '')
        return {
          success: false,
          error: `Cannot connect to server. Please ensure Laravel backend is running on ${baseURL}. Check your network connection and try again.`,
          networkError: true,
        }
      }
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors || {}
        const errorMessages = Object.values(errors).flat()
        return {
          success: false,
          error: errorMessages.join(', ') || error.response?.data?.message || 'Validation failed',
          errors: errors,
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed',
      }
    }
  }

  const verifyEmail = async (email, otp) => {
    try {
      const data = await authAPI.verifyEmail(email, otp)
      const { token, user: userData } = data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Verification failed',
      }
    }
  }

  const resendOtp = async (email) => {
    try {
      const data = await authAPI.resendOtp(email)
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to resend OTP',
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    resendOtp,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

