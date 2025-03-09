import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { 
  login as loginAction, 
  logout as logoutAction,
  initialize as initializeAction,
  updateLastActivity,
  checkSession,
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectUserPermissions
} from '../store/authSlice';
import { useEffect, useCallback, useRef } from 'react';
import { setupSessionChecker } from '../store/store';

// Use singleton session checker to avoid recreation
const sessionChecker = setupSessionChecker();

/**
 * Custom hook to access auth state and actions from Redux with optimized performance
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const initRef = useRef(false);
  
  // Use memoized selectors for better performance
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const permissions = useSelector(selectUserPermissions);
  
  // Use shallow equality for other state to prevent unnecessary rerenders
  const { loading, error, lastActivity, loginAttempts } = useSelector(
    state => ({
      loading: state.auth.loading,
      error: state.auth.error,
      lastActivity: state.auth.lastActivity,
      loginAttempts: state.auth.loginAttempts,
    }),
    shallowEqual
  );

  // Initialize auth state only once
  useEffect(() => {
    if (!initRef.current) {
      dispatch(initializeAction());
      initRef.current = true;
    }
  }, [dispatch]);

  // Effect for session checking management
  useEffect(() => {
    if (isAuthenticated) {
      sessionChecker.startSessionCheck();
    }

    return () => {
      sessionChecker.stopSessionCheck();
    };
  }, [isAuthenticated]);

  // Optimized activity tracking using event delegation and throttling
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeout;
    const ACTIVITY_THROTTLE = 60000; // 1 minute
    let lastUpdateTime = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= ACTIVITY_THROTTLE) {
        dispatch(updateLastActivity());
        lastUpdateTime = now;
      }
    };

    // Use event delegation instead of multiple listeners
    const handleUserActivity = (event) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(handleActivity, 500);
    };

    // Use passive listeners for better performance
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [dispatch, isAuthenticated]);

  // Memoized functions to prevent unnecessary recreation
  const login = useCallback(async (credentials) => {
    try {
      const resultAction = await dispatch(loginAction(credentials));
      if (loginAction.fulfilled.match(resultAction)) {
        return resultAction.payload.user;
      } else {
        throw new Error(resultAction.payload?.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback((message) => {
    dispatch(logoutAction(message));
    sessionChecker.stopSessionCheck();
  }, [dispatch]);

  const validateSession = useCallback(() => {
    dispatch(checkSession());
    return isAuthenticated;
  }, [dispatch, isAuthenticated]);

  // Return memoized state and functions
  return {
    user,
    isAuthenticated,
    isAdmin,
    permissions,
    loading,
    error,
    lastActivity,
    loginAttempts,
    login,
    logout,
    validateSession
  };
};

export default useAuth;