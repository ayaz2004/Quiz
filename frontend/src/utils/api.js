import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://quiz-d4de.onrender.com',
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

export default api;
