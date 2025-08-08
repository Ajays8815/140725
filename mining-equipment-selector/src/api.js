import axios from 'axios';

// Use environment variable injected by Netlify
const API_BASE_URL = process.env.REACT_APP_API_URL + '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Equipment API endpoints
export const equipmentAPI = {
  // Get all equipment
  getAllEquipment: async () => {
    try {
      const response = await api.get('/equipment');
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  },

  // Select equipment based on requirements
  selectEquipment: async (requirements) => {
    try {
      const response = await api.post('/select', requirements);
      return response.data;
    } catch (error) {
      console.error('Error selecting equipment:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }
};

export default api;
