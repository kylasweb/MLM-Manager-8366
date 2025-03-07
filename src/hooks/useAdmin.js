import { useState, useEffect } from 'react';
import { useAsync } from './useAsync';
import { investmentAPI } from '../services/api/investment';
import { poolsAPI } from '../services/api/pools';

export const useAdmin = () => {
  const [investmentPlans, setInvestmentPlans] = useState([]);
  const [pools, setPools] = useState([]);

  // Investment Plans Management
  const { execute: fetchPlans, loading: plansLoading } = useAsync(investmentAPI.getPlans);
  const { execute: createPlan, loading: creatingPlan } = useAsync(investmentAPI.createPlan);
  const { execute: updatePlan, loading: updatingPlan } = useAsync(investmentAPI.updatePlan);
  const { execute: deletePlan, loading: deletingPlan } = useAsync(investmentAPI.deletePlan);

  // Pools Management
  const { execute: fetchPools, loading: poolsLoading } = useAsync(poolsAPI.getActivePools);
  const { execute: createPool, loading: creatingPool } = useAsync(poolsAPI.createPool);
  const { execute: updatePool, loading: updatingPool } = useAsync(poolsAPI.updatePool);
  const { execute: deletePool, loading: deletingPool } = useAsync(poolsAPI.deletePool);

  const loadAdminData = async () => {
    try {
      const [plansData, poolsData] = await Promise.all([
        fetchPlans(),
        fetchPools()
      ]);

      setInvestmentPlans(plansData.plans);
      setPools(poolsData.pools);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  useEffect(() => {
    loadAdminData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Investment Plans Operations
  const handleCreatePlan = async (planData) => {
    try {
      await createPlan(planData);
      await loadAdminData();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdatePlan = async (planId, planData) => {
    try {
      await updatePlan(planId, planData);
      await loadAdminData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await deletePlan(planId);
      await loadAdminData();
    } catch (error) {
      throw error;
    }
  };

  // Pools Operations
  const handleCreatePool = async (poolData) => {
    try {
      await createPool(poolData);
      await loadAdminData();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdatePool = async (poolId, poolData) => {
    try {
      await updatePool(poolId, poolData);
      await loadAdminData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeletePool = async (poolId) => {
    try {
      await deletePool(poolId);
      await loadAdminData();
    } catch (error) {
      throw error;
    }
  };

  return {
    // Investment Plans
    investmentPlans,
    createPlan: handleCreatePlan,
    updatePlan: handleUpdatePlan,
    deletePlan: handleDeletePlan,
    plansLoading: plansLoading || creatingPlan || updatingPlan || deletingPlan,

    // Pools
    pools,
    createPool: handleCreatePool,
    updatePool: handleUpdatePool,
    deletePool: handleDeletePool,
    poolsLoading: poolsLoading || creatingPool || updatingPool || deletingPool
  };
};