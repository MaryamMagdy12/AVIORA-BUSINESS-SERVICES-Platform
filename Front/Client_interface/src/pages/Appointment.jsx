import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../assets/css/appointment.css'
import Reveal from '../components/Reveal'
import { appointmentsAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Appointment() {
  const [selectedMonth, setSelectedMonth] = useState('Month')
  const [selectedYear, setSelectedYear] = useState('Year')
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState(null)
  const monthDropdownRef = useRef(null)
  const yearDropdownRef = useRef(null)
  const { cartItems, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchAvailableSlots()
  }, [isAuthenticated, navigate])

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await appointmentsAPI.getAvailableSlots()
      // Handle different response formats
      if (Array.isArray(data)) {
        setAvailableSlots(data)
      } else if (data && Array.isArray(data.data)) {
        setAvailableSlots(data.data)
      } else if (data && Array.isArray(data.slots)) {
        setAvailableSlots(data.slots)
      } else {
        console.warn('Unexpected response format:', data)
        setAvailableSlots([])
      }
    } catch (err) {
      console.error('Error fetching slots:', err)
      console.error('Error response:', err.response)
      console.error('Error status:', err.response?.status)
      console.error('Error data:', err.response?.data)
      
      // Show more specific error messages
      if (err.response?.status === 401) {
        setError('Please log in to view available appointments')
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
          navigate('/login')
        }
      } else if (err.response?.status === 403) {
        // Show the actual error message from backend if available
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'You do not have permission to view appointments'
        setError(errorMessage)
        console.error('Permission denied:', err.response?.data)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(`Failed to load appointments: ${err.message}`)
      } else {
        setError('Failed to load available appointments. Please try again later.')
      }
      setAvailableSlots([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Check if a date is in the past or is today with no available slots
  const isPastDate = (day) => {
    if (selectedMonth === 'Month' || selectedYear === 'Year') return false
    
    const monthIndex = months.indexOf(selectedMonth)
    const year = parseInt(selectedYear)
    const date = new Date(year, monthIndex, day)
    const today = new Date()
    
    // Reset time to midnight for accurate date comparison
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    
    // Date is in the past
    if (date < today) {
      return true
    }
    
    // If it's today, check if there are any available slots
    // (backend already filters out past times, so if no slots = all times passed)
    if (date.getTime() === today.getTime()) {
      const slotsForDay = getAvailableSlotsForDate(day)
      return slotsForDay.length === 0 // No available slots means all times have passed
    }
    
    return false
  }

  // Generate calendar days based on selected month and year
  const getCalendarDays = () => {
    if (selectedMonth === 'Month' || selectedYear === 'Year') {
      return []
    }
    
    const monthIndex = months.indexOf(selectedMonth)
    const year = parseInt(selectedYear)
    const firstDay = new Date(year, monthIndex, 1).getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    
    const calendarDays = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day)
    }
    
    return calendarDays
  }

  // Get available slots for selected date
  const getAvailableSlotsForDate = (day) => {
    if (selectedMonth === 'Month' || selectedYear === 'Year') return []
    
    const monthIndex = months.indexOf(selectedMonth)
    const year = parseInt(selectedYear)
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return availableSlots.filter(slot => {
      const slotDate = slot.date.split(' ')[0] // Handle date format
      return slotDate === dateStr && slot.status === 'available'
    })
  }

  // Check if a time slot is in the past (for today's date)
  const isPastTime = (slot) => {
    if (!selectedDay || selectedMonth === 'Month' || selectedYear === 'Year') return false
    
    const monthIndex = months.indexOf(selectedMonth)
    const year = parseInt(selectedYear)
    const slotDate = new Date(year, monthIndex, selectedDay)
    const today = new Date()
    
    // Reset dates to midnight for date comparison
    const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // If the slot is not today, it's not a past time
    if (slotDateOnly.getTime() !== todayOnly.getTime()) {
      return false
    }
    
    // If it's today, check if the time has passed
    const [hours, minutes] = slot.time.split(':')
    const slotDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
    
    return slotDateTime < today
  }

  // Get available times for selected day (filter out past times for today)
  const getAvailableTimes = () => {
    if (!selectedDay) return []
    const slots = getAvailableSlotsForDate(selectedDay)
    
    // Filter out past times (only applies to today's date)
    // Backend already filters, but this adds extra safety for frontend
    return slots
      .filter(slot => !isPastTime(slot))
      .map(slot => ({
        id: slot.id,
        time: slot.time,
        formattedTime: formatTime(slot.time),
      }))
  }

  const formatTime = (timeStr) => {
    // Convert 24h format to 12h format
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }
  
  const calendarDays = getCalendarDays()
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const availableTimes = getAvailableTimes()

  const handleMonthSelect = (month) => {
    setSelectedMonth(month)
    setShowMonthDropdown(false)
    setSelectedDay(null) // Clear selected day when month changes
  }

  const handleYearSelect = (year) => {
    setSelectedYear(year)
    setShowYearDropdown(false)
    setSelectedDay(null) // Clear selected day when year changes
  }

  const handleNextMonth = () => {
    if (selectedMonth !== 'Month') {
      const currentIndex = months.indexOf(selectedMonth)
      const nextIndex = (currentIndex + 1) % months.length
      setSelectedMonth(months[nextIndex])
      setSelectedDay(null) // Clear selected day when month changes
    }
  }

  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot.formattedTime)
    setSelectedSlotId(timeSlot.id)
  }

  const handleConfirm = async () => {
    if (!selectedSlotId || cartItems.length === 0) {
      alert('Please select a date, time, and ensure you have services in your cart')
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setBooking(true)
    setError('')

    try {
      const serviceIds = cartItems.map(item => item.id)
      await appointmentsAPI.bookAppointment(selectedSlotId, serviceIds)

      // Set appointment details for the success modal
      const appointmentDate = `${selectedDay} ${selectedMonth} ${selectedYear}`
      setAppointmentDetails({
        date: appointmentDate,
        time: selectedTime,
        servicesCount: cartItems.length,
        services: cartItems // Include services array with names
      })
      
      setShowSuccessModal(true)
      clearCart()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment')
      console.error('Error booking appointment:', err)
    } finally {
      setBooking(false)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false)
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="appointment-page">
      {/* Background wave pattern */}
      <div className="appointment-background"></div>
      
      <div className="container appointment-container">
        {/* Header Section */}
        <Reveal>
          <div className="appointment-header">
            <h1 className="appointment-title">Book Your Consultation</h1>
            <p className="appointment-description">
              Select a date and time that works for you—we&apos;ll walk through the services in your shortlist.
            </p>
          </div>
        </Reveal>

        {/* Search/Filter Section */}
        <Reveal delay={0.1}>
          {/* <div className="appointment-filters">
            <div className="filter-input-wrapper">
              <select className="filter-select">
                <option>Select Category</option>
                <option>Finance</option>
                <option>HR</option>
                <option>Business Advisory</option>
                <option>Creative</option>
              </select>
            </div>
            <button className="filter-btn">Contact</button>
          </div> */}
        </Reveal>

        {/* Appointment Selection Card */}
        <Reveal delay={0.2}>
          <div className="appointment-card">
            {/* Month and Year Selection */}
            <div className="date-selector">
              <div className="month-year-selector">
                <div className="dropdown-wrapper" ref={monthDropdownRef}>
                  <button 
                    className="dropdown-btn month-btn"
                    onClick={() => {
                      setShowMonthDropdown(!showMonthDropdown)
                      setShowYearDropdown(false)
                    }}
                  >
                    {selectedMonth}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {showMonthDropdown && (
                    <div className="dropdown-menu">
                      {months.map((month) => (
                        <button
                          key={month}
                          className="dropdown-item"
                          onClick={() => handleMonthSelect(month)}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="nav-arrow-btn" onClick={handleNextMonth}>→</button>
                <div className="dropdown-wrapper" ref={yearDropdownRef}>
                  <button 
                    className="dropdown-btn year-btn"
                    onClick={() => {
                      setShowYearDropdown(!showYearDropdown)
                      setShowMonthDropdown(false)
                    }}
                  >
                    {selectedYear}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {showYearDropdown && (
                    <div className="dropdown-menu">
                      {years.map((year) => (
                        <button
                          key={year}
                          className="dropdown-item"
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pick Day Section */}
            <div className="selection-section">
              <h3 className="section-title">Choose a Date</h3>
              <div className="calendar-container">
                {/* Week day headers */}
                <div className="calendar-weekdays">
                  {weekDays.map((day) => (
                    <div key={day} className="calendar-weekday">{day}</div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="calendar-grid">
                  {loading ? (
                    <div className="calendar-placeholder">Checking open slots...</div>
                  ) : calendarDays.length > 0 ? (
                    calendarDays.map((day, index) => {
                      if (day === null) {
                        return <div key={`empty-${index}`} className="calendar-day empty"></div>
                      }
                      
                      // Check if date is in the past - hide it completely
                      const isPast = isPastDate(day)
                      if (isPast) {
                        // Don't render past dates at all - return empty div
                        return <div key={`past-${day}-${index}`} className="calendar-day past hidden"></div>
                      }
                      
                      const slotsForDay = getAvailableSlotsForDate(day)
                      const isUnavailable = slotsForDay.length === 0
                      const isSelected = selectedDay === day
                      
                      return (
                        <button
                          key={day}
                          className={`calendar-day ${isSelected ? 'selected' : ''} ${isUnavailable ? 'unavailable' : ''}`}
                          onClick={() => !isUnavailable && setSelectedDay(day)}
                          disabled={isUnavailable}
                        >
                          <span className="calendar-day-number">{day}</span>
                          {isUnavailable && (
                            <span className="unavailable-badge">UnAvailable</span>
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <div className="calendar-placeholder">
                      Select a month and year to see available days
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pick Time Section - Only show if day is selected */}
            {selectedDay && (
              <div className="selection-section">
                <h3 className="section-title">Choose a Time</h3>
                {availableTimes.length === 0 ? (
                  <p style={{ color: '#666', padding: '1rem' }}>No open slots on this date—try another day.</p>
                ) : (
                  <div className="time-grid">
                    {availableTimes.map((timeSlot) => (
                      <button
                        key={timeSlot.id}
                        className={`time-btn ${selectedTime === timeSlot.formattedTime ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(timeSlot)}
                      >
                        {timeSlot.formattedTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>{error}</div>
            )}

            {/* Confirm Button - Only show if day and time are selected */}
            {selectedDay && selectedTime && cartItems.length > 0 && (
              <button className="confirm-btn" onClick={handleConfirm} disabled={booking}>
                {booking ? 'Booking...' : 'Confirm Appointment'}
              </button>
            )}

            {cartItems.length === 0 && (
              <div style={{ color: '#666', padding: '1rem', textAlign: 'center' }}>
                Add services to your shortlist before scheduling a consultation.
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* Success Modal */}
      {showSuccessModal && appointmentDetails && (
        <div className="appointment-success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="appointment-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="appointment-success-modal-content">
              <div className="appointment-success-icon">✓</div>
              <h3 className="appointment-success-title">You&apos;re All Set</h3>
              <div className="appointment-success-details">
                <div className="appointment-detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{appointmentDetails.date}</span>
                </div>
                <div className="appointment-detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{appointmentDetails.time}</span>
                </div>
                <div className="appointment-detail-item">
                  <span className="detail-label">Services:</span>
                  <span className="detail-value">
                    {appointmentDetails.services && appointmentDetails.services.length > 0
                      ? appointmentDetails.services.map(service => service.name).join(', ')
                      : 'No services selected'}
                  </span>
                </div>
              </div>
              <p className="appointment-success-message">
                Your consultation is confirmed. Watch your inbox for a confirmation email with the details.
              </p>
              <div className="appointment-success-actions">
                <button className="btn primary" onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/service')
                }}>
                 Browse More Services
                </button>
                <button className="btn secondary" onClick={() => setShowSuccessModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointment

