import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import '../assets/css/contact.css'
import Reveal from '../components/Reveal'
import { contactAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { validateForm, validationRules } from '../utils/validation'

// Country codes list
const countries = [
  { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', name: 'Albania', flag: '🇦🇱' },
  { code: '+213', name: 'Algeria', flag: '🇩🇿' },
  { code: '+376', name: 'Andorra', flag: '🇦🇩' },
  { code: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: '+1264', name: 'Anguilla', flag: '🇦🇮' },
  { code: '+1268', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+374', name: 'Armenia', flag: '🇦🇲' },
  { code: '+297', name: 'Aruba', flag: '🇦🇼' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+1242', name: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1246', name: 'Barbados', flag: '🇧🇧' },
  { code: '+375', name: 'Belarus', flag: '🇧🇾' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: '+501', name: 'Belize', flag: '🇧🇿' },
  { code: '+229', name: 'Benin', flag: '🇧🇯' },
  { code: '+1441', name: 'Bermuda', flag: '🇧🇲' },
  { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+673', name: 'Brunei', flag: '🇧🇳' },
  { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
  { code: '+1345', name: 'Cayman Islands', flag: '🇰🇾' },
  { code: '+236', name: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', name: 'Chad', flag: '🇹🇩' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+269', name: 'Comoros', flag: '🇰🇲' },
  { code: '+242', name: 'Congo', flag: '🇨🇬' },
  { code: '+243', name: 'Congo, Democratic Republic of the', flag: '🇨🇩' },
  { code: '+682', name: 'Cook Islands', flag: '🇨🇰' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', name: 'Croatia', flag: '🇭🇷' },
  { code: '+53', name: 'Cuba', flag: '🇨🇺' },
  { code: '+357', name: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+1767', name: 'Dominica', flag: '🇩🇲' },
  { code: '+1809', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', name: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', name: 'Estonia', flag: '🇪🇪' },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
  { code: '+500', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: '+298', name: 'Faroe Islands', flag: '🇫🇴' },
  { code: '+679', name: 'Fiji', flag: '🇫🇯' },
  { code: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+594', name: 'French Guiana', flag: '🇬🇫' },
  { code: '+689', name: 'French Polynesia', flag: '🇵🇫' },
  { code: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: '+220', name: 'Gambia', flag: '🇬🇲' },
  { code: '+995', name: 'Georgia', flag: '🇬🇪' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+350', name: 'Gibraltar', flag: '🇬🇮' },
  { code: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: '+299', name: 'Greenland', flag: '🇬🇱' },
  { code: '+1473', name: 'Grenada', flag: '🇬🇩' },
  { code: '+590', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: '+1671', name: 'Guam', flag: '🇬🇺' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', name: 'Guinea', flag: '🇬🇳' },
  { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', name: 'Guyana', flag: '🇬🇾' },
  { code: '+509', name: 'Haiti', flag: '🇭🇹' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: '+354', name: 'Iceland', flag: '🇮🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },

  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+1876', name: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴' },
  { code: '+7', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+686', name: 'Kiribati', flag: '🇰🇮' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', name: 'Laos', flag: '🇱🇦' },
  { code: '+371', name: 'Latvia', flag: '🇱🇻' },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', name: 'Liberia', flag: '🇱🇷' },
  { code: '+218', name: 'Libya', flag: '🇱🇾' },
  { code: '+423', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', name: 'Macau', flag: '🇲🇴' },
  { code: '+389', name: 'Macedonia', flag: '🇲🇰' },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', name: 'Maldives', flag: '🇲🇻' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+356', name: 'Malta', flag: '🇲🇹' },
  { code: '+692', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+596', name: 'Martinique', flag: '🇲🇶' },
  { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
  { code: '+262', name: 'Mayotte', flag: '🇾🇹' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+691', name: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', name: 'Moldova', flag: '🇲🇩' },
  { code: '+377', name: 'Monaco', flag: '🇲🇨' },
  { code: '+976', name: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', name: 'Montenegro', flag: '🇲🇪' },
  { code: '+1664', name: 'Montserrat', flag: '🇲🇸' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: '+674', name: 'Nauru', flag: '🇳🇷' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+599', name: 'Netherlands Antilles', flag: '🇧🇶' },
  { code: '+687', name: 'New Caledonia', flag: '🇳🇨' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+683', name: 'Niue', flag: '🇳🇺' },
  { code: '+850', name: 'North Korea', flag: '🇰🇵' },
  { code: '+1670', name: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+680', name: 'Palau', flag: '🇵🇼' },
  { code: '+970', name: 'Palestine', flag: '🇵🇸' },
  { code: '+507', name: 'Panama', flag: '🇵🇦' },
  { code: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', name: 'Peru', flag: '🇵🇪' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+1787', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+262', name: 'Reunion', flag: '🇷🇪' },
  { code: '+40', name: 'Romania', flag: '🇷🇴' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+290', name: 'Saint Helena', flag: '🇸🇭' },
  { code: '+1869', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: '+1758', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: '+508', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: '+1784', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: '+685', name: 'Samoa', flag: '🇼🇸' },
  { code: '+378', name: 'San Marino', flag: '🇸🇲' },
  { code: '+239', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: '+381', name: 'Serbia', flag: '🇷🇸' },
  { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', name: 'Slovenia', flag: '🇸🇮' },
  { code: '+677', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+252', name: 'Somalia', flag: '🇸🇴' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', name: 'Sudan', flag: '🇸🇩' },
  { code: '+597', name: 'Suriname', flag: '🇸🇷' },
  { code: '+268', name: 'Swaziland', flag: '🇸🇿' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', name: 'Syria', flag: '🇸🇾' },
  { code: '+886', name: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', name: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+670', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+690', name: 'Tokelau', flag: '🇹🇰' },
  { code: '+676', name: 'Tonga', flag: '🇹🇴' },
  { code: '+1868', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+993', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+1649', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: '+688', name: 'Tuvalu', flag: '🇹🇻' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', name: 'Vanuatu', flag: '🇻🇺' },
  { code: '+379', name: 'Vatican City', flag: '🇻🇦' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+1284', name: 'Virgin Islands, British', flag: '🇻🇬' },
  { code: '+1340', name: 'Virgin Islands, U.S.', flag: '🇻🇮' },
  { code: '+681', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: '+967', name: 'Yemen', flag: '🇾🇪' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' }
]

function Contact() {
  const { user } = useAuth()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const countryDropdownRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    countryCode: '+20', // Default to Egypt
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    subject: '',
    message: ''
  })

  // Handle scrolling to hash fragment when component mounts or hash changes
  useEffect(() => {
    if (location.hash) {
      // Wait for the page to render, then scroll
      setTimeout(() => {
        const element = document.querySelector(location.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [location.hash])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Special handling for phone number - allow only digits (no + sign)
    if (name === 'phone') {
      // Remove all non-numeric characters (including +)
      const cleanedValue = value.replace(/\D/g, '')
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})
    setSuccess(false)

    // Frontend validation
    const { errors, hasErrors } = validateForm(formData, validationRules.contact)
    
    if (hasErrors) {
      setFieldErrors(errors)
      const firstError = Object.values(errors)[0]
      setError(firstError)
      setLoading(false)
      return
    }

    try {
      // Format phone: combine country code (with +) + phone number (digits only)
      let phoneNumber = '';
      if (formData.countryCode && formData.phone) {
        phoneNumber = `${formData.countryCode}${formData.phone}`;
      } else if (formData.phone) {
        phoneNumber = formData.phone;
      }
      
      await contactAPI.submitMessage({
        name: formData.name,
        email: formData.email,
        phone: phoneNumber,
        company_name: formData.company_name,
        subject: formData.subject || null,
        message: formData.message
      })

      setSuccess(true)
      setFieldErrors({})
      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        countryCode: '+20',
        phone: user?.phone || '',
        company_name: user?.company_name || '',
        subject: '',
        message: ''
      })
    } catch (err) {
      // Handle backend validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors)
        const firstError = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError(err.response?.data?.message || 'Failed to send message. Please try again.')
      }
      console.error('Error submitting contact form:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      countryCode: '+20',
      phone: user?.phone || '',
      company_name: user?.company_name || '',
      subject: '',
      message: ''
    })
    setError('')
    setFieldErrors({})
    setSuccess(false)
  }

  const handleCountrySelect = (code) => {
    setFormData(prev => ({
      ...prev,
      countryCode: code
    }))
    setIsCountryDropdownOpen(false)
  }

  const getSelectedCountry = () => {
    return countries.find(c => c.code === formData.countryCode) || countries.find(c => c.code === '+20')
  }

  const handleCloseSuccessModal = () => {
    setSuccess(false)
  }

  return (
    <div className="contact-page">
      {/* Background wave pattern */}
      <div className="contact-background"></div>
      
      <div className="container contact-container " id="contact-start">
        <Reveal style={{display: 'flex'}}>
          <div className="contact-form-wrapper">
            <h1 style={{textAlign: 'center'}}>Let&apos;s Talk</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
              Share your goals or questions—we&apos;ll review your message and respond as soon as we can.
            </p>
            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '1rem',
                borderRadius: '5px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={fieldErrors.name ? 'error' : ''}
                />
                {fieldErrors.name && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.name) ? fieldErrors.name[0] : fieldErrors.name}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={fieldErrors.email ? 'error' : ''}
                />
                {fieldErrors.email && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div style={{ display: 'flex', gap: '10px' }} className='country-code-select'>
                  <div ref={countryDropdownRef} style={{ position: 'relative', minWidth: '200px' }}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'left'
                      }}
                    >
                      <span>{getSelectedCountry().flag} {getSelectedCountry().code} {getSelectedCountry().name}</span>
                      <span style={{ marginLeft: '10px' }}>{isCountryDropdownOpen ? '▲' : '▼'}</span>
                    </button>
                    {isCountryDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          marginTop: '4px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {countries.map((country) => (
                          <div
                            key={country.code}
                            onClick={() => handleCountrySelect(country.code)}
                            style={{
                              padding: '0.75rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: formData.countryCode === country.code ? '#f0f8ff' : 'white'
                            }}
                            onMouseEnter={(e) => {
                              if (formData.countryCode !== country.code) {
                                e.currentTarget.style.backgroundColor = '#f5f5f5'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (formData.countryCode !== country.code) {
                                e.currentTarget.style.backgroundColor = 'white'
                              }
                            }}
                          >
                            <span>{country.flag} {country.code} {country.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    style={{ flex: 1 }}
                    className={fieldErrors.phone ? 'error' : ''}
                  />
                </div>
                {fieldErrors.phone && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.phone) ? fieldErrors.phone[0] : fieldErrors.phone}
                  </span>
                )}
              </div>

              {/* Company Name */}
              <div className="form-group">
                <label htmlFor="company_name">Company Name</label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className={fieldErrors.company_name ? 'error' : ''}
                />
                {fieldErrors.company_name && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.company_name) ? fieldErrors.company_name[0] : fieldErrors.company_name}
                  </span>
                )}
              </div>
              {/* Subject */}
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need help with..."
                  rows="6"
                  required
                  minLength={10}
                  className={fieldErrors.message ? 'error' : ''}
                />
                {fieldErrors.message && (
                  <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {Array.isArray(fieldErrors.message) ? fieldErrors.message[0] : fieldErrors.message}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                <button type="button" className="btn btn-outline" onClick={handleClear} disabled={loading}>
                  Clear/Cancel
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="contact-success-modal-overlay" onClick={handleCloseSuccessModal}>
          <div className="contact-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contact-success-modal-content">
              <div className="contact-success-icon">✓</div>
              <h3 className="contact-success-title">We Got Your Message</h3>
              <p className="contact-success-message">
                Thanks for reaching out. A member of the Aviora team will follow up with you shortly.
              </p>
              <div className="contact-success-actions">
                <button className="btn primary" onClick={handleCloseSuccessModal}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contact

