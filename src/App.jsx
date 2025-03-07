import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Network from './pages/Network';
import Pools from './pages/Pools';
import Wallet from './pages/Wallet';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import InvestmentPlans from './pages/admin/InvestmentPlans';
import { useAuthContext } from './contexts/AuthContext';

function App() {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/investments" element={<div>Investments</div>} />
          <Route path="/network" element={<Network />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="investments" element={<InvestmentPlans />} />
          <Route path="pools" element={<div>Pool Management</div>} />
          <Route path="finance" element={<div>Finance Management</div>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;