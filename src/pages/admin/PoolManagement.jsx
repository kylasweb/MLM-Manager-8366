import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import PoolFormModal from '../../components/pools/PoolFormModal';
import { toast } from 'react-toastify';

function PoolManagement() {
  const { darkMode } = useTheme();
  const { pools, createPool, updatePool, deletePool, poolsLoading } = useAdmin();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (poolsLoading) {
    return <LoadingSpinner />;
  }

  const handleCreatePool = () => {
    setSelectedPool(null);
    setIsModalOpen(true);
  };

  const handleEditPool = (pool) => {
    setSelectedPool(pool);
    setIsModalOpen(true);
  };

  const handleDeletePool = (pool) => {
    setSelectedPool(pool);
    setShowConfirmDelete(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedPool) {
        await updatePool(selectedPool.id, formData);
        toast.success('Pool updated successfully');
      } else {
        await createPool(formData);
        toast.success('Pool created successfully');
      }
      setIsModalOpen(false);
      setSelectedPool(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save pool');
    }
  };

  const confirmDelete = async () => {
    try {
      await deletePool(selectedPool.id);
      toast.success('Pool deleted successfully');
      setShowConfirmDelete(false);
      setSelectedPool(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete pool');
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
          Pool Management
        </h1>
        <button
          onClick={handleCreatePool}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <FaPlus />
          <span>Create Pool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className={`rounded-xl p-6 ${
              darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {pool.name}
                </h3>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Prize Pool: ${pool.totalPrize}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditPool(pool)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeletePool(pool)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    pool.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {pool.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Participants</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {pool.participants}/{pool.maxParticipants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Duration</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {pool.duration} hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Entry Fee</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  ${pool.entryFee}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Start Date</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {new Date(pool.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PoolFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPool(null);
        }}
        onSubmit={handleSubmit}
        pool={selectedPool}
      />

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDelete}
        title="Delete Pool"
        message="Are you sure you want to delete this pool? This action cannot be undone."
      />
    </motion.div>
  );
}

export default PoolManagement;