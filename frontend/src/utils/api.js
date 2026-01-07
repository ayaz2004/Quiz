import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://quiz-d4de.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
