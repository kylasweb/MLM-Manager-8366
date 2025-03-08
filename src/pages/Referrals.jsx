import { motion } from 'framer-motion';
import { FaUsers, FaLink, FaCopy, FaChartBar } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { 
  useGetReferralStatsQuery, 
  useGetReferralHistoryQuery, 
  useGetReferralLinkQuery,
  useGetReferralCommissionsQuery
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Referrals() {
  const { darkMode } = useTheme();
  const { data: referralStats, isLoading: statsLoading } = useGetReferralStatsQuery();
  const { data: referralHistory, isLoading: historyLoading } = useGetReferralHistoryQuery();
  const { data: referralLink, isLoading: linkLoading } = useGetReferralLinkQuery();
  const { data: commissions, isLoading: commissionsLoading } = useGetReferralCommissionsQuery();

  const copyToClipboard = () => {
    if (referralLink?.link) {
      navigator.clipboard.writeText(referralLink.link);
      toast.success('Referral link copied to clipboard!');
    }
  };

  if (statsLoading || historyLoading || linkLoading || commissionsLoading) {
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
          Referral Program
        </h1>
        <div className={`px-4 py-2 rounded-lg ${
          darkMode ? 'bg-dark-card' : 'bg-white'
        } shadow-neo-light dark:shadow-neo-dark`}>
          <span className="text-sm text-gray-500">Commission Rate:</span>
          <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {referralStats?.commissionRate || 0}%
          </span>
        </div>
      </div>

      {/* Referral Link */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <div className="flex items-center space-x-4 mb-4">
          <FaLink className="text-2xl text-primary-600" />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Referral Link
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={referralLink?.link || ''}
            readOnly
            className="flex-1 px-4 py-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 flex items-center space-x-2"
          >
            <FaCopy />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Referrals
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {referralStats?.totalReferrals || 0}
              </h3>
            </div>
            <FaUsers className="text-primary-600 text-3xl" />
          </div>
        </div>

        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Referrals
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {referralStats?.activeReferrals || 0}
              </h3>
            </div>
            <FaChartBar className="text-primary-600 text-3xl" />
          </div>
        </div>

        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Earnings
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${commissions?.totalEarnings?.toFixed(2) || '0.00'}
              </h3>
            </div>
            <FaChartBar className="text-primary-600 text-3xl" />
          </div>
        </div>

        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Commissions
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${commissions?.pendingCommissions?.toFixed(2) || '0.00'}
              </h3>
            </div>
            <FaChartBar className="text-primary-600 text-3xl" />
          </div>
        </div>
      </div>

      {/* Commission Levels */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Commission Structure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {referralStats?.commissionLevels?.map((level, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Level {level.level}
                </span>
                <span className="text-primary-600 font-bold">
                  {level.percentage}%
                </span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {level.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Referral History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">User</th>
                <th className="text-left py-3">Level</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {referralHistory?.map((referral) => (
                <tr key={referral.id}>
                  <td className="py-3">{referral.username}</td>
                  <td className="py-3">Level {referral.level}</td>
                  <td className="py-3">{new Date(referral.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      referral.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="py-3 text-green-600">${referral.earnings.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission History */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Commission History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">From</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {commissions?.history?.map((commission) => (
                <tr key={commission.id}>
                  <td className="py-3">{new Date(commission.date).toLocaleDateString()}</td>
                  <td className="py-3">{commission.type}</td>
                  <td className="py-3">{commission.from}</td>
                  <td className="py-3 text-green-600">${commission.amount.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      commission.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commission.status}
                    </span>
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

export default Referrals;