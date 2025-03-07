import { motion } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { useInvestments } from '../hooks/useInvestments';
import { usePools } from '../hooks/usePools';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const { user } = useAuthContext();
  const { activeInvestments, loading: investmentsLoading } = useInvestments();
  const { activePools, loading: poolsLoading } = usePools();

  if (investmentsLoading || poolsLoading) {
    return <LoadingSpinner />;
  }

  const totalInvestment = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = activeInvestments.reduce((sum, inv) => sum + inv.earnings, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Investment</h3>
          <p className="text-2xl font-bold text-primary-600">
            ${totalInvestment.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totalEarnings.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Investments</h3>
          <p className="text-2xl font-bold text-secondary-600">
            {activeInvestments.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Pool Status</h3>
          <p className="text-2xl font-bold text-blue-600">
            {activePools.length ? `${activePools.length} Active` : 'None'}
          </p>
        </div>
      </div>

      {/* Active Investments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Active Investments</h2>
        {activeInvestments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="py-3">Plan</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Earnings</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeInvestments.map((investment) => (
                  <tr key={investment.id}>
                    <td className="py-2">{investment.plan}</td>
                    <td className="py-2">${investment.amount}</td>
                    <td className="py-2">${investment.earnings}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No active investments
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Dashboard;