import axios from '../../config/axios';

export const investmentAPI = {
  getPlans: async () => {
    const response = await axios.get('/investments/plans');
    return response.data;
  },

  purchasePlan: async (planId) => {
    const response = await axios.post(`/investments/purchase/${planId}`);
    return response.data;
  },

  getActiveInvestments: async () => {
    const response = await axios.get('/investments/active');
    return response.data;
  },

  getInvestmentHistory: async () => {
    const response = await axios.get('/investments/history');
    return response.data;
  },

  // Admin endpoints
  createPlan: async (planData) => {
    const response = await axios.post('/admin/investments/plans', planData);
    return response.data;
  },

  updatePlan: async (planId, planData) => {
    const response = await axios.put(`/admin/investments/plans/${planId}`, planData);
    return response.data;
  },

  deletePlan: async (planId) => {
    const response = await axios.delete(`/admin/investments/plans/${planId}`);
    return response.data;
  }
};