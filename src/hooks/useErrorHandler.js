import { useState } from 'react';
import notificationManager from '../utils/notificationManager';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = (error, context = '') => {
    console.error(`Error in ${context}:`, error);

    // Network error handling
    if (error.code === 'ERR_NETWORK') {
      notificationManager.error('Unable to connect to server. Please check your connection.');
      return {
        error: true,
        message: 'Network error',
        data: null
      };
    }

    // Authentication error handling
    if (error.response?.status === 401) {
      notificationManager.error('Session expired. Please login again.');
      // Redirect to login
      window.location.href = '/login';
      return {
        error: true,
        message: 'Authentication error',
        data: null
      };
    }

    // Server error handling
    if (error.response?.status >= 500) {
      notificationManager.error('Server error. Please try again later.');
      return {
        error: true,
        message: 'Server error',
        data: null
      };
    }

    // Validation error handling
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      Object.values(validationErrors).forEach(error => {
        notificationManager.error(error[0]);
      });
      return {
        error: true,
        message: 'Validation error',
        data: validationErrors
      };
    }

    // Generic error handling
    notificationManager.error(error.message || 'An unexpected error occurred');
    return {
      error: true,
      message: error.message || 'Unknown error',
      data: null
    };
  };

  return {
    error,
    handleError
  };
};

// Fallback data for development
export const fallbackData = {
  investments: {
    plans: [
      { id: 1, name: 'Starter', minAmount: 100, maxAmount: 1000, duration: 30, roi: 10 },
      { id: 2, name: 'Growth', minAmount: 1000, maxAmount: 5000, duration: 60, roi: 15 },
      { id: 3, name: 'Premium', minAmount: 5000, maxAmount: 10000, duration: 90, roi: 20 }
    ],
    active: [],
    history: []
  },
  pools: {
    active: [
      { 
        id: 1, 
        name: 'Daily Pool', 
        totalPrize: 1000, 
        participants: 0, 
        maxParticipants: 100,
        duration: 24,
        startDate: new Date().toISOString(),
        status: 'active'
      }
    ],
    history: []
  },
  admin: {
    stats: {
      totalUsers: 0,
      totalInvestments: 0,
      activePools: 0,
      pendingWithdrawals: 0,
      userGrowth: 0,
      investmentGrowth: 0,
      poolUtilization: 0,
      totalPendingAmount: 0,
      investmentTrend: [0, 0, 0, 0, 0, 0],
      todayActivity: [0, 0, 0, 0],
      systemHealth: {
        status: 'operational',
        lastUpdated: new Date().toISOString(),
        issues: []
      },
      recentActivities: []
    }
  }
};