import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShieldHalved,
  faBullseye,
  faChartColumn,
  faLock,
} from '@fortawesome/free-solid-svg-icons'
import '../assets/css/service.css'
import { heroServiceDashboard } from '../assets/media'
import { getServiceMeta } from '../utils/serviceAssets'
import { sanitizeBrandText } from '../utils/sanitizeBrandText'
import Reveal, { RevealStagger, RevealItem } from '../components/Reveal'
import { servicesAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'


const getServiceBackground = (name = '') => {
  const key = name.toLowerCase()
  const match = Object.keys(serviceBackgrounds).find((k) => key.includes(k))
  return match ? serviceBackgrounds[match] : bgAccounting
}

const stats = [
  { icon: '👥', value: '100+', label: 'Skilled Professionals' },
  { icon: '🌍', value: '30+', label: 'Markets Supported' },
  { icon: '🛡️', value: '98%', label: 'Clients Who Stay' },
  { icon: '📈', value: '10+', label: 'Years of Delivery' },
]

const heroFeatures = [
  {
    icon: faShieldHalved,
    title: 'Regulation-Aware Delivery',
    text: 'Work aligned with IFRS, SOCPA, Zakat, VAT, and the standards your business must meet.',
  },
  {
    icon: faBullseye,
    title: 'From Plan to Execution',
    text: 'Structured workflows that carry strategy through to finished deliverables.',
  },
  {
    icon: faChartColumn,
    title: 'Built Around Your Goals',
    text: 'Flexible engagement models shaped by your priorities and operating rhythm.',
  },
  {
    icon: faLock,
    title: 'Your Data, Protected',
    text: 'Secure handling and compliance-minded processes for sensitive business information.',
  },
]

function Service() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [addedServiceName, setAddedServiceName] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchServices()
  }, [])

  // Handle scrolling to hash fragment when component mounts or hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const hash = location.hash || window.location.hash
      if (hash) {
        const hashId = hash.substring(1) // Remove the # symbol
        let element = document.getElementById(hashId)
        
        // If not found by ID, try querySelector
        if (!element) {
          element = document.querySelector(hash)
        }
        
        if (element) {
          // Calculate offset for fixed header/navbar (adjust if needed)
          const offset = 100
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          })
        }
      }
    }

    // Wait for services to load, then scroll
    if (!loading) {
      // Try multiple times to ensure DOM is ready
      scrollToHash()
      const timeout1 = setTimeout(scrollToHash, 100)
      const timeout2 = setTimeout(scrollToHash, 300)
      const timeout3 = setTimeout(scrollToHash, 500)

      return () => {
        clearTimeout(timeout1)
        clearTimeout(timeout2)
        clearTimeout(timeout3)
      }
    }
  }, [location.hash, location.pathname, loading])

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getServices()
      // API returns {success: true, data: [...]}
      // servicesAPI.getServices() returns response.data from axios, which is {success: true, data: [...]}
      // So we need to extract the data property to get the array
      const servicesData = response?.data || (Array.isArray(response) ? response : [])
      setServices(servicesData)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load services'
      setError(`Failed to load services: ${errorMessage}`)
      console.error('Error fetching services:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (service) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    addToCart(service)
    setAddedServiceName(service.name)
    setShowSuccessModal(true)
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
  }

  const handleGoToLogin = () => {
    setShowLoginModal(false)
    navigate('/login')
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setAddedServiceName('')
  }

  const handleViewDetails = (service) => {
    setSelectedService(service)
  }

  const handleCloseDetailsModal = () => {
    setSelectedService(null)
  }

  if (loading) {
    return (
      <section className="page service-page container">
        <div>Loading services...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page service-page container">
        <div style={{ 
          color: 'red', 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#ffe6e6',
          borderRadius: '8px',
          margin: '2rem 0'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>⚠️ Error Loading Services</h2>
          <p>{error}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Please check:
            <br />• Is the Laravel server running and accessible?
            <br />• Check browser console for more details
            <br />• Verify CORS configuration
          </p>
          <button 
            onClick={() => {
              setError('')
              setLoading(true)
              fetchServices()
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </section>
    )
  }
  return (
    <div className="service-page" id="services-start">
      <section className="service-hero">
        <svg className="service-hero__svg-defs" aria-hidden="true">
          <defs>
            <clipPath id="serviceHeroCurve" clipPathUnits="objectBoundingBox">
              <path d="M 0.24 0 C 0.08 0.16, 0.36 0.38, 0.12 0.58 C 0.02 0.74, 0.1 0.9, 0.22 1 L 1 1 L 1 0 Z" />
            </clipPath>
          </defs>
        </svg>

        <div className="container service-hero__inner">
          <Reveal immediate className="service-hero__content">
            <span className="section-label">Capability. Clarity. Outcomes.</span>
            <h1>The Right Expertise for <span className="accent">Every Function.</span></h1>
            <span className="service-hero__line" aria-hidden="true" />
            <p>
              Browse services delivered by seasoned specialists—covering accounting, finance, HR, advisory, and creative work—with the accuracy and compliance your operations depend on.
            </p>
            <div className="service-hero__features">
              {heroFeatures.map((feature) => (
                <div key={feature.title} className="service-hero__feature">
                  <span className="service-hero__feature-icon">
                    <FontAwesomeIcon icon={feature.icon} />
                  </span>
                  <strong>{feature.title}</strong>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            <div className="service-hero__actions">
              <a href="#services-grid" className="btn btn-teal">Browse Services <span aria-hidden="true">→</span></a>
              <Link to="/contact" className="btn btn-outline">Talk to Us <span aria-hidden="true">→</span></Link>
            </div>
          </Reveal>
        </div>

        <div className="service-hero__visual">
          <div className="service-hero__decor" aria-hidden="true">
            <div className="service-hero__glow" />
            <div className="service-hero__dots" />
          </div>
          <div className="service-hero__image-shell">
            <img src={heroServiceDashboard} alt="Business dashboard and analytics" />
          </div>
          <div className="service-hero__curve-glow" aria-hidden="true" />
        </div>
      </section>

      <section className="service-list page-section" id="services-grid">
        <div className="container">
          <Reveal className="service-list__header">
            <h2 className="section-heading" style={{ textAlign: 'center' }}>What We Offer</h2>
            <div className="service-list__underline" />
          </Reveal>
          <div className="service-cards">
        {services.length === 0 ? (
          <div>No services available</div>
        ) : (
          services.map((service) => {
            const meta = getServiceMeta(service.name)
            return (
              <Reveal key={service.id}>
                <article
                  className="service-card-new"
                  style={{ backgroundImage: `url(${meta.bg})` }}
                >
                  <div className="service-card-new__overlay">
                    <span className="service-card-new__icon">
                      <FontAwesomeIcon icon={meta.icon} />
                    </span>
                    <h3>{service.name}</h3>
                    <p>{sanitizeBrandText(service.description) || 'Tailored support designed around your business goals.'}</p>
                    <div className="service-card-new__actions">
                      <button
                        type="button"
                        className="service-card-new__btn service-card-new__btn--details"
                        onClick={() => handleViewDetails(service)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="service-card-new__btn service-card-new__btn--get"
                        onClick={() => handleAddToCart(service)}
                      >
                        Get Service
                        <span className="service-card-new__btn-arrow" aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })
        )}
          </div>
        </div>
      </section>

      <section className="service-stats">
        <RevealStagger className="container service-stats__grid" stagger={0.1}>
          {stats.map((s) => (
            <RevealItem key={s.label}>
            <div className="service-stat">
              <span>{s.icon}</span>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={handleCloseModal}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-content">
              <h3 className="login-modal-title">Login Required</h3>
              <p className="login-modal-message">
              Sign in to save services to your cart or book a consultation with our team.
              </p>
              <div className="login-modal-actions">
                <button className="btn secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <Link to="/login" className="btn primary" onClick={handleGoToLogin}>
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleCloseSuccessModal}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-content">
              <div className="success-icon">✓</div>
              <h3 className="success-modal-title">Added to Your Cart</h3>
              <p className="success-modal-message">
                <strong>{addedServiceName}</strong> is ready—review your selection or continue browsing.
              </p>
              <div className="success-modal-actions">
                <button className="btn primary" onClick={handleCloseSuccessModal}>
                  OK
                </button>
                <Link to="/cart" className="btn secondary" onClick={handleCloseSuccessModal}>
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <div 
            className="service-details-modal-overlay" 
            onClick={handleCloseDetailsModal}
          >
            <motion.div
              className="service-details-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="service-details-close-btn"
                onClick={handleCloseDetailsModal}
              >
                ×
              </button>

              <div className="service-details-content">
                <h2 className="service-details-title">{selectedService.name}</h2>

                {/* Service Description */}
                <div className="service-details-section">
                  <h3 className="service-details-section-title">Description</h3>
                  <p className="service-details-description">
                    {sanitizeBrandText(selectedService.description) || 'Tailored support designed around your business goals.'}
                  </p>
                </div>

                {/* Sub-Categories */}
                {selectedService.subcategories && selectedService.subcategories.length > 0 && (
                  <div className="service-details-section">
                    <h3 className="service-details-section-title">
                      Sub-Categories ({selectedService.subcategories.length})
                    </h3>
                    <ul className="service-details-list">
                      {selectedService.subcategories.map((sub) => (
                        <li key={sub.id} className="service-details-list-item">
                          {sub.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="service-details-actions">
                  <button
                    className="btn secondary"
                    onClick={handleCloseDetailsModal}
                  >
                    Close
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => {
                      handleCloseDetailsModal()
                      handleAddToCart(selectedService)
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Service


