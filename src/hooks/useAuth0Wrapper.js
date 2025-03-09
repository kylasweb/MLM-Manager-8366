import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook that extends Auth0 functionality with MLM-specific features
 */
export function useAuth0Wrapper() {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();
  
  const [userMetadata, setUserMetadata] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [mlmProfile, setMlmProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  /**
   * Fetch user metadata from Auth0 Management API via serverless function
   */
  const fetchUserMetadata = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const accessToken = await getAccessTokenSilently();
      
      const response = await fetch('/.netlify/functions/get-user-metadata', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      setUserMetadata(data.metadata);
      setUserRoles(data.roles || []);
    } catch (error) {
      console.error('Error fetching user metadata:', error);
    }
  }, [getAccessTokenSilently, isAuthenticated, user]);

  /**
   * Fetch MLM-specific profile data from our MongoDB
   */
  const fetchMlmProfile = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoadingProfile(true);
    
    try {
      const accessToken = await getAccessTokenSilently();
      
      const response = await fetch('/.netlify/functions/get-mlm-profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch MLM profile');
      }
      
      const profileData = await response.json();
      setMlmProfile(profileData);
    } catch (error) {
      console.error('Error fetching MLM profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [getAccessTokenSilently, isAuthenticated, user]);

  /**
   * Login with sponsor ID
   */
  const loginWithSponsor = (sponsorId) => {
    return loginWithRedirect({
      appState: { sponsorId }
    });
  };

  /**
   * Update MLM profile
   */
  const updateMlmProfile = useCallback(async (profileData) => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const accessToken = await getAccessTokenSilently();
      
      const response = await fetch('/.netlify/functions/update-mlm-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      setMlmProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating MLM profile:', error);
      throw error;
    }
  }, [getAccessTokenSilently, isAuthenticated, user]);

  /**
   * Complete logout by clearing state
   */
  const logout = useCallback(() => {
    setUserMetadata(null);
    setUserRoles([]);
    setMlmProfile(null);
    auth0Logout({ returnTo: window.location.origin });
  }, [auth0Logout]);

  /**
   * Fetch user data on authentication
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserMetadata();
      fetchMlmProfile();
    }
  }, [fetchUserMetadata, fetchMlmProfile, isAuthenticated, user]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    return userRoles.includes(role);
  }, [userRoles]);

  /**
   * Check if user has admin access
   */
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  /**
   * Get the MLM rank
   */
  const getMlmRank = useCallback(() => {
    return mlmProfile?.rank || 'distributor';
  }, [mlmProfile]);

  /**
   * Check if user has a sponsor
   */
  const hasSponsor = useCallback(() => {
    return !!mlmProfile?.sponsorId;
  }, [mlmProfile]);

  /**
   * Get sponsor info
   */
  const getSponsorInfo = useCallback(async () => {
    if (!isAuthenticated || !mlmProfile?.sponsorId) {
      return null;
    }
    
    try {
      const accessToken = await getAccessTokenSilently();
      
      const response = await fetch(`/.netlify/functions/get-sponsor?sponsorId=${mlmProfile.sponsorId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sponsor info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sponsor info:', error);
      return null;
    }
  }, [getAccessTokenSilently, isAuthenticated, mlmProfile]);

  return {
    // Auth0 standard props
    isAuthenticated,
    isLoading: isLoading || loadingProfile,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    
    // Extended MLM functionality
    userMetadata,
    userRoles,
    mlmProfile,
    hasRole,
    isAdmin,
    getMlmRank,
    hasSponsor,
    getSponsorInfo,
    loginWithSponsor,
    updateMlmProfile,
    refreshMlmProfile: fetchMlmProfile
  };
}

export default useAuth0Wrapper; 