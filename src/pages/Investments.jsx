import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaHistory, FaMoneyBill } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useInvestments } from '../hooks/useInvestments';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

function Investments() {
  const { darkMode } = useTheme();
  const {
    plans,
    activeInvestments,
    investmentHistory,
    invest,
    loading,
    purchasing
  } = useInvestments();

  const [selectedPlan, setSelectedPlan] = useState(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleInvest = async (planId) => {
    try {
      await invest(planId);
    } catch (error) {
      console.error('Investment failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Investment Plans
        </h1>
      </div>

      {/* Investment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Invested
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${activeInvestments.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
              </h3>
            </div>
            <FaMoneyBill className="text-primary-600 text-3xl" />
          </div>
        </div>

        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Investments
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeInvestments.length}
              </h3>
            </div>
            <FaChartLine className="text-primary-600 text-3xl" />
          </div>
        </div>

        <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Returns
              </p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${activeInvestments.reduce((sum, inv) => sum + inv.earnings, 0).toFixed(2)}
              </h3>
            </div>
            <FaHistory className="text-primary-600 text-3xl" />
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}
          >
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {plan.name}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-primary-600">${plan.price}</span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>/entry</span>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleInvest(plan.id)}
              disabled={purchasing}
              className="w-full py-2 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-300"
            >
              Invest Now
            </button>
          </div>
        ))}
      </div>

      {/* Active Investments */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Active Investments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">Plan</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Daily ROI</th>
                <th className="text-left py-3">Total Earnings</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeInvestments.map((investment) => (
                <tr key={investment.id}>
                  <td className="py-3">{investment.plan}</td>
                  <td className="py-3">${investment.amount}</td>
                  <td className="py-3">{investment.dailyRoi}%</td>
                  <td className="py-3 text-green-600">${investment.earnings}</td>
                  <td className="py-3">
                    <StatusBadge status="success" text="Active" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment History */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Investment History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-3">Plan</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Total Return</th>
                <th className="text-left py-3">Duration</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {investmentHistory.map((history) => (
                <tr key={history.id}>
                  <td className="py-3">{history.plan}</td>
                  <td className="py-3">${history.amount}</td>
                  <td className="py-3 text-green-600">${history.totalReturn}</td>
                  <td className="py-3">{history.duration} days</td>
                  <td className="py-3">
                    <StatusBadge status="success" text="Completed" />
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

export default Investments;