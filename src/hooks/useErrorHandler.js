import { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useErrorHandler = () => {
  const handleError = useCallback((error, customMessage = null) => {
    console.error('Error:', error);

    if (customMessage) {
      toast.error(customMessage);
      return;
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || 'An error occurred';
      toast.error(message);
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please try again.');
    } else {
      // Something happened in setting up the request
      toast.error('An error occurred. Please try again.');
    }
  }, []);

  return { handleError };
};