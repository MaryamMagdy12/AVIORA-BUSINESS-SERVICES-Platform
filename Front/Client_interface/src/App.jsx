import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import ScrollToTop from './components/ScrollToTop'
import PageTransition from './components/PageTransition'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Service from './pages/Service'
import Cart from './pages/Cart'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Appointment from './pages/Appointment'
import Contact from './pages/Contact'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'

function RoutedContent() {
  const location = useLocation()

  // Hide Navbar & Footer on login/register pages
  const hideNavAndFooter =
    location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="app-container">
      <ScrollToTop />
      {/* Only show Navbar if not login/register */}
      {!hideNavAndFooter && <Navbar />}

      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <main className="app-main">
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/service" element={<Service />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route path="/payment/:transactionId" element={<Payment />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointment"
                element={
                  <ProtectedRoute>
                    <Appointment />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
        </PageTransition>
      </AnimatePresence>

      {/* Only show Footer if not login/register */}
      {!hideNavAndFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <RoutedContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
