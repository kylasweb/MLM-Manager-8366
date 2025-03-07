import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun, FaChartLine, FaUsers, FaWallet, FaLock, FaMobile, FaHeadset } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

function Landing() {
  const { darkMode, toggleDarkMode } = useTheme();

  const features = [
    {
      icon: FaChartLine,
      title: 'Smart Binary System',
      description: 'Advanced 5-level binary matrix structure with intelligent spillover management'
    },
    {
      icon: FaUsers,
      title: 'Dynamic Pool System',
      description: 'Participate in daily and weekly pools with automated reward distribution'
    },
    {
      icon: FaWallet,
      title: 'Secure Transactions',
      description: 'Multi-currency support with instant deposits and withdrawals'
    },
    {
      icon: FaLock,
      title: 'Enhanced Security',
      description: 'State-of-the-art encryption and multi-factor authentication'
    },
    {
      icon: FaMobile,
      title: 'Mobile Optimized',
      description: 'Fully responsive design for seamless mobile experience'
    },
    {
      icon: FaHeadset,
      title: '24/7 Support',
      description: 'Round-the-clock customer support and assistance'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: 100,
      features: [
        '5% Referral Bonus',
        'Daily ROI 0.5%',
        'Access to Daily Pool',
        'Basic Support'
      ]
    },
    {
      name: 'Professional',
      price: 200,
      features: [
        '8% Referral Bonus',
        'Daily ROI 0.8%',
        'Access to All Pools',
        'Priority Support'
      ]
    },
    {
      name: 'Enterprise',
      price: 300,
      features: [
        '10% Referral Bonus',
        'Daily ROI 1%',
        'Priority Pool Access',
        'VIP Support'
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-dark-bg' : 'bg-gray-100'}`}>
      <nav className="p-4 fixed w-full top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-dark-bg/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">Zocial MLM</h1>
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
              }`}
            >
              {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
            </button>
            <Link
              to="/login"
              className={`px-6 py-2 rounded-lg ${
                darkMode
                  ? 'bg-dark-card text-white shadow-neo-dark hover:shadow-neo-inner-dark'
                  : 'bg-white text-primary-600 shadow-neo-light hover:shadow-neo-inner-light'
              } transition-all duration-300`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-300"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <h2 className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to Zocial MLM
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Join our revolutionary MLM platform and unlock unlimited earning potential through our innovative binary matrix system and spillover pools.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center space-x-4"
            >
              <Link
                to="/register"
                className="px-8 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-300"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className={`px-8 py-3 rounded-lg ${
                  darkMode
                    ? 'bg-dark-card text-white shadow-neo-dark hover:shadow-neo-inner-dark'
                    : 'bg-white text-primary-600 shadow-neo-light hover:shadow-neo-inner-light'
                } transition-all duration-300`}
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-dark-card">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className={`text-4xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl ${
                    darkMode ? 'bg-dark-bg shadow-neo-dark' : 'bg-white shadow-neo-light'
                  }`}
                >
                  <feature.icon className={`w-12 h-12 mb-4 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Plans Section */}
        <section id="plans" className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className={`text-4xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Investment Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl ${
                    darkMode ? 'bg-dark-card shadow-neo-dark' : 'bg-white shadow-neo-light'
                  }`}
                >
                  <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary-600">${plan.price}</span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/entry</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className="mt-6 block w-full text-center px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 ${darkMode ? 'bg-dark-card' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              © 2024 Zocial MLM. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Landing;