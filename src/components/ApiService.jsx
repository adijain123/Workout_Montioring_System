import axios from 'axios';

// Base API URL
const API_URL = 'https://backend-workout-monitoring.onrender.com';

// Configure axios to include credentials for session cookies
axios.defaults.withCredentials = true;

/**
 * API Service for communication with the backend
 */
export const ApiService = {
  /**
   * User authentication
   */
  auth: {
    // Login user
    login: async (email, password) => {
      try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Login failed' };
      }
    },
    
    // Register new user
    signup: async (userData) => {
      try {
        const response = await axios.post(`${API_URL}/signup`, userData);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Signup failed' };
      }
    },
    
    // Logout user
    logout: async () => {
      try {
        const response = await axios.post(`${API_URL}/logout`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Logout failed' };
      }
    },
    
    // Check if user is authenticated
    checkAuth: async () => {
      try {
        const response = await axios.get(`${API_URL}/check-auth`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Authentication check failed' };
      }
    }
  },
  
  /**
   * Workout session management
   */
  workout: {
    // Start a new workout session
    startSession: async () => {
      try {
        const response = await axios.post(`${API_URL}/start-workout`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Failed to start workout session' };
      }
    },
    
    // End a workout session
    endSession: async (sessionId, duration) => {
      try {
        const response = await axios.post(`${API_URL}/end-workout`, {
          session_id: sessionId,
          duration
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Failed to end workout session' };
      }
    },
    
    // Save exercise data
    saveExercise: async (sessionId, exerciseType, reps) => {
      try {
        const response = await axios.post(`${API_URL}/save-exercise`, {
          session_id: sessionId,
          type: exerciseType,
          reps
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Failed to save exercise data' };
      }
    },
    
    // Get user progress
    getUserProgress: async () => {
      try {
        const response = await axios.get(`${API_URL}/user-progress`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: 'Failed to get user progress' };
      }
    }
  }
};

export default ApiService;