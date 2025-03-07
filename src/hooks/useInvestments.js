import { useState, useEffect } from 'react';
import { useAsync } from './useAsync';
import { investmentAPI } from '../services/api/investment';

export const useInvestments = () => {
  const [plans, setPlans] = useState([]);
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [investmentHistory, setInvestmentHistory] = useState([]);

  const { execute: fetchPlans, loading: plansLoading } = useAsync(investmentAPI.getPlans);
  const { execute: fetchActiveInvestments, loading: activeLoading } = useAsync(investmentAPI.getActiveInvestments);
  const { execute: fetchHistory, loading: historyLoading } = useAsync(investmentAPI.getInvestmentHistory);
  const { execute: purchasePlan, loading: purchasing } = useAsync(investmentAPI.purchasePlan);

  const loadInvestmentData = async () => {
    try {
      const [plansData, activeData, historyData] = await Promise.all([
        fetchPlans(),
        fetchActiveInvestments(),
        fetchHistory()
      ]);

      setPlans(plansData.plans);
      setActiveInvestments(activeData.investments);
      setInvestmentHistory(historyData.history);
    } catch (error) {
      console.error('Error loading investment data:', error);
    }
  };

  useEffect(() => {
    loadInvestmentData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadInvestmentData, 30000);
    return () => clearInterval(interval);
  }, []);

  const invest = async (planId) => {
    try {
      await purchasePlan(planId);
      await loadInvestmentData();
    } catch (error) {
      throw error;
    }
  };

  return {
    plans,
    activeInvestments,
    investmentHistory,
    invest,
    loading: plansLoading || activeLoading || historyLoading,
    purchasing
  };
};