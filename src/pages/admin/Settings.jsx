import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaCog } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

function Settings() {
  const { darkMode } = useTheme();
  const [settings, setSettings] = useState({
    appName: 'Zocial MLM',
    description: 'Revolutionary MLM Platform',
    contactEmail: 'support@zocialmlm.com',
    poolSettings: {
      minParticipants: 10,
      maxParticipants: 100,
      dailyPoolDuration: 24,
      weeklyPoolDuration: 168,
    },
    investmentSettings: {
      minInvestment: 100,
      maxInvestment: 10000,
      referralBonus: 10,
      spilloverBonus: 5,
    },
    withdrawalSettings: {
      minWithdrawal: 50,
      maxWithdrawal: 5000,
      processingTime: 24,
      fee: 2.5,
    },
    landingPage: {
      heroTitle: 'Welcome to Zocial MLM',
      heroSubtitle: 'Join our revolutionary MLM platform',
      features: [
        {
          title: 'Smart Binary System',
          description: 'Advanced 5-level binary matrix structure'
        },
        {
          title: 'Dynamic Pool System',
          description: 'Daily and weekly pools with automated rewards'
        },
      ],
    },
  });

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // API call to save settings
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
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
          Platform Settings
        </h1>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <FaSave />
          <span>Save Changes</span>
        </button>
      </div>

      {/* General Settings */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          General Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Platform Name
            </label>
            <input
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* Pool Settings */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Pool Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Minimum Participants
            </label>
            <input
              type="number"
              value={settings.poolSettings.minParticipants}
              onChange={(e) => handleChange('poolSettings', 'minParticipants', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Maximum Participants
            </label>
            <input
              type="number"
              value={settings.poolSettings.maxParticipants}
              onChange={(e) => handleChange('poolSettings', 'maxParticipants', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Investment Settings */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Investment Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Minimum Investment ($)
            </label>
            <input
              type="number"
              value={settings.investmentSettings.minInvestment}
              onChange={(e) => handleChange('investmentSettings', 'minInvestment', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Maximum Investment ($)
            </label>
            <input
              type="number"
              value={settings.investmentSettings.maxInvestment}
              onChange={(e) => handleChange('investmentSettings', 'maxInvestment', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Withdrawal Settings */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Withdrawal Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Minimum Withdrawal ($)
            </label>
            <input
              type="number"
              value={settings.withdrawalSettings.minWithdrawal}
              onChange={(e) => handleChange('withdrawalSettings', 'minWithdrawal', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Maximum Withdrawal ($)
            </label>
            <input
              type="number"
              value={settings.withdrawalSettings.maxWithdrawal}
              onChange={(e) => handleChange('withdrawalSettings', 'maxWithdrawal', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Landing Page Settings */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Landing Page Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Hero Title
            </label>
            <input
              type="text"
              value={settings.landingPage.heroTitle}
              onChange={(e) => handleChange('landingPage', 'heroTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Hero Subtitle
            </label>
            <input
              type="text"
              value={settings.landingPage.heroSubtitle}
              onChange={(e) => handleChange('landingPage', 'heroSubtitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Settings;