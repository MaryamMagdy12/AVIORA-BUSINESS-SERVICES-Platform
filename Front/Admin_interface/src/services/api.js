import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', 
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// =========================
// Authentication API (Admin Only)
// =========================

export const authAPI = {
  login: (email, password) => 
    api.post('/login', { email, password }),
  
  logout: () => 
    api.post('/logout'),
};

// =========================
// Admin API
// =========================

export const adminAPI = {
  // Services
  getServices: () => 
    api.get('/admin/services'),
  
  createService: (data) => 
    api.post('/admin/services', data),
  
  updateService: (id, data) => 
    api.put(`/admin/services/${id}`, data),
  
  deleteService: (id) => 
    api.delete(`/admin/services/${id}`),
  
  getService: (id) => 
    api.get(`/admin/services/${id}`),

  // Subcategories
  getSubcategories: () => 
    api.get('/admin/subcategories'),
  
  createSubcategory: (data) => 
    api.post('/admin/subcategories', data),
  
  updateSubcategory: (id, data) => 
    api.put(`/admin/subcategories/${id}`, data),
  
  deleteSubcategory: (id) => 
    api.delete(`/admin/subcategories/${id}`),

  // Clients
  getClients: (params = {}) => 
    api.get('/admin/clients', { params }),
  
  getClient: (id) => 
    api.get(`/admin/clients/${id}`),
  
  getClientAppointments: (clientId) => 
    api.get(`/admin/clients/${clientId}/appointments`),
  
  deleteClient: (id) => 
    api.delete(`/admin/clients/${id}`),

  // Appointment Slots
  getAppointmentSlots: (params = {}) => 
    api.get('/admin/appointments/slots', { params }),
  
  createAppointmentSlot: (data) => 
    api.post('/admin/appointments/slots', data),
  
  updateAppointmentSlot: (id, data) => 
    api.put(`/admin/appointments/slots/${id}`, data),
  
  deleteAppointmentSlot: (id) => 
    api.delete(`/admin/appointments/slots/${id}`),
  
  getAppointmentSlot: (id) => 
    api.get(`/admin/appointments/slots/${id}`),

  sendAppointmentEmail: (appointmentId, data) => 
    api.post(`/admin/appointments/${appointmentId}/send-email`, data),

  sendMeetingLink: (slotId, meetingLink) => 
    api.post(`/admin/appointments/slots/${slotId}/send-meeting-link`, { meeting_link: meetingLink }),

  cancelAppointment: (slotId) => 
    api.post(`/admin/appointments/slots/${slotId}/cancel`),

  // Payments
  getPayments: (params = {}) => 
    api.get('/admin/payments', { params }),
  
  createPayment: (data) => 
    api.post('/admin/payments', data),
  
  updatePayment: (id, data) => 
    api.put(`/admin/payments/${id}`, data),

  confirmPayment: (id) =>
    api.post(`/admin/payments/${id}/confirm`),
  
  deletePayment: (id) => 
    api.delete(`/admin/payments/${id}`),
  
  getPayment: (id) => 
    api.get(`/admin/payments/${id}`),
  
  getAppointmentServices: (appointmentId) => 
    api.get(`/admin/payments/appointment/${appointmentId}/services`),

  // Admins
  getAdmins: () => 
    api.get('/admin/admins'),
  
  createAdmin: (data) => 
    api.post('/admin/admins', data),
  
  updateAdmin: (id, data) => 
    api.put(`/admin/admins/${id}`, data),
  
  deleteAdmin: (id) => 
    api.delete(`/admin/admins/${id}`),
  
  getAdmin: (id) => 
    api.get(`/admin/admins/${id}`),

  // Contact Messages
  getContacts: (params = {}) => 
    api.get('/admin/contacts', { params }),
  
  getContact: (id) => 
    api.get(`/admin/contacts/${id}`),
  
  replyToContact: (id, data) => 
    api.post(`/admin/contacts/${id}/reply`, data),
  
  updateContact: (id, data) => 
    api.put(`/admin/contacts/${id}`, data),
  
  deleteContact: (id) => 
    api.delete(`/admin/contacts/${id}`),
};

// Note: Client API is not needed in admin interface
// Client functionality should be in the separate client React app

export default api;

