import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const defaultPlans = [
  {
    id: 1,
    name: 'Starter',
    price: 100,
    bv: 100,
    duration: 30,
    dailyReturn: 0.5,
    features: ['5% Referral Bonus', 'Daily ROI 0.5%', 'Access to Daily Pool']
  },
  {
    id: 2,
    name: 'Professional',
    price: 200,
    bv: 200,
    duration: 60,
    dailyReturn: 0.8,
    features: ['8% Referral Bonus', 'Daily ROI 0.8%', 'Access to All Pools']
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 300,
    bv: 300,
    duration: 90,
    dailyReturn: 1,
    features: ['10% Referral Bonus', 'Daily ROI 1%', 'Priority Pool Access']
  }
];

function InvestmentPlans() {
  const { darkMode } = useTheme();
  const [plans, setPlans] = useState(defaultPlans);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (planId) => {
    setPlans(plans.filter(plan => plan.id !== planId));
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
        <button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            darkMode
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          <FaPlus />
          <span>Add Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-xl p-6 ${
              darkMode
                ? 'bg-dark-card shadow-neo-dark'
                : 'bg-white shadow-neo-light'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p className="text-3xl font-bold text-primary-600">${plan.price}</p>
              <p className="text-sm">Entry Fee</p>
            </div>

            <div className="space-y-2">
              <p>BV Points: {plan.bv}</p>
              <p>Duration: {plan.duration} days</p>
              <p>Daily Return: {plan.dailyReturn}%</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default InvestmentPlans;