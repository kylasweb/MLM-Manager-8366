import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import LoadingSpinner from '../../components/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const { stats, loading, refresh } = useAdminDashboard();

  if (loading) {
    return <LoadingSpinner />;
  }

  const investmentChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Investments',
        data: stats.investmentTrend || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const userActivityData = {
    labels: ['Sign-ups', 'Active Users', 'Investments', 'Withdrawals'],
    datasets: [
      {
        label: 'Today\'s Activity',
        data: stats.todayActivity || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Admin Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-primary-600">
            {stats.totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth}% from last week
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Investments</h3>
          <p className="text-2xl font-bold text-green-600">
            ${stats.totalInvestments.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {stats.investmentGrowth > 0 ? '+' : ''}{stats.investmentGrowth}% from last month
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Pools</h3>
          <p className="text-2xl font-bold text-secondary-600">
            {stats.activePools.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {stats.poolUtilization}% utilization
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Withdrawals</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingWithdrawals.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            ${stats.totalPendingAmount.toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Investment Trend</h2>
          <Line data={investmentChartData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Today's Activity</h2>
          <Bar data={userActivityData} />
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">System Health</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              stats.systemHealth.status === 'operational' 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {stats.systemHealth.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Updated</span>
            <span className="text-gray-600">
              {new Date(stats.systemHealth.lastUpdated).toLocaleString()}
            </span>
          </div>
          {stats.systemHealth.issues.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Active Issues</h3>
              <ul className="space-y-2">
                {stats.systemHealth.issues.map((issue, index) => (
                  <li key={index} className="text-red-600">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        {stats.recentActivities.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-semibold">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No recent activities
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AdminDashboard;