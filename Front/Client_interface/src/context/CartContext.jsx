import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Get cart key based on user ID
  const getCartKey = (userId) => {
    return userId ? `cart_${userId}` : 'cart_guest'
  }

  // Load cart for current user or clear when logged out
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // User is logged in - load their cart
      try {
        const cartKey = getCartKey(user.id)
        const savedCart = localStorage.getItem(cartKey)
        if (savedCart) {
          const parsed = JSON.parse(savedCart)
          setCartItems(Array.isArray(parsed) ? parsed : [])
        } else {
          setCartItems([])
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        setCartItems([])
      }
    } else {
      // User is not logged in - clear cart and remove from localStorage
      setCartItems([])
      // Clean up any guest cart
      try {
        const guestCartKey = getCartKey(null)
        localStorage.removeItem(guestCartKey)
      } catch (error) {
        console.error('Error cleaning up guest cart:', error)
      }
    }
    setIsInitialized(true)
  }, [user?.id, isAuthenticated])

  // Save cart to localStorage whenever it changes (only if user is logged in)
  useEffect(() => {
    if (isInitialized && isAuthenticated && user?.id) {
      const cartKey = getCartKey(user.id)
      localStorage.setItem(cartKey, JSON.stringify(cartItems))
    }
  }, [cartItems, isAuthenticated, user?.id, isInitialized])

  const addToCart = (service) => {
    if (!isAuthenticated) {
      console.warn('User must be logged in to add items to cart')
      return false
    }
    
    if (!service || !service.id) {
      console.error('Invalid service object:', service)
      return false
    }
    
    setCartItems((prevItems) => {
      // Check if service already exists in cart
      const exists = prevItems.find((item) => item.id === service.id)
      if (exists) {
        return prevItems // Don't add duplicates
      }
      const newItems = [...prevItems, service]
      return newItems
    })
    return true
  }

  const removeFromCart = (serviceId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== serviceId))
  }

  const clearCart = () => {
    setCartItems([])
    if (user?.id) {
      const cartKey = getCartKey(user.id)
      localStorage.removeItem(cartKey)
    }
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount: cartItems.length,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

