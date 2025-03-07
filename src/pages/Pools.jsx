import { motion } from 'framer-motion';
import { FaUsers, FaTrophy, FaClock, FaCoins } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { usePools } from '../hooks/usePools';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

function Pools() {
  const { darkMode } = useTheme();
  const {
    activePools,
    poolHistory,
    userPools,
    joinPool,
    loading,
    joiningPool
  } = usePools();

  if (loading) {
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
          Spillover Pools
        </h1>
      </div>

      {/* Active Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activePools.map((pool) => (
          <div
            key={pool.id}
            className={`rounded-xl p-6 ${
              darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {pool.name}
                </h3>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Min. Investment: ${pool.minInvestment}
                </p>
              </div>
              <StatusBadge status={pool.status} text={pool.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <FaCoins className="text-primary-600 mr-2" />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Prize
                  </p>
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${pool.totalPrize}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FaUsers className="text-primary-600 mr-2" />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Participants
                  </p>
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {pool.participants}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Prize Distribution
              </h4>
              <div className="space-y-2">
                {pool.distribution.map((tier) => (
                  <div key={tier.rank} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaTrophy
                        className={`mr-2 ${
                          tier.rank === 1
                            ? 'text-yellow-500'
                            : tier.rank === 2
                            ? 'text-gray-400'
                            : tier.rank === 3
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Rank {tier.rank}
                      </span>
                    </div>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tier.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => joinPool(pool.id)}
              disabled={joiningPool || userPools.includes(pool.id)}
              className={`w-full py-2 rounded-lg ${
                userPools.includes(pool.id)
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } transition-all duration-300`}
            >
              {userPools.includes(pool.id) ? 'Joined' : 'Join Pool'}
            </button>
          </div>
        ))}
      </div>

      {/* Pool History */}
      <div
        className={`rounded-xl p-6 ${
          darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
        }`}
      >
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Pool History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">Pool Name</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Prize</th>
                <th className="text-left py-3">Position</th>
                <th className="text-left py-3">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {poolHistory.map((history) => (
                <tr key={history.id}>
                  <td className="py-3">{history.poolName}</td>
                  <td className="py-3">{history.date}</td>
                  <td className="py-3">${history.prize}</td>
                  <td className="py-3">{history.position}</td>
                  <td className="py-3 text-green-600">${history.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default Pools;