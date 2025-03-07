import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg ${
        darkMode 
          ? 'bg-dark-card shadow-neo-dark' 
          : 'bg-white shadow-neo-light'
      }`}
    >
      {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
    </button>
  );
}

export default ThemeToggle;