import { createClient } from 'contentful';
import { useState, useEffect, useCallback } from 'react';

// Create a Contentful client
const client = createClient({
  space: process.env.REACT_APP_CONTENTFUL_SPACE_ID || process.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN || process.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

// Helper function to transform product entries from Contentful
const mapProduct = (item) => {
  const { sys, fields } = item;
  return {
    id: sys.id,
    name: fields.productName,
    description: fields.description,
    price: fields.price,
    image: fields.productImage?.fields?.file?.url,
    category: fields.category,
    pv: fields.pointValue || 0, // Point Value for MLM calculations
    cv: fields.commissionValue || 0, // Commission Value
    rank: fields.requiredRank || 'distributor',
    createdAt: sys.createdAt,
    updatedAt: sys.updatedAt
  };
};

// Helper function to transform compensation plan
const mapCompensationPlan = (entry) => {
  const { fields } = entry;
  return {
    id: entry.sys.id,
    title: fields.title,
    description: fields.description,
    ranks: fields.ranks?.map(rank => ({
      id: rank.sys.id,
      name: rank.fields.rankName,
      description: rank.fields.description,
      qualificationRequirements: rank.fields.qualificationRequirements,
      personalVolume: rank.fields.personalVolumeRequirement,
      groupVolume: rank.fields.groupVolumeRequirement,
      directReferrals: rank.fields.directReferralsRequired,
      commissionRates: rank.fields.commissionRates
    })) || [],
    bonuses: fields.bonuses?.map(bonus => ({
      id: bonus.sys.id,
      name: bonus.fields.bonusName,
      description: bonus.fields.description,
      qualifications: bonus.fields.qualifications,
      payoutStructure: bonus.fields.payoutStructure
    })) || []
  };
};

/**
 * Hook to access MLM content from Contentful
 */
export function useContentful() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get all MLM products
   */
  const getMLMProducts = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const entries = await client.getEntries({
        content_type: 'mlmProduct',
        include: 2,
        ...options
      });
      
      setLoading(false);
      return entries.items.map(mapProduct);
    } catch (error) {
      console.error("Error fetching products from Contentful:", error);
      setError(error.message);
      setLoading(false);
      return [];
    }
  }, []);

  /**
   * Get product by ID
   */
  const getProductById = useCallback(async (productId) => {
    if (!productId) return null;
    
    setLoading(true);
    setError(null);

    try {
      const entry = await client.getEntry(productId);
      setLoading(false);
      return mapProduct(entry);
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      setError(error.message);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * Get the compensation plan
   */
  const getCompensationPlan = useCallback(async (planId) => {
    setLoading(true);
    setError(null);

    try {
      // Get the main compensation plan entry
      // Adjust the content type or ID as needed for your Contentful model
      const query = planId 
        ? { 'sys.id': planId }
        : { content_type: 'compensationPlan', limit: 1 };
      
      const entries = await client.getEntries(query);
      
      if (!entries.items.length) {
        throw new Error('Compensation plan not found');
      }
      
      setLoading(false);
      return mapCompensationPlan(entries.items[0]);
    } catch (error) {
      console.error("Error fetching compensation plan:", error);
      setError(error.message);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * Get training materials
   */
  const getTrainingMaterials = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const entries = await client.getEntries({
        content_type: 'trainingMaterial',
        order: '-sys.createdAt',
        ...options
      });
      
      setLoading(false);
      
      return entries.items.map(item => ({
        id: item.sys.id,
        title: item.fields.title,
        description: item.fields.description,
        type: item.fields.materialType,
        url: item.fields.materialFile?.fields?.file?.url,
        thumbnail: item.fields.thumbnail?.fields?.file?.url,
        requiredRank: item.fields.requiredRank || 'distributor',
        categories: item.fields.categories || [],
        createdAt: item.sys.createdAt
      }));
    } catch (error) {
      console.error("Error fetching training materials:", error);
      setError(error.message);
      setLoading(false);
      return [];
    }
  }, []);

  return { 
    getMLMProducts, 
    getProductById,
    getCompensationPlan,
    getTrainingMaterials,
    loading, 
    error 
  };
}

export default useContentful; 