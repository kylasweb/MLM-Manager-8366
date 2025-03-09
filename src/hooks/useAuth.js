import { useSelector, useDispatch } from 'react-redux';
import { 
  login as loginAction, 
  logout as logoutAction,
  initialize as initializeAction,
  updateLastActivity,
  checkSession
} from '../store/authSlice';
import { useEffect } from 'react';
import { setupSessionChecker } from '../store/store';

// Initialize session checker
const sessionChecker = setupSessionChecker();

/**
 * Custom hook to access auth state and actions from Redux
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const { 
    user, 
    token, 
    loading, 
    error, 
    isAuthenticated, 
    lastActivity, 
    loginAttempts 
  } = useSelector(state => state.auth);

  useEffect(() => {
    // Initialize auth state on first load
    dispatch(initializeAction());

    // Start session checker
    if (isAuthenticated) {
      sessionChecker.startSessionCheck();
    }

    return () => {
      // Clean up session checker on unmount
      sessionChecker.stopSessionCheck();
    };
  }, [dispatch, isAuthenticated]);

  // Update activity timestamp when the user interacts with the app
  useEffect(() => {
    if (isAuthenticated) {
      const handleActivity = () => {
        dispatch(updateLastActivity());
      };

      // Attach event listeners for user activity
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);

      return () => {
        // Clean up event listeners
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
      };
    }
  }, [dispatch, isAuthenticated]);

  // Login function
  const login = async (credentials) => {
    try {
      const resultAction = await dispatch(loginAction(credentials));
      if (loginAction.fulfilled.match(resultAction)) {
        // Start session checker on successful login
        sessionChecker.startSessionCheck();
        return resultAction.payload.user;
      } else {
        throw new Error(resultAction.payload?.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = (message) => {
    dispatch(logoutAction(message));
    sessionChecker.stopSessionCheck();
  };

  // Function to check if session is valid
  const validateSession = () => {
    dispatch(checkSession());
    return isAuthenticated;
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    lastActivity,
    loginAttempts,
    login,
    logout,
    validateSession
  };
};

export default useAuth;