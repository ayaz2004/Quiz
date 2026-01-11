import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Configure axios defaults for cookie-based auth
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check authentication by calling backend endpoint
      // Backend will verify cookies and return user data
      const response = await axios.get('https://quiz-d4de.onrender.com/api/users/me', {
        withCredentials: true
      });
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // User is not authenticated or session expired
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://quiz-d4de.onrender.com/api/users/signin', 
        { email, password },
        { withCredentials: true }
      );
      
      // Check if response indicates verification required (403 status but success response format)
      if (response.data.data?.requiresVerification) {
        return { 
          success: false,
          requiresVerification: true,
          error: response.data.message || 'Please verify your email before signing in.'
        };
      }

      const { user: userData } = response.data.data;
      
      // No need to store tokens - they're in httpOnly cookies
      // Just update state with user data
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, data: userData };
    } catch (error) {
      // Check if error is due to unverified email (403 status)
      if (error.response?.status === 403 && error.response?.data?.data?.requiresVerification) {
        return { 
          success: false,
          requiresVerification: true,
          error: error.response.data.message || 'Please verify your email before signing in.'
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('https://quiz-d4de.onrender.com/api/users/add', 
        userData,
        { withCredentials: true }
      );
      const { user: newUser } = response.data.data;
      
      // No need to store tokens - registration requires email verification
      // User won't be authenticated until they verify
      
      return { success: true, data: newUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear cookies
      await axios.post('https://quiz-d4de.onrender.com/api/users/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of backend response
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    // No need to store in localStorage - user data will be fetched from backend
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
