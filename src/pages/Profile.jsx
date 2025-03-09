import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';

function Profile() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    // Implement profile update logic
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    // Implement password update logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Profile Settings
      </h1>

      {/* Profile Information */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Personal Information
          </h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  disabled
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg">{user?.name}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-lg capitalize">{user?.role}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-lg">{new Date(user?.lastLogin || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Security Settings
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaShieldAlt className="text-2xl text-primary-600" />
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Two-Factor Authentication
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.twoFactorEnabled}
              onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;