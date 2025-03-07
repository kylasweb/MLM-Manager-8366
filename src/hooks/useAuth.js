import { useEffect } from 'react';
import authStore from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
    setError
  } = authStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    setError
  };
};