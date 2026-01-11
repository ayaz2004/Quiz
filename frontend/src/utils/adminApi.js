const API_URL =  "http://localhost:3000";
import axios from "axios";

/**
 * Add a new quiz with questions
 * @param {FormData} formData - Form data containing quizData JSON and image files
 * @returns {Promise} API response
 */
export const addQuiz = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/quiz`, {
      method: "POST",
      credentials: 'include', // Send cookies with request
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add quiz");
    }

    return data;
  } catch (error) {
    console.error("Add Quiz Error:", error);
    throw error;
  }
};

/**
 * Update an existing quiz and its questions
 * @param {number} quizId - ID of the quiz to update
 * @param {FormData} formData - Form data containing quizData JSON and image files
 * @returns {Promise} API response
 */
export const updateQuiz = async (quizId, formData) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/quiz/${quizId}`, {
      method: "PUT",
      credentials: 'include', // Send cookies with request
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update quiz");
    }

    return data;
  } catch (error) {
    console.error("Update Quiz Error:", error);
    throw error;
  }
};

/**
 * Get all users with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} token - Admin access token
 * @returns {Promise} API response with users and pagination data
 */
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/get-all-users?page=${page}&limit=${limit}`,
      { withCredentials: true }
    );

    return response.data; // ✅ axios already parsed JSON
  } catch (error) {
    console.error("Get All Users Error:", error.response?.data || error.message);
    throw error;
  }
};


/**
 * Delete a user by ID
 * @param {number} userId - ID of the user to delete
 * @returns {Promise} API response
 */
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/user/${userId}`, {
      method: "DELETE",
      credentials: 'include', // Send cookies with request
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete user");
    }

    return data;
  } catch (error) {
    console.error("Delete User Error:", error);
    throw error;
  }
};
