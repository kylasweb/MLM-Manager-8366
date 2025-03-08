import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserFriends, FaEdit, FaChartLine } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useGetAdminReferralStatsQuery } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function ReferralManagement() {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const { data: stats, isLoading } = useGetAdminReferralStatsQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Referral Management
        </h1>
        <div className="flex space-x-4">
          <div className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          } shadow-neo-light dark:shadow-neo-dark`}>
            <span className="text-sm text-gray-500">Total Business Volume:</span>
            <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ${stats?.totalBusinessVolume?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          } shadow-neo-light dark:shadow-neo-dark`}>
            <span className="text-sm text-gray-500">Active Referrals:</span>
            <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats?.totalActiveReferrals || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Business Volume Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-4">Product Sales Volume</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Today</span>
              <span className="font-bold">${stats?.productSalesVolume?.today?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">This Month</span>
              <span className="font-bold">${stats?.productSalesVolume?.month?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">${stats?.productSalesVolume?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-4">Investment Volume</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Today</span>
              <span className="font-bold">${stats?.investmentVolume?.today?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">This Month</span>
              <span className="font-bold">${stats?.investmentVolume?.month?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">${stats?.investmentVolume?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-4">Commission Payouts</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Pending</span>
              <span className="font-bold">${stats?.commissionPayouts?.pending?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">This Month</span>
              <span className="font-bold">${stats?.commissionPayouts?.month?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-bold">${stats?.commissionPayouts?.totalPaid?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or sponsor ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full rounded-lg ${
              darkMode
                ? 'bg-dark-card text-white border-dark-border'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-primary-500`}
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className={`px-4 py-2 rounded-lg ${
            darkMode
              ? 'bg-dark-card text-white border-dark-border'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:outline-none focus:ring-2 focus:ring-primary-500`}
        >
          <option value="all">All Levels</option>
          {[1, 2, 3, 4, 5].map(level => (
            <option key={level} value={level}>Level {level}</option>
          ))}
        </select>
      </div>

      {/* Referral Network Table */}
      <div className={`rounded-xl overflow-hidden ${
        darkMode ? 'bg-dark-card' : 'bg-white'
      } shadow`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sponsor ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Business Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Investments</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats?.referralNetwork?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono">{user.sponsorId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Level {user.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${user.businessVolume.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${user.productSales.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${user.investments.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      onClick={() => {/* View network tree */}}
                    >
                      <FaUserFriends />
                    </button>
                    <button
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      onClick={() => {/* View statistics */}}
                    >
                      <FaChartLine />
                    </button>
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => {/* Edit referral settings */}}
                    >
                      <FaEdit />
                    </button>
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

export default ReferralManagement; 