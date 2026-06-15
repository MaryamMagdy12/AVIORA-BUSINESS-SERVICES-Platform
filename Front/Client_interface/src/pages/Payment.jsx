import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import '../assets/css/payment.css'
import Reveal from '../components/Reveal'
import { paymentAPI } from '../services/api'

function Payment() {
  const { transactionId } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!transactionId || !token) {
      setError('Invalid or missing payment link. Please use the link from your email.')
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        const data = await paymentAPI.getPayment(transactionId, token)
        setPayment(data.data ?? data)
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load payment details.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [transactionId, token])

  if (loading) {
    return (
      <section className="payment-page container">
        <p>Loading payment details...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="payment-page container">
        <Reveal><h1>Payment</h1></Reveal>
        <p className="payment-error">{error}</p>
      </section>
    )
  }

  return (
    <section className="payment-page container">
      <Reveal><h1>Payment Details</h1></Reveal>
      <div className="payment-layout">
        <Reveal>
          <div className="order-card">
            <h3>Order Summary</h3>
            <ul>
              {(payment?.appointment?.services || []).map((service) => (
                <li key={service.id}>
                  <span>{service.name}</span>
                </li>
              ))}
              <li className="total">
                <span>Total</span>
                <span>${Number(payment?.amount || 0).toFixed(2)}</span>
              </li>
            </ul>
            <p><strong>Status:</strong> {payment?.status}</p>
            <p><strong>Transaction:</strong> {payment?.transaction_id}</p>
            {payment?.status === 'pending' && (
              <p className="payment-note">
                After completing your payment through the agreed method, our team will verify and confirm your appointment.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Payment
