import '../assets/css/cart.css'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { illusClipboard } from '../assets/media'
import { getServiceMeta, iconAppointment } from '../utils/serviceAssets'
import { sanitizeBrandText } from '../utils/sanitizeBrandText'
import Reveal, { RevealStagger, RevealItem } from '../components/Reveal'

function Cart() {
  const { cartItems, removeFromCart } = useCart()

  return (
    <section className="cart-page page">
      <div className="container">
        <Reveal immediate className="cart-page__header">
          <h1>Your Service Shortlist</h1>
          <span className="cart-page__accent" />
        </Reveal>

        <div className="cart-layout">
          <div className="cart-main">
            {cartItems.length === 0 ? (
              <Reveal>
              <div className="cart-empty">
                <p>No services selected yet</p>
                <Link to="/service" className="btn btn-primary">Explore Services</Link>
              </div>
              </Reveal>
            ) : (
              <RevealStagger stagger={0.1}>
              {cartItems.map((service) => {
                const meta = getServiceMeta(service.name)
                return (
                  <RevealItem key={service.id}>
                  <div className="cart-service-card">
                    <div className={`cart-service-card__icon-wrap${meta.cartIcon ? ' has-icon' : ''}`}>
                      <img
                        src={meta.cartIcon || meta.bg}
                        alt=""
                        style={meta.cartIcon ? undefined : { objectPosition: meta.cartPosition }}
                      />
                    </div>
                    <div className="cart-service-card__divider" aria-hidden="true" />
                    <div className="cart-service-card__body">
                      <h3>{service.name}</h3>
                      <p>{sanitizeBrandText(service.description)}</p>
                    </div>
                    <button
                      type="button"
                      className="cart-service-card__remove"
                      onClick={() => removeFromCart(service.id)}
                      aria-label={`Remove ${service.name}`}
                    >
                      ×
                    </button>
                  </div>
                  </RevealItem>
                )
              })}
              </RevealStagger>
            )}

            <RevealStagger className="cart-actions-grid" stagger={0.12} delayChildren={0.08}>
              <RevealItem>
              <Link
                to="/appointment"
                className={`cart-action-card ${cartItems.length === 0 ? 'is-disabled' : ''}`}
                style={{ pointerEvents: cartItems.length === 0 ? 'none' : 'auto', opacity: cartItems.length === 0 ? 0.5 : 1 }}
              >
                <div className="cart-action-card__icon-wrap">
                  <img src={iconAppointment} alt="" />
                </div>
                <div className="cart-action-card__divider" aria-hidden="true" />
                <div className="cart-action-card__content">
                  <h3>Schedule a Call</h3>
                  <p>Meet with our team to walk through your shortlist and align on scope, timing, and next steps.</p>
                </div>
                <span className="cart-action-card__arrow" aria-hidden="true">→</span>
              </Link>
              </RevealItem>

              <RevealItem>
              <Link to="/service" className="cart-action-card">
                <div className="cart-action-card__icon-wrap cart-action-card__icon-wrap--plus">
                  <span aria-hidden="true">+</span>
                </div>
                <div className="cart-action-card__divider" aria-hidden="true" />
                <div className="cart-action-card__content">
                  <h3>Add Another Service</h3>
                  <p>Return to the catalog to build out the support your business needs.</p>
                </div>
              </Link>
              </RevealItem>
            </RevealStagger>
          </div>

          <Reveal delay={0.15} className="cart-illustration">
            <img src={illusClipboard} alt="" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default Cart
