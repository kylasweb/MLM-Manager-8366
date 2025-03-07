import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

function LoadingSpinner() {
  const { darkMode } = useTheme();
  
  return (
    <div className="flex justify-center items-center p-4">
      <motion.div
        className={`w-8 h-8 border-4 rounded-full ${
          darkMode
            ? 'border-gray-600 border-t-white'
            : 'border-gray-200 border-t-primary-600'
        }`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export default LoadingSpinner;