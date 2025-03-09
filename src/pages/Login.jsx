import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

// Debug flag
const DEBUG = true;

function Login() {
  if (DEBUG) console.log('Login component rendering');

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated - use callback to avoid unnecessary rerenders
  useEffect(() => {
    if (DEBUG) console.log('Login useEffect - auth check', { isAuthenticated });
    
    if (isAuthenticated) {
      if (DEBUG) console.log('User authenticated, navigating to dashboard');
      // Use setTimeout to avoid potential navigation issues
      setTimeout(() => navigate('/dashboard'), 0);
    }
  }, [isAuthenticated, navigate]);

  // Memoize handler to avoid recreation on every render
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (DEBUG) console.log('Login form submitted');
    
    setIsLoading(true);
    try {
      if (DEBUG) console.log('Attempting login with:', { email: credentials.email });
      await login(credentials);
      // Navigation will be handled by the useEffect
      if (DEBUG) console.log('Login successful');
    } catch (err) {
      console.error('Login failed:', err);
      toast.error(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [credentials, login]);

  // Safe input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  }, []);

  // Simple check if component is rendering
  useEffect(() => {
    if (DEBUG) console.log('Login component mounted');
    
    return () => {
      if (DEBUG) console.log('Login component unmounting');
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Sign in to your account
        </h2>
        
        {error && <div className="text-red-500 text-center">{error}</div>}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div className="text-center mt-4">
            <Link to="/register" className="text-primary-600 hover:text-primary-700">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;