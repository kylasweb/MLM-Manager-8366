import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaArrowUp, FaArrowDown, FaExchangeAlt } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

function Wallet() {
  const { darkMode } = useTheme();
  const {
    balance,
    transactions,
    pendingWithdrawals,
    handleDeposit,
    handleWithdraw,
    loading,
    depositLoading,
    withdrawalLoading
  } = useWallet();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleDeposit(Number(depositAmount));
      setDepositAmount('');
      setShowDepositModal(false);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleWithdraw(Number(withdrawAmount));
      setWithdrawAmount('');
      setShowWithdrawModal(false);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Balance Card */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Available Balance
            </p>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ${balance.toFixed(2)}
            </h2>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowDepositModal(true)}
              disabled={depositLoading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
            >
              <FaArrowDown />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={withdrawalLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-dark-bg text-white hover:bg-opacity-80'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <FaArrowUp />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="py-3">
                    <div className="flex items-center">
                      {transaction.type === 'deposit' ? (
                        <FaArrowDown className="text-green-500 mr-2" />
                      ) : transaction.type === 'withdrawal' ? (
                        <FaArrowUp className="text-red-500 mr-2" />
                      ) : (
                        <FaExchangeAlt className="text-blue-500 mr-2" />
                      )}
                      <span className={`capitalize ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {transaction.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className={`py-3 ${
                    transaction.type === 'deposit'
                      ? 'text-green-500'
                      : transaction.type === 'withdrawal'
                      ? 'text-red-500'
                      : 'text-blue-500'
                  }`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <StatusBadge
                      status={transaction.status === 'completed' ? 'success' : 'pending'}
                      text={transaction.status}
                    />
                  </td>
                  <td className="py-3 text-gray-500">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default Wallet;