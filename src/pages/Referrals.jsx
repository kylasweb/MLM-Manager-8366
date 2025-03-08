import { motion } from 'framer-motion';
import { FaUsers, FaLink, FaCopy, FaChartBar } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

function Referrals() {
  const { darkMode } = useTheme();
  const referralLink = `${window.location.origin}/?ref=USER123`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const referralStats = {
    totalReferrals: 15,
    activeReferrals: 8,
    totalEarnings: 1250.00,
    pendingCommissions: 250.00
  };

  const referralHistory = [
    {
      id: 1,
      user: 'John Doe',
      level: 1,
      date: '2024-03-15',
      status: 'active',
      earnings: 150.00
    },
    // Add more referral history items
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Referral Program
      </h1>

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
            value={referralLink}
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
                {referralStats.totalReferrals}
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
                {referralStats.activeReferrals}
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
                ${referralStats.totalEarnings}
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
                ${referralStats.pendingCommissions}
              </h3>
            </div>
            <FaChartBar className="text-primary-600 text-3xl" />
          </div>
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
              {referralHistory.map((referral) => (
                <tr key={referral.id}>
                  <td className="py-3">{referral.user}</td>
                  <td className="py-3">Level {referral.level}</td>
                  <td className="py-3">{referral.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      referral.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="py-3 text-green-600">${referral.earnings}</td>
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