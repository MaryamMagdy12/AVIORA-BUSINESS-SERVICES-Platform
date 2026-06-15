import { useState, useEffect } from 'react'
import '../assets/css/profile.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Reveal from '../components/Reveal'
import { profileAPI, appointmentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { validateForm, validationRules } from '../utils/validation'

function Profile() {
  const [activeTab, setActiveTab] = useState('client-details')
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company_name: '',
  })
  const [saving, setSaving] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const { user } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (activeTab === 'order-summary') {
      fetchAppointments()
    }
  }, [activeTab])

  const fetchProfile = async () => {
    try {
      const data = await profileAPI.getProfile()
      setProfile(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        company_name: data.company_name || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true)
      const response = await appointmentsAPI.getAppointments()
      
      let appointmentsData = []
      
      if (Array.isArray(response)) {
        appointmentsData = response
      } else if (response && Array.isArray(response.data)) {
        appointmentsData = response.data
      } else if (response && response.appointments && Array.isArray(response.appointments)) {
        appointmentsData = response.appointments
      } else if (response && response.data && response.data.appointments && Array.isArray(response.data.appointments)) {
        appointmentsData = response.data.appointments
      } else if (response && response.data && Array.isArray(response.data)) {
        appointmentsData = response.data
      } else {
        console.warn('Unexpected response format:', response)
        appointmentsData = []
      }
      
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      setAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }

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

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setFieldErrors({})
    
    // Frontend validation using validation utility
    const { errors, hasErrors } = validateForm(formData, validationRules.profile)
    
    if (hasErrors) {
      setFieldErrors(errors)
      const firstError = Object.values(errors)[0]
      setError(firstError)
      setSaving(false)
      return
    }
    
    try {
      const data = await profileAPI.updateProfile(formData)
      setProfile(data)
      setEditing(false)
      setError('')
      setFieldErrors({})
    } catch (error) {
      console.error('Error updating profile:', error)
      
      // Handle validation errors from backend
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {}
        setFieldErrors(backendErrors)
        const firstError = Object.values(backendErrors)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Validation failed. Please check the fields below.')
      } else {
        setError(error.response?.data?.message || 'Failed to update profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="page profile-page container">
        <div>Loading profile...</div>
      </section>
    )
  }

  return (
    <section className="page profile-page">
      <div className="profile-page__title">
        <h1>{activeTab === 'client-details' ? 'Your Account' : 'Past Consultations'}</h1>
        <span />
      </div>
      <div className="tabs">
          <button 
            className={`tab ${activeTab === 'client-details' ? 'active' : ''}`}
            onClick={() => setActiveTab('client-details')}
          >
            Your Account
          </button>
          <button 
            className={`tab ${activeTab === 'order-summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('order-summary')}
          >
            Past Consultations
          </button>
        </div>
      <div className="profile-holder">
{activeTab === 'client-details' ? (
        <Reveal><div className="client-details-card">
          <div className="client-header">
            <div className="client-info">
              <div className="client-avatar-wrapper">
                <FontAwesomeIcon icon="user" className="client-avatar" />
              </div>
              <div className="client-name-id">
                <h2 className="client-title">Account Information</h2>
                <p className="client-name">{profile?.name || 'N/A'}</p>
                {/* <p className="client-id">#{profile?.id || 'N/A'}</p> */}
              </div>
            </div>
            {!editing ? (
              <button className="btn primary edit-btn" onClick={() => setEditing(true)}>
                Edit Details
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn" onClick={() => { setEditing(false); fetchProfile(); setError(''); setFieldErrors({}); }} disabled={saving}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          {error && (
            <div style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          <div className="client-fields">
            <div className="field-row">
              <div className="field-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Full Name"
                  required
                />
                {fieldErrors.name && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.name) ? fieldErrors.name[0] : fieldErrors.name}
                  </span>
                )}
              </div>
              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  placeholder="Email"
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Phone (numbers only)"
                />
                {fieldErrors.phone && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.phone) ? fieldErrors.phone[0] : fieldErrors.phone}
                  </span>
                )}
              </div>
              <div className="field-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Address"
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Company Name"
                  required
                />
                {fieldErrors.company_name && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.company_name) ? fieldErrors.company_name[0] : fieldErrors.company_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="order-summary-container">
           
            {loadingAppointments ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Loading appointments...
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-appointments">
                <p>No consultations booked yet.</p>
                <p style={{ fontSize: '14px', marginTop: '8px', color: '#999' }}>
                  Book an appointment to see your orders here.
                </p>
              </div>
            ) : (
              <div className="appointments-list">
                {appointments.map((appointment) => {
                  // Handle different property names for slot (Laravel may return appointment_slot or appointmentSlot)
                  const slot = appointment.appointment_slot || appointment.appointmentSlot || appointment.slot;
                  
                  return (
                  <div key={appointment.id} className="appointment-card-summary">
                    <div className="appointment-header-summary">
                      <div className="appointment-id-section">
                        <span className="appointment-label">Appointment ID:</span>
                        <span className="appointment-id-value">#{appointment.id}</span>
                      </div>
                      <div className={`status-badge status-${appointment.status?.toLowerCase() || 'pending'}`}>
                        {appointment.status || 'Pending'}
                      </div>
                    </div>
                    
                    <div className="appointment-details">
                      <div className="detail-row">
                        <span className="detail-label">Date & Time:</span>
                        <span className="detail-value">
                          {slot?.date 
                            ? new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'N/A'
                          }
                          {slot?.time && ` at ${slot.time}`}
                        </span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Services:</span>
                        <div className="services-list">
                          {appointment.services && appointment.services.length > 0 ? (
                            appointment.services.map((service, index) => (
                              <span key={service.id || index} className="service-tag">
                                {service.name || service}
                              </span>
                            ))
                          ) : (
                            <span className="detail-value">No services</span>
                          )}
                        </div>
                      </div>

                      {appointment.created_at && (
                        <div className="detail-row">
                          <span className="detail-label">Booked On:</span>
                          <span className="detail-value">
                            {new Date(appointment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>
      )}
</div>
    </section>
  )
}

export default Profile


