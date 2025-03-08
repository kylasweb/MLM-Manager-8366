import { HTTP_STATUS } from '../config/constants';

export const formatSuccess = (data = null, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

export const formatError = (error, status = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  return {
    success: false,
    message: error.message || 'An error occurred',
    errors: error.errors || null,
    status,
    timestamp: new Date().toISOString()
  };
};

export const formatPagination = (data, page, limit, total) => {
  return {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1
    },
    timestamp: new Date().toISOString()
  };
};

export const formatNetworkData = (networkData) => {
  return {
    username: networkData.username,
    sponsorId: networkData.sponsorId,
    level: networkData.level,
    status: networkData.status,
    businessVolume: {
      personal: networkData.personalVolume || 0,
      group: networkData.groupVolume || 0,
      total: (networkData.personalVolume || 0) + (networkData.groupVolume || 0)
    },
    referrals: {
      direct: networkData.directReferrals || 0,
      total: networkData.totalReferrals || 0
    },
    earnings: {
      direct: networkData.directEarnings || 0,
      indirect: networkData.indirectEarnings || 0,
      total: (networkData.directEarnings || 0) + (networkData.indirectEarnings || 0)
    },
    rank: networkData.rank || 'Member',
    joinDate: networkData.createdAt,
    lastActive: networkData.lastActive
  };
};

export const formatBusinessVolume = (volumeData) => {
  return {
    type: volumeData.type,
    amount: volumeData.amount,
    source: volumeData.source,
    userId: volumeData.userId,
    description: volumeData.description,
    timestamp: volumeData.createdAt,
    status: volumeData.status
  };
};

export const formatCommission = (commissionData) => {
  return {
    type: commissionData.type,
    amount: commissionData.amount,
    source: {
      type: commissionData.sourceType,
      id: commissionData.sourceId,
      description: commissionData.sourceDescription
    },
    fromUser: commissionData.fromUserId,
    level: commissionData.level,
    status: commissionData.status,
    paidAt: commissionData.paidAt,
    createdAt: commissionData.createdAt
  };
};

export const formatUserProfile = (userData) => {
  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    name: userData.name,
    sponsorId: userData.sponsorId,
    uplineId: userData.uplineId,
    role: userData.role,
    status: userData.status,
    profile: {
      phone: userData.phone,
      country: userData.country,
      timezone: userData.timezone,
      avatar: userData.avatar
    },
    settings: userData.settings || {},
    stats: {
      totalReferrals: userData.totalReferrals || 0,
      activeReferrals: userData.activeReferrals || 0,
      totalEarnings: userData.totalEarnings || 0,
      pendingCommissions: userData.pendingCommissions || 0
    },
    verification: {
      email: userData.emailVerified,
      phone: userData.phoneVerified,
      kyc: userData.kycVerified
    },
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt
  };
}; 