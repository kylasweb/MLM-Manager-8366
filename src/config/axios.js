import axios from 'axios';
import { toast } from 'react-toastify';
import { getSession } from '../utils/jwt';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getSession();
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
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    switch (error.response?.status) {
      case 401:
        toast.error('Session expired. Please login again');
        // Handle unauthorized error (logout user)
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 422:
        // Validation errors
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach(err => {
            toast.error(err);
          });
        } else {
          toast.error(message);
        }
        break;
      case 429:
        toast.error('Too many requests. Please try again later');
        break;
      case 500:
        toast.error('Server error. Please try again later');
        break;
      default:
        toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;