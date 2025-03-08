import { useState, useEffect } from 'react';
import { useAsync } from './useAsync';
import { adminAPI } from '../services/api/admin';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    activePools: 0,
    pendingWithdrawals: 0,
    recentActivities: [],
    systemHealth: {
      status: 'operational',
      lastUpdated: null,
      issues: []
    }
  });

  const { execute: fetchStats, loading: statsLoading } = useAsync(adminAPI.getDashboardStats);
  const { execute: fetchActivities, loading: activitiesLoading } = useAsync(adminAPI.getRecentActivities);

  const loadDashboardData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        fetchStats(),
        fetchActivities()
      ]);

      setStats({
        ...statsData,
        recentActivities: activitiesData,
        systemHealth: {
          ...statsData.systemHealth,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Real-time updates every minute
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading: statsLoading || activitiesLoading,
    refresh: loadDashboardData
  };
}; 