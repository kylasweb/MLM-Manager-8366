import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import useAuth from '../hooks/useAuth';
import { trackPagePerformance } from '../utils/performanceMonitor';
import { useEffect } from 'react';

function Layout() {
  const { darkMode } = useTheme();
  const { isAdmin } = useAuth();

  // Track performance
  const endTracking = trackPagePerformance('Layout');
  
  // Use effect for cleanup
  useEffect(() => {
    return () => {
      endTracking();
    };
  }, [endTracking]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-dark-bg' : 'bg-gray-100'}`}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
      
      {/* Development tools - only shown in non-production */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 left-4 z-50">
          <button 
            onClick={() => window.location.href = '/reset.html'} 
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm mr-2"
          >
            Reset App
          </button>
        </div>
      )}
    </div>
  );
}

export default Layout;