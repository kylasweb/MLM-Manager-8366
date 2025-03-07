import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export const useAsync = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleError } = useErrorHandler();

  const execute = useCallback(async (...params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await asyncFunction(...params);
      return response;
    } catch (error) {
      setError(error);
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, handleError]);

  return {
    loading,
    error,
    execute
  };
};