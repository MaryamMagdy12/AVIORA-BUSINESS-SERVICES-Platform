import axios from 'axios'

// Create axios instance with base URL
// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Log the API base URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL)
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  // timeout: 10000, // 10 second timeout
})

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// =========================
//  Authentication APIs
// =========================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/register', userData)
    return response.data
  },

  // Verify email with OTP
  verifyEmail: async (email, otp) => {
    const response = await api.post('/verify-email', { email, otp })
    return response.data
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post('/resend-otp', { email })
    return response.data
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/login', { email, password })
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/logout')
    return response.data
  },

  // Forgot Password - Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/forgot-password', { email })
    return response.data
  },

  // Verify password reset OTP
  verifyResetOtp: async (email, otp) => {
    const response = await api.post('/verify-reset-otp', { email, otp })
    return response.data
  },

  // Reset password with new password
  resetPassword: async (email, otp, password, password_confirmation) => {
    const response = await api.post('/reset-password', {
      email,
      otp,
      password,
      password_confirmation,
    })
    return response.data
  },

  // Resend password reset OTP
  resendResetOtp: async (email) => {
    const response = await api.post('/resend-reset-otp', { email })
    return response.data
  },
}

// =========================
//  Profile APIs
// =========================

export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/client/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/client/profile', profileData)
    return response.data
  },
}

// =========================
//  Services APIs
// =========================

export const servicesAPI = {
  // Get all services (public)
  getServices: async () => {
    try {
      const response = await api.get('/services')
      return response.data
    } catch (error) {
      // Enhanced error logging
      const errorDetails = {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
      }
      console.error('Services API Error:', errorDetails)
      
      // If it's a network error, provide helpful message
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        const baseURL = API_BASE_URL.replace('/api', '')
        const networkError = new Error(
          `Cannot connect to server at ${baseURL}. Ensure Laravel is running and CORS allows this frontend origin (check APP_DEBUG or APP_ENV=local).`
        )
        networkError.originalError = error
        networkError.details = errorDetails
        throw networkError
      }
      
      throw error
    }
  },
}

// =========================
//  Appointments APIs
// =========================

export const appointmentsAPI = {
  // Get available appointment slots
  getAvailableSlots: async () => {
    const response = await api.get('/client/appointments/slots')
    return response.data
  },

  // Book an appointment
  bookAppointment: async (slotId, serviceIds) => {
    const response = await api.post('/client/appointments', {
      slot_id: slotId,
      services: serviceIds,
    })
    return response.data
  },

  // Get all appointments for the current user
  getAppointments: async () => {
    const response = await api.get('/client/appointments')
    return response.data
  },

  // Get single appointment
  getAppointment: async (appointmentId) => {
    const response = await api.get(`/client/appointments/${appointmentId}`)
    return response.data
  },
}

// =========================
//  Payment APIs (Public)
// =========================

export const paymentAPI = {
  getPayment: async (transactionId, token) => {
    const response = await api.get(`/payment/${transactionId}`, {
      params: token ? { token } : {},
      headers: token ? { 'X-Payment-Token': token } : {},
    })
    return response.data
  },
}

// =========================
//  Contact APIs (Public)
// =========================

export const contactAPI = {
  // Submit contact message (public - no auth required)
  submitMessage: async (contactData) => {
    const response = await api.post('/contact', contactData)
    return response.data
  },
}

// Export default api instance for custom requests
export default api

