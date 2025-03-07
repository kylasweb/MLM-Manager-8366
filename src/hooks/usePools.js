import { useState, useEffect } from 'react';
import { useAsync } from './useAsync';
import { poolsAPI } from '../services/api/pools';

export const usePools = () => {
  const [activePools, setActivePools] = useState([]);
  const [poolHistory, setPoolHistory] = useState([]);
  const [userPools, setUserPools] = useState([]);

  const { execute: fetchActivePools, loading: activePoolsLoading } = useAsync(poolsAPI.getActivePools);
  const { execute: fetchPoolHistory, loading: historyLoading } = useAsync(poolsAPI.getPoolHistory);
  const { execute: joinPoolAction, loading: joiningPool } = useAsync(poolsAPI.joinPool);

  const loadPoolData = async () => {
    try {
      const [activePoolsData, historyData] = await Promise.all([
        fetchActivePools(),
        fetchPoolHistory()
      ]);

      setActivePools(activePoolsData.pools);
      setPoolHistory(historyData.history);
      setUserPools(historyData.userPools || []);
    } catch (error) {
      console.error('Error loading pool data:', error);
    }
  };

  useEffect(() => {
    loadPoolData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadPoolData, 30000);
    return () => clearInterval(interval);
  }, []);

  const joinPool = async (poolId) => {
    try {
      await joinPoolAction(poolId);
      await loadPoolData();
    } catch (error) {
      throw error;
    }
  };

  return {
    activePools,
    poolHistory,
    userPools,
    joinPool,
    loading: activePoolsLoading || historyLoading,
    joiningPool
  };
};