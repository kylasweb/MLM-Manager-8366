import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const defaultUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    plan: 'Professional',
    referralCount: 5,
    totalEarnings: 1250.00,
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'inactive',
    plan: 'Starter',
    referralCount: 2,
    totalEarnings: 450.00,
    joinDate: '2024-02-01'
  }
];

function UserManagement() {
  const { darkMode } = useTheme();
  const [users, setUsers] = useState(defaultUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          User Management
        </h1>
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            darkMode
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          <FaUserPlus />
          <span>Add User</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full rounded-lg ${
              darkMode
                ? 'bg-dark-card text-white border-dark-border'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-primary-500`}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg ${
            darkMode
              ? 'bg-dark-card text-white border-dark-border'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:outline-none focus:ring-2 focus:ring-primary-500`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={`rounded-xl overflow-hidden ${
        darkMode ? 'bg-dark-card' : 'bg-white'
      } shadow-neo-light dark:shadow-neo-dark`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-dark-card' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </div>
                        <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.plan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.referralCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${user.totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      <FaEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default UserManagement;