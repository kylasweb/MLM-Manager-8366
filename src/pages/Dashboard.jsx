import { motion } from 'framer-motion';
import { useInvestments } from '../hooks/useInvestments';
import { usePools } from '../hooks/usePools';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import { useState, useEffect } from 'react';

function Dashboard() {
  const { user } = useAuth();
  const { activeInvestments, loading: investmentsLoading } = useInvestments();
  const { activePools, loading: poolsLoading } = usePools();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeInvestments: 0,
    networkSize: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    // Simulate loading data
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setStats({
        totalEarnings: 1250.75,
        activeInvestments: 3,
        networkSize: 12,
        pendingWithdrawals: 1
      });
    }, 500);
  }, []);

  if (investmentsLoading || poolsLoading) {
    return <LoadingSpinner />;
  }

  const totalInvestment = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = activeInvestments.reduce((sum, inv) => sum + inv.earnings, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6"
    >
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name || 'User'}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase">Total Earnings</h2>
          <p className="text-2xl font-semibold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase">Active Investments</h2>
          <p className="text-2xl font-semibold text-gray-900">{stats.activeInvestments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase">Network Size</h2>
          <p className="text-2xl font-semibold text-gray-900">{stats.networkSize} members</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase">Pending Withdrawals</h2>
          <p className="text-2xl font-semibold text-gray-900">{stats.pendingWithdrawals}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Investment Return</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$120.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-10</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Referral Bonus</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$50.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-05</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Withdrawal</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$200.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;