import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaChartLine, 
  FaUsers, 
  FaWallet, 
  FaUserCircle, 
  FaShareAlt,
  FaLayerGroup
} from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/investments', icon: <FaChartLine />, label: 'Investments' },
    { path: '/network', icon: <FaUsers />, label: 'Network' },
    { path: '/pools', icon: <FaLayerGroup />, label: 'Pools' },
    { path: '/wallet', icon: <FaWallet />, label: 'Wallet' },
    { path: '/referrals', icon: <FaShareAlt />, label: 'Referrals' },
    { path: '/profile', icon: <FaUserCircle />, label: 'Profile' },
  ];

  // Add admin items if user is admin
  if (user?.role === 'admin') {
    navItems.push(
      { path: '/admin', icon: <FaUserCircle />, label: 'Admin' }
    );
  }

  return (
    <div 
      className={`bg-white shadow-md h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <h1 className="text-xl font-bold text-primary-600">MLM Platform</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="mt-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 ${
                  collapsed ? 'justify-center' : 'px-4'
                } ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;