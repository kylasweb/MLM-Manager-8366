import { Suspense, lazy, memo, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import useAuth from './hooks/useAuth';

// Import Login directly to avoid lazy loading issues
import Login from './pages/Login';

// Optimized component imports with better code splitting
const Layout = lazy(() => import('./components/Layout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));

// Lazy load components with prefetch and chunking strategy
const Landing = lazy(() => import(/* webpackPrefetch: true */ './pages/Landing'));
const Register = lazy(() => import('./pages/Register'));

// Group dashboard-related pages in the same chunk
const Dashboard = lazy(() => 
  import('./pages/Dashboard').then(module => {
    // Prefetch other common pages after dashboard loads
    import('./pages/Profile');
    import('./pages/Investments');
    return module;
  })
);

// Group related features together
const networkFeatures = {
  Network: lazy(() => import('./pages/Network')),
  Referrals: lazy(() => import('./pages/Referrals')),
};

const financialFeatures = {
  Pools: lazy(() => import('./pages/Pools')),
  Wallet: lazy(() => import('./pages/Wallet')),
  Investments: lazy(() => import('./pages/Investments')), 
  Profile: lazy(() => import('./pages/Profile')),
};

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// Memoized app component for better performance
const App = memo(() => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState(location);

  // Prefetch components based on authentication status and current route
  useEffect(() => {
    if (location !== prevLocation) {
      setPrevLocation(location);
      
      // Prefetch likely next routes based on current location
      if (location.pathname === '/') {
        // From landing, users likely go to login
        import('./pages/Login');
      } else if (location.pathname === '/login' && !isAuthenticated) {
        // From login, might go to register
        import('./pages/Register');
      } else if (location.pathname === '/dashboard' && isAuthenticated) {
        // From dashboard, likely to check profile or investments
        import('./pages/Profile');
        import('./pages/Investments');
      }
    }
  }, [location, prevLocation, isAuthenticated]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route element={
              <Suspense fallback={<LoadingSpinner />}>
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              </Suspense>
            }>
              <Route path="/dashboard" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="/investments" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <financialFeatures.Investments />
                </Suspense>
              } />
              <Route path="/network" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <networkFeatures.Network />
                </Suspense>
              } />
              <Route path="/pools" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <financialFeatures.Pools />
                </Suspense>
              } />
              <Route path="/wallet" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <financialFeatures.Wallet />
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <financialFeatures.Profile />
                </Suspense>
              } />
              <Route path="/referrals" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <networkFeatures.Referrals />
                </Suspense>
              } />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              </Suspense>
            }>
              <Route index element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard />
                </Suspense>
              } />
            </Route>
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  );
});

// Display name for debugging
App.displayName = 'App';

export default App;