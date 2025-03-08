import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';

const api = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for admin authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/dashboard/activities');
    return response.data;
  },

  // User Management
  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  // Investment Management
  getInvestmentStats: async () => {
    const response = await api.get('/investments/stats');
    return response.data;
  },

  approveInvestment: async (investmentId) => {
    const response = await api.post(`/investments/${investmentId}/approve`);
    return response.data;
  },

  // Pool Management
  createPool: async (poolData) => {
    const response = await api.post('/pools', poolData);
    return response.data;
  },

  updatePool: async (poolId, poolData) => {
    const response = await api.put(`/pools/${poolId}`, poolData);
    return response.data;
  },

  // Withdrawal Management
  getPendingWithdrawals: async () => {
    const response = await api.get('/withdrawals/pending');
    return response.data;
  },

  approveWithdrawal: async (withdrawalId) => {
    const response = await api.post(`/withdrawals/${withdrawalId}/approve`);
    return response.data;
  },

  // System Settings
  getSystemSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },

  // Analytics
  getAnalytics: async (params) => {
    const response = await api.get('/analytics', { params });
    return response.data;
  }
}; 