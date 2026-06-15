import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import AvioraLogo from './AvioraLogo'
import '../assets/css/footer.css'

const quickLinks = [
  { to: '/home', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/service', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <AvioraLogo className="site-footer__logo" theme="dark" />
          <p>
            Remote expertise for finance, HR, advisory, and creative work—so your business can move faster with less overhead.
          </p>
          <div className="site-footer__social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
          </div>
        </div>

        <nav className="site-footer__col" aria-label="Quick links">
          <h4>Quick Links</h4>
          <ul>
            {quickLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col site-footer__contact">
          <h4>Contact</h4>
          <ul>
            <li>
              <FontAwesomeIcon icon={faEnvelope} />
              <a href="mailto:info@aviora.com">info@aviora.com</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faPhone} />
              <a href="tel:+966500000000">+966 50 000 0000</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faLocationDot} />
              <span>Riyadh, Saudi Arabia</span>
            </li>
          </ul>
        </div>

        <div className="site-footer__col site-footer__newsletter">
          <h4>Stay in the Loop</h4>
          <p className="site-footer__newsletter-text">
            Get updates on services, insights, and ways to strengthen your remote operations.
          </p>
          <form className="site-footer__form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" aria-label="Email for newsletter" />
            <button type="submit" aria-label="Subscribe">→</button>
          </form>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p>© {new Date().getFullYear()} Aviora Business Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
