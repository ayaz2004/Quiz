import api from './api';

export const getTrackedCourses = async () => {
  try {
    const response = await api.get('/api/result-track/courses');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addTrackedCourse = async (payload) => {
  try {
    const response = await api.post('/api/result-track/courses', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeTrackedCourse = async (id) => {
  try {
    const response = await api.delete(`/api/result-track/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getResultNotifications = async () => {
  try {
    const response = await api.get('/api/result-track/notifications');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markNotificationsRead = async (payload) => {
  try {
    const response = await api.patch('/api/result-track/notifications/read', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getVapidPublicKey = async () => {
  try {
    const response = await api.get('/api/result-track/vapid-public-key');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const subscribePush = async (subscription, userAgent) => {
  try {
    const json = subscription.toJSON();
    const response = await api.post('/api/result-track/push/subscribe', {
      endpoint: json.endpoint,
      keys: json.keys,
      userAgent,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const unsubscribePush = async (endpoint) => {
  try {
    const response = await api.delete('/api/result-track/push/subscribe', {
      data: { endpoint },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getTrackedCourses,
  addTrackedCourse,
  removeTrackedCourse,
  getResultNotifications,
  markNotificationsRead,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
};
