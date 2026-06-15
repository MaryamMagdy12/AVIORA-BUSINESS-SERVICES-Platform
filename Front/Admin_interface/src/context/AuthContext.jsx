import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount (Admin only)
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    
    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.is_admin) {
        setToken(storedToken);
        setUser(userData);
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;
      
      // Only allow admin login in admin interface
      if (!userData.is_admin) {
        return {
          success: false,
          error: 'Admin access required. Please use the client interface.',
        };
      }
      
      // Store admin token and user
      localStorage.setItem('admin_token', newToken);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      // Handle Laravel validation errors
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Laravel validation errors format: { errors: { email: [...], password: [...] } }
        if (errorData.errors) {
          const errorMessages = [];
          if (errorData.errors.email) {
            errorMessages.push(...errorData.errors.email);
          }
          if (errorData.errors.password) {
            errorMessages.push(...errorData.errors.password);
          }
          errorMessage = errorMessages.join('. ') || errorData.message || errorMessage;
        } 
        // Direct error/message fields
        else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Legacy format (flat validation errors)
        else if (errorData.email) {
          errorMessage = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.password) {
          errorMessage = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        }
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        errorMessage = `Cannot connect to server. Please ensure Laravel backend is running on ${apiBaseUrl}.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        requiresVerification: error.response?.data?.requires_verification || false,
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear admin storage only
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setToken(null);
      setUser(null);
    }
  };

  // Admin interface only - always check if admin
  const isAdmin = () => {
    return user?.is_admin === true;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!token && isAdmin(), // Must be authenticated AND admin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

