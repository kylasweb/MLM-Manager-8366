import axios from '../../config/axios';

export const walletAPI = {
  getBalance: async () => {
    const response = await axios.get('/wallet/balance');
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await axios.get('/wallet/transactions', { params });
    return response.data;
  },

  createDeposit: async (data) => {
    const response = await axios.post('/wallet/deposit', data);
    return response.data;
  },

  requestWithdrawal: async (data) => {
    const response = await axios.post('/wallet/withdraw', data);
    return response.data;
  },

  getWithdrawalHistory: async () => {
    const response = await axios.get('/wallet/withdrawals');
    return response.data;
  }
};