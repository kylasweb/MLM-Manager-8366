import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import useAuth from '../hooks/useAuth';
import { trackPagePerformance } from '../utils/performanceMonitor';
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

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
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
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