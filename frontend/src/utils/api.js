import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // Increased to 30 seconds for cold starts on free hosting
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - No longer need to manually add token
// Cookies are sent automatically with withCredentials: true
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console errors for expected 403 on /users/me (not logged in)
    if (error.response?.status === 403 && error.config?.url?.includes('/users/me')) {
      // Silently handle - user not authenticated, which is expected
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      // Cookies will be cleared by calling the logout endpoint
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const verifyEmail = (token) => api.get(`/api/users/verify-email/${token}`);
export const forgotPassword = (email) => api.post('/api/users/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/api/users/reset-password/${token}`, { password });
export const resendVerification = (email) => api.post('/api/users/resend-verification', { email });

// Profile API functions
export const updateProfile = (data) => api.put('/api/users/update-profile', data);
export const changePassword = (data) => api.put('/api/users/change-password', data);

export default api;
