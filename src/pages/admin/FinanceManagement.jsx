import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaExchangeAlt, FaChartLine } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import StatusBadge from '../../components/StatusBadge';

function FinanceManagement() {
  const { darkMode } = useTheme();
  const [withdrawalRequests, setWithdrawalRequests] = useState([
    {
      id: 1,
      user: 'John Doe',
      amount: 500,
      status: 'pending',
      date: '2024-03-15',
      method: 'Bitcoin'
    },
    // Add more mock data
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'deposit',
      user: 'Jane Smith',
      amount: 1000,
      status: 'completed',
      date: '2024-03-14'
    },
    // Add more mock data
  ]);

  const handleApproveWithdrawal = (id) => {
    setWithdrawalRequests(requests =>
      requests.map(request =>
        request.id === id ? { ...request, status: 'approved' } : request
      )
    );
  };

  const handleRejectWithdrawal = (id) => {
    setWithdrawalRequests(requests =>
      requests.map(request =>
        request.id === id ? { ...request, status: 'rejected' } : request
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Finance Management
      </h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`rounded-xl p-6 ${
            darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Deposits
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                $25,000
              </h3>
            </div>
            <FaMoneyBillWave className="text-primary-600 text-3xl" />
          </div>
        </div>

        <div
          className={`rounded-xl p-6 ${
            darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Withdrawals
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                $15,000
              </h3>
            </div>
            <FaExchangeAlt className="text-primary-600 text-3xl" />
          </div>
        </div>

        <div
          className={`rounded-xl p-6 ${
            darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Platform Revenue
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                $5,000
              </h3>
            </div>
            <FaChartLine className="text-primary-600 text-3xl" />
          </div>
        </div>
      </div>

      {/* Withdrawal Requests */}
      <div
        className={`rounded-xl p-6 ${
          darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
        }`}
      >
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Withdrawal Requests
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">User</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Method</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {withdrawalRequests.map((request) => (
                <tr key={request.id}>
                  <td className="py-3">{request.user}</td>
                  <td className="py-3">${request.amount}</td>
                  <td className="py-3">{request.method}</td>
                  <td className="py-3">{request.date}</td>
                  <td className="py-3">
                    <StatusBadge status={request.status} text={request.status} />
                  </td>
                  <td className="py-3">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveWithdrawal(request.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(request.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className={`rounded-xl p-6 ${
          darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
        }`}
      >
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">User</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="py-3 capitalize">{transaction.type}</td>
                  <td className="py-3">{transaction.user}</td>
                  <td className="py-3">${transaction.amount}</td>
                  <td className="py-3">{transaction.date}</td>
                  <td className="py-3">
                    <StatusBadge status={transaction.status} text={transaction.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default FinanceManagement;