import { MOCK_API_DELAY } from '../config/constants';
import { fallbackData } from '../hooks/useErrorHandler';

const delay = (ms = MOCK_API_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database
let mockDb = {
  users: [
    {
      id: 1,
      email: 'kailaspnair@yahoo.com',
      name: 'Kailas P Nair',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],
  investments: [...fallbackData.investments.plans],
  pools: [...fallbackData.pools.active],
  transactions: [],
  settings: {
    minInvestment: 100,
    maxInvestment: 10000,
    referralBonus: 10,
    withdrawalFee: 2.5
  }
};

export const mockApi = {
  // Auth endpoints
  login: async (credentials) => {
    await delay();
    if (credentials.email === 'kailaspnair@yahoo.com') {
      return {
        token: 'mock_token',
        user: {
          id: 1,
          email: 'kailaspnair@yahoo.com',
          role: 'admin',
          name: 'Kailas P Nair'
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    await delay();
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    mockDb.users.push(newUser);
    return {
      token: 'mock_token',
      user: newUser
    };
  },

  // Admin User Management
  getUsers: async (params = {}) => {
    await delay();
    let users = [...mockDb.users];
    
    // Apply filters
    if (params.status) {
      users = users.filter(user => user.status === params.status);
    }
    if (params.role) {
      users = users.filter(user => user.role === params.role);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginatedUsers = users.slice(start, start + limit);

    return {
      users: paginatedUsers,
      total: users.length,
      page,
      limit,
      totalPages: Math.ceil(users.length / limit)
    };
  },

  createUser: async (userData) => {
    await delay();
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    mockDb.users.push(newUser);
    return newUser;
  },

  updateUser: async (userId, userData) => {
    await delay();
    const index = mockDb.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    
    mockDb.users[index] = {
      ...mockDb.users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    return mockDb.users[index];
  },

  deleteUser: async (userId) => {
    await delay();
    const index = mockDb.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    
    mockDb.users.splice(index, 1);
    return { success: true };
  },

  // Investment Management
  getInvestmentPlans: async () => {
    await delay();
    return mockDb.investments;
  },

  createInvestmentPlan: async (planData) => {
    await delay();
    const newPlan = {
      id: Date.now(),
      ...planData,
      createdAt: new Date().toISOString()
    };
    mockDb.investments.push(newPlan);
    return newPlan;
  },

  updateInvestmentPlan: async (planId, planData) => {
    await delay();
    const index = mockDb.investments.findIndex(p => p.id === planId);
    if (index === -1) throw new Error('Investment plan not found');
    
    mockDb.investments[index] = {
      ...mockDb.investments[index],
      ...planData,
      updatedAt: new Date().toISOString()
    };
    return mockDb.investments[index];
  },

  deleteInvestmentPlan: async (planId) => {
    await delay();
    const index = mockDb.investments.findIndex(p => p.id === planId);
    if (index === -1) throw new Error('Investment plan not found');
    
    mockDb.investments.splice(index, 1);
    return { success: true };
  },

  // Pool Management
  getActivePools: async () => {
    await delay();
    return mockDb.pools;
  },

  createPool: async (poolData) => {
    await delay();
    const newPool = {
      id: Date.now(),
      ...poolData,
      participants: 0,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    mockDb.pools.push(newPool);
    return newPool;
  },

  updatePool: async (poolId, poolData) => {
    await delay();
    const index = mockDb.pools.findIndex(p => p.id === poolId);
    if (index === -1) throw new Error('Pool not found');
    
    mockDb.pools[index] = {
      ...mockDb.pools[index],
      ...poolData,
      updatedAt: new Date().toISOString()
    };
    return mockDb.pools[index];
  },

  deletePool: async (poolId) => {
    await delay();
    const index = mockDb.pools.findIndex(p => p.id === poolId);
    if (index === -1) throw new Error('Pool not found');
    
    mockDb.pools.splice(index, 1);
    return { success: true };
  },

  // System Settings
  getSettings: async () => {
    await delay();
    return mockDb.settings;
  },

  updateSettings: async (settings) => {
    await delay();
    mockDb.settings = {
      ...mockDb.settings,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    return mockDb.settings;
  },

  // Admin Stats
  getAdminStats: async () => {
    await delay();
    return {
      ...fallbackData.admin.stats,
      totalUsers: mockDb.users.length,
      activePools: mockDb.pools.filter(p => p.status === 'active').length,
      totalInvestments: mockDb.investments.reduce((sum, inv) => sum + inv.minAmount, 0)
    };
  },

  // Existing endpoints...
  getActiveInvestments: async () => {
    await delay();
    return fallbackData.investments.active;
  },

  getInvestmentHistory: async () => {
    await delay();
    return fallbackData.investments.history;
  },

  getPoolHistory: async () => {
    await delay();
    return fallbackData.pools.history;
  },

  // Mock WebSocket events
  mockWebSocketEvents: (webSocketService) => {
    // Simulate network updates
    setInterval(() => {
      if (webSocketService.socket?.connected) {
        webSocketService.notifyListeners('network_update', {
          type: 'new_member',
          data: {
            username: 'New Member',
            level: 1,
            businessVolume: 100
          }
        });
      }
    }, 60000); // Every minute

    // Simulate commission updates
    setInterval(() => {
      if (webSocketService.socket?.connected) {
        webSocketService.notifyListeners('commission_update', {
          type: 'direct_referral',
          amount: Math.floor(Math.random() * 100),
          currency: 'USD'
        });
      }
    }, 120000); // Every 2 minutes
  }
};

// Mock WebSocket connection
export const mockWebSocket = {
  connect: () => {
    console.log('Mock WebSocket connected');
    return {
      connected: true,
      on: (event, callback) => {
        console.log(`Mock WebSocket listening for event: ${event}`);
      },
      emit: (event, data) => {
        console.log(`Mock WebSocket emitting event: ${event}`, data);
      },
      disconnect: () => {
        console.log('Mock WebSocket disconnected');
      }
    };
  }
}; 