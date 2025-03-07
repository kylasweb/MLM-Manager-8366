import { useState, useEffect } from 'react';
import { useAsync } from './useAsync';
import { walletAPI } from '../services/api/wallet';

export const useWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);

  const { execute: fetchBalance, loading: balanceLoading } = useAsync(walletAPI.getBalance);
  const { execute: fetchTransactions, loading: transactionsLoading } = useAsync(walletAPI.getTransactions);
  const { execute: fetchWithdrawals, loading: withdrawalsLoading } = useAsync(walletAPI.getWithdrawalHistory);
  const { execute: createDeposit, loading: depositLoading } = useAsync(walletAPI.createDeposit);
  const { execute: requestWithdrawal, loading: withdrawalLoading } = useAsync(walletAPI.requestWithdrawal);

  const loadWalletData = async () => {
    try {
      const [balanceData, transactionsData, withdrawalsData] = await Promise.all([
        fetchBalance(),
        fetchTransactions(),
        fetchWithdrawals()
      ]);

      setBalance(balanceData.balance);
      setTransactions(transactionsData.transactions);
      setPendingWithdrawals(withdrawalsData.withdrawals);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  useEffect(() => {
    loadWalletData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadWalletData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDeposit = async (amount) => {
    try {
      await createDeposit({ amount });
      await loadWalletData();
    } catch (error) {
      throw error;
    }
  };

  const handleWithdraw = async (amount) => {
    try {
      await requestWithdrawal({ amount });
      await loadWalletData();
    } catch (error) {
      throw error;
    }
  };

  return {
    balance,
    transactions,
    pendingWithdrawals,
    handleDeposit,
    handleWithdraw,
    loading: balanceLoading || transactionsLoading || withdrawalsLoading,
    depositLoading,
    withdrawalLoading
  };
};