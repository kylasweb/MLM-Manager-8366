import { AUTH_TOKEN_KEY, ERROR_MESSAGES, USER_ROLES } from '../config/constants';
import { ApiError } from './errorHandler';

export const requireAuth = (Component) => {
  return (props) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (!token) {
      throw new ApiError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }
    
    return <Component {...props} />;
  };
};

export const requireAdmin = (Component) => {
  return (props) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userRole = localStorage.getItem('user_role');
    
    if (!token || userRole !== USER_ROLES.ADMIN) {
      throw new ApiError('Admin access required', 403);
    }
    
    return <Component {...props} />;
  };
};

export const withAuth = (Component) => {
  return (props) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return <Component {...props} isAuthenticated={!!token} />;
  };
};

export const checkPermission = (requiredRole) => {
  const userRole = localStorage.getItem('user_role');
  
  if (requiredRole === USER_ROLES.ADMIN && userRole !== USER_ROLES.ADMIN) {
    throw new ApiError('Admin access required', 403);
  }
  
  return true;
};

export const hasPermission = (requiredRole) => {
  try {
    return checkPermission(requiredRole);
  } catch {
    return false;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem('user_role');
  localStorage.removeItem('refresh_token');
};

export const handleAuthError = (error) => {
  if (error.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
  }
  throw error;
}; 