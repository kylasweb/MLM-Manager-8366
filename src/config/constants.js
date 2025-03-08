export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export const API_TIMEOUT = 30000; // 30 seconds

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
};

export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect',
  NETWORK_UPDATE: 'network_update',
  COMMISSION_UPDATE: 'commission_update',
  BUSINESS_VOLUME_UPDATE: 'business_volume_update',
  REFERRAL_UPDATE: 'referral_update'
};

export const BUSINESS_VOLUME_TYPES = {
  PRODUCT_SALES: 'product_sales',
  INVESTMENT: 'investment'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const COMMISSION_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
};

export const NETWORK_LEVELS = {
  MAX_DEPTH: 5,
  COMMISSION_RATES: {
    1: 10, // 10% for level 1
    2: 5,  // 5% for level 2
    3: 3,  // 3% for level 3
    4: 2,  // 2% for level 4
    5: 1   // 1% for level 5
  }
}; 