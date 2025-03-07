import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import {
  FaHome,
  FaMoneyBillWave,
  FaNetworkWired,
  FaSwimmingPool,
  FaWallet,
  FaUsers,
  FaCog
} from 'react-icons/fa';

function Sidebar() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';

  const userLinks = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/investments', icon: FaMoneyBillWave, label: 'Investments' },
    { to: '/network', icon: FaNetworkWired, label: 'Network' },
    { to: '/pools', icon: FaSwimmingPool, label: 'Pools' },
    { to: '/wallet', icon: FaWallet, label: 'Wallet' },
  ];

  const adminLinks = [
    { to: '/admin', icon: FaHome, label: 'Dashboard' },
    { to: '/admin/users', icon: FaUsers, label: 'Users' },
    { to: '/admin/investments', icon: FaMoneyBillWave, label: 'Investment Plans' },
    { to: '/admin/pools', icon: FaSwimmingPool, label: 'Pool Management' },
    { to: '/admin/finance', icon: FaCog, label: 'Finance Management' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center p-2 text-base font-normal rounded-lg ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <link.icon className="w-6 h-6 transition duration-75" />
                <span className="ml-3">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;