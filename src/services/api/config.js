import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, AUTH_TOKEN_KEY, ERROR_MESSAGES, USE_MOCK_DATA } from '../../config/constants';
import { mockApi } from '../mockApi';
import notificationManager from '../../utils/notificationManager';

const createApiClient = () => {
  if (USE_MOCK_DATA) {
    console.log('Using mock API in development mode');
    return mockApi;
  }

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => {
      // Transform successful responses if needed
      return response.data;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle token expiration
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken
            });

            const { token } = response.data;
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Handle refresh token failure
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(ERROR_MESSAGES.SESSION_EXPIRED);
        }
      }

      // Handle network errors
      if (!error.response) {
        notificationManager.error(ERROR_MESSAGES.NETWORK_ERROR);
        return Promise.reject({
          message: ERROR_MESSAGES.NETWORK_ERROR,
          status: 'network_error'
        });
      }

      // Handle server errors
      if (error.response.status >= 500) {
        notificationManager.error(ERROR_MESSAGES.SERVER_ERROR);
        return Promise.reject({
          message: ERROR_MESSAGES.SERVER_ERROR,
          status: error.response.status
        });
      }

      // Handle validation errors
      if (error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.values(validationErrors).forEach(error => {
          notificationManager.error(error[0]);
        });
        return Promise.reject({
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: validationErrors,
          status: error.response.status
        });
      }

      // Return the error response
      return Promise.reject({
        message: error.response.data.message || ERROR_MESSAGES.SERVER_ERROR,
        status: error.response.status,
        errors: error.response.data.errors
      });
    }
  );

  return apiClient;
};

const apiClient = createApiClient();
export default apiClient; 