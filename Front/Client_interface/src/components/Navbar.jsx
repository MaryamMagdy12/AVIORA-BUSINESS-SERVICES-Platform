import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AvioraLogo from './AvioraLogo'
import '../assets/css/nav.css'

const navLinks = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/about', label: 'About', icon: 'people-group' },
  { to: '/service', label: 'Service', icon: 'scroll' },
  { to: '/cart', label: 'Cart', icon: 'cart-shopping', badge: true },
  { to: '/contact', label: 'Contact', icon: 'envelope' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const { isAuthenticated, logout } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async (e) => {
    e.preventDefault()
    closeMenu()
    await logout()
    navigate('/home')
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/home" className="navbar__brand" onClick={closeMenu}>
          <AvioraLogo className="navbar__logo" />
        </NavLink>

        <button
          className={`navbar__toggle ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <nav className={`navbar__nav ${menuOpen ? 'is-open' : ''}`}>
          {navLinks.map(({ to, label, icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `navbar__link navbar__link--icon ${isActive ? 'is-active' : ''}`
              }
              onClick={closeMenu}
              title={label}
            >
              <span className="navbar__icon-wrap">
                <FontAwesomeIcon icon={icon} />
                {badge && cartCount > 0 && (
                  <span className="navbar__badge">{cartCount}</span>
                )}
              </span>
              <span className="navbar__label">{label}</span>
            </NavLink>
          ))}

          {isAuthenticated ? (
            <button
              className="navbar__link navbar__link--icon navbar__logout"
              onClick={handleLogout}
              title="Logout"
            >
              <span className="navbar__icon-wrap">
                <FontAwesomeIcon icon="right-from-bracket" />
              </span>
              <span className="navbar__label">Logout</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `navbar__link navbar__link--icon navbar__login ${isActive ? 'is-active' : ''}`
              }
              onClick={closeMenu}
              title="Sign In"
            >
              <span className="navbar__icon-wrap">
                <FontAwesomeIcon icon="right-to-bracket" />
              </span>
              <span className="navbar__label">Sign In</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
