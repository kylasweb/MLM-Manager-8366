import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaBitcoin, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { usePayment } from '../../hooks/usePayment';
import LoadingSpinner from '../LoadingSpinner';

function PaymentModal({ isOpen, onClose, amount, onSuccess }) {
  const { darkMode } = useTheme();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const { handleStripePayment, handleCryptoPayment, paymentStatus, loading } = usePayment();

  const handlePayment = async () => {
    try {
      if (paymentMethod === 'card') {
        const clientSecret = await handleStripePayment(amount);
        // Handle Stripe payment flow
      } else if (paymentMethod === 'crypto') {
        const { address } = await handleCryptoPayment('BTC');
        // Handle crypto payment flow
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-md p-6 rounded-xl ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Payment Method
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-opacity-80 ${
                darkMode ? 'hover:bg-dark-bg' : 'hover:bg-gray-100'
              }`}
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-lg flex items-center space-x-4 ${
                paymentMethod === 'card'
                  ? 'bg-primary-600 text-white'
                  : darkMode
                  ? 'bg-dark-bg text-white hover:bg-opacity-80'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <FaCreditCard className="w-6 h-6" />
              <span>Credit/Debit Card</span>
            </button>

            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`w-full p-4 rounded-lg flex items-center space-x-4 ${
                paymentMethod === 'crypto'
                  ? 'bg-primary-600 text-white'
                  : darkMode
                  ? 'bg-dark-bg text-white hover:bg-opacity-80'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <FaBitcoin className="w-6 h-6" />
              <span>Cryptocurrency</span>
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePayment}
              disabled={!paymentMethod || loading}
              className={`w-full py-3 rounded-lg ${
                !paymentMethod || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              } text-white`}
            >
              {loading ? <LoadingSpinner /> : `Pay $${amount}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PaymentModal;