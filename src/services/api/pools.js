import axios from '../../config/axios';

export const poolsAPI = {
  getActivePools: async () => {
    const response = await axios.get('/pools/active');
    return response.data;
  },

  getPoolById: async (poolId) => {
    const response = await axios.get(`/pools/${poolId}`);
    return response.data;
  },

  joinPool: async (poolId) => {
    const response = await axios.post(`/pools/${poolId}/join`);
    return response.data;
  },

  getPoolHistory: async () => {
    const response = await axios.get('/pools/history');
    return response.data;
  },

  // Admin endpoints
  createPool: async (poolData) => {
    const response = await axios.post('/admin/pools', poolData);
    return response.data;
  },

  updatePool: async (poolId, poolData) => {
    const response = await axios.put(`/admin/pools/${poolId}`, poolData);
    return response.data;
  },

  deletePool: async (poolId) => {
    const response = await axios.delete(`/admin/pools/${poolId}`);
    return response.data;
  }
};