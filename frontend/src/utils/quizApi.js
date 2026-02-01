import api from './api';

/**
 * Quiz API functions
 */

// Get all quizzes with filters
export const getQuizzes = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.year) queryParams.append('year', params.year);
    if (params.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/api/quiz/list?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single quiz by ID
export const getQuizById = async (quizId) => {
  try {
    const response = await api.get(`/api/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all subjects
export const getSubjects = async () => {
  try {
    const response = await api.get('/api/quiz/subjects');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all exam years
export const getYears = async () => {
  try {
    const response = await api.get('/api/quiz/years');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check user's access to a quiz (requires auth)
export const checkQuizAccess = async (quizId) => {
  try {
    const response = await api.get(`/api/purchase/check-access/${quizId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Purchase a quiz (requires auth)
export const purchaseQuiz = async (quizId) => {
  try {
    const response = await api.post(`/api/purchase/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's purchased quizzes (requires auth)
export const getMyQuizzes = async () => {
  try {
    const response = await api.get('/api/purchase/my-quizzes');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Submit quiz attempt (requires auth)
export const submitQuizAttempt = async (quizId, answers, timeTaken) => {
  try {
    const response = await api.post(`/api/quiz/attempt/${quizId}`, {
      answers,
      timeTaken
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's quiz attempts (requires auth)
export const getUserAttempts = async (page = 1, limit = 10, quizId = null) => {
  try {
    const params = { page, limit };
    if (quizId) params.quizId = quizId;
    
    const response = await api.get('/api/quiz/my-attempts', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get detailed result for a specific attempt (requires auth)
export const getAttemptResult = async (attemptId) => {
  try {
    const response = await api.get(`/api/quiz/attempt-result/${attemptId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's quiz statistics (requires auth)
export const getUserStats = async () => {
  try {
    const response = await api.get('/api/quiz/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getQuizzes,
  getQuizById,
  getSubjects,
  getYears,
  checkQuizAccess,
  purchaseQuiz,
  getMyQuizzes,
  submitQuizAttempt,
  getUserAttempts,
  getAttemptResult,
  getUserStats
};
