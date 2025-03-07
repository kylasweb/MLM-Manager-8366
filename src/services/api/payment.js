import axios from '../../config/axios';

export const paymentAPI = {
  // Stripe Payment Methods
  createPaymentIntent: async (amount, currency = 'usd') => {
    const response = await axios.post('/payment/create-intent', { amount, currency });
    return response.data;
  },

  confirmPayment: async (paymentIntentId) => {
    const response = await axios.post('/payment/confirm', { paymentIntentId });
    return response.data;
  },

  // Crypto Payment Methods
  generateCryptoAddress: async (currency) => {
    const response = await axios.post('/payment/crypto/generate-address', { currency });
    return response.data;
  },

  verifyCryptoPayment: async (txHash) => {
    const response = await axios.post('/payment/crypto/verify', { txHash });
    return response.data;
  },

  // Payment History
  getPaymentHistory: async () => {
    const response = await axios.get('/payment/history');
    return response.data;
  },

  // Admin Payment Methods
  getPaymentStats: async () => {
    const response = await axios.get('/admin/payment/stats');
    return response.data;
  },

  updatePaymentSettings: async (settings) => {
    const response = await axios.put('/admin/payment/settings', settings);
    return response.data;
  }
};