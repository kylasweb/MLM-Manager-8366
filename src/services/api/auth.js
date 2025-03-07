import axios from '../../config/axios';

export const authAPI = {
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axios.post('/auth/verify-email', { token });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.post('/auth/reset-password', { token, password });
    return response.data;
  },

  refreshToken: async () => {
    const response = await axios.post('/auth/refresh-token');
    return response.data;
  }
};