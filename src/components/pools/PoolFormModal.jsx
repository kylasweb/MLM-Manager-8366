import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

function PoolFormModal({ isOpen, onClose, onSubmit, pool = null }) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    totalPrize: '',
    maxParticipants: '',
    duration: '',
    startDate: '',
    description: '',
    entryFee: '',
    rules: '',
    status: 'pending',
    enableSpillover: false,
    spilloverRules: {
      direction: 'weak_leg',
      maxDepth: 5,
      distributionRatio: 50,
      qualificationCriteria: {
        minDirectReferrals: 2,
        minBusinessVolume: 1000
      }
    },
    autoBalance: false,
    carryForward: false,
    flushCriteria: {
      enabled: false,
      threshold: 10000,
      period: 'monthly'
    }
  });

  useEffect(() => {
    if (pool) {
      setFormData({
        name: pool.name || '',
        totalPrize: pool.totalPrize || '',
        maxParticipants: pool.maxParticipants || '',
        duration: pool.duration || '',
        startDate: pool.startDate || '',
        description: pool.description || '',
        entryFee: pool.entryFee || '',
        rules: pool.rules || '',
        status: pool.status || 'pending',
        enableSpillover: pool.enableSpillover || false,
        spilloverRules: {
          direction: pool.spilloverRules?.direction || 'weak_leg',
          maxDepth: pool.spilloverRules?.maxDepth || 5,
          distributionRatio: pool.spilloverRules?.distributionRatio || 50,
          qualificationCriteria: {
            minDirectReferrals: pool.spilloverRules?.qualificationCriteria?.minDirectReferrals || 2,
            minBusinessVolume: pool.spilloverRules?.qualificationCriteria?.minBusinessVolume || 1000
          }
        },
        autoBalance: pool.autoBalance || false,
        carryForward: pool.carryForward || false,
        flushCriteria: {
          enabled: pool.flushCriteria?.enabled || false,
          threshold: pool.flushCriteria?.threshold || 10000,
          period: pool.flushCriteria?.period || 'monthly'
        }
      });
    }
  }, [pool]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpilloverChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      spilloverRules: {
        ...prev.spilloverRules,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleQualificationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      spilloverRules: {
        ...prev.spilloverRules,
        qualificationCriteria: {
          ...prev.spilloverRules.qualificationCriteria,
          [name]: Number(value)
        }
      }
    }));
  };

  const handleFlushChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      flushCriteria: {
        ...prev.flushCriteria,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-2xl rounded-xl ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          } p-6 shadow-xl overflow-y-auto max-h-[90vh]`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>

          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {pool ? 'Edit Pool' : 'Create New Pool'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Pool Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Total Prize ($)
                </label>
                <input
                  type="number"
                  name="totalPrize"
                  value={formData.totalPrize}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Max Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                  min="1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Duration (hours)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Rules
              </label>
              <textarea
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                required
                rows="3"
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="border-t pt-6">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Spillover Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableSpillover"
                    name="enableSpillover"
                    checked={formData.enableSpillover}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      enableSpillover: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="enableSpillover" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Enable Spillover
                  </label>
                </div>

                {formData.enableSpillover && (
                  <div className="space-y-4 pl-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Spillover Direction
                      </label>
                      <select
                        name="direction"
                        value={formData.spilloverRules.direction}
                        onChange={handleSpilloverChange}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="weak_leg">Weak Leg</option>
                        <option value="strong_leg">Strong Leg</option>
                        <option value="alternate">Alternate</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Maximum Spillover Depth
                      </label>
                      <input
                        type="number"
                        name="maxDepth"
                        value={formData.spilloverRules.maxDepth}
                        onChange={handleSpilloverChange}
                        min="1"
                        max="10"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Distribution Ratio (%)
                      </label>
                      <input
                        type="number"
                        name="distributionRatio"
                        value={formData.spilloverRules.distributionRatio}
                        onChange={handleSpilloverChange}
                        min="0"
                        max="100"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Qualification Criteria
                      </h4>
                      <div>
                        <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Minimum Direct Referrals
                        </label>
                        <input
                          type="number"
                          name="minDirectReferrals"
                          value={formData.spilloverRules.qualificationCriteria.minDirectReferrals}
                          onChange={handleQualificationChange}
                          min="0"
                          className={`w-full px-3 py-2 rounded-lg border ${
                            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Minimum Business Volume
                        </label>
                        <input
                          type="number"
                          name="minBusinessVolume"
                          value={formData.spilloverRules.qualificationCriteria.minBusinessVolume}
                          onChange={handleQualificationChange}
                          min="0"
                          className={`w-full px-3 py-2 rounded-lg border ${
                            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoBalance"
                          name="autoBalance"
                          checked={formData.autoBalance}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            autoBalance: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <label htmlFor="autoBalance" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Auto Balance
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="carryForward"
                          name="carryForward"
                          checked={formData.carryForward}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            carryForward: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <label htmlFor="carryForward" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Carry Forward
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="flushEnabled"
                          name="enabled"
                          checked={formData.flushCriteria.enabled}
                          onChange={handleFlushChange}
                          className="mr-2"
                        />
                        <label htmlFor="flushEnabled" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Enable Flush Criteria
                        </label>
                      </div>

                      {formData.flushCriteria.enabled && (
                        <div className="space-y-4 pl-4">
                          <div>
                            <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                              Flush Threshold
                            </label>
                            <input
                              type="number"
                              name="threshold"
                              value={formData.flushCriteria.threshold}
                              onChange={handleFlushChange}
                              min="0"
                              className={`w-full px-3 py-2 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                              Flush Period
                            </label>
                            <select
                              name="period"
                              value={formData.flushCriteria.period}
                              onChange={handleFlushChange}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              >
                {pool ? 'Update Pool' : 'Create Pool'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PoolFormModal; 