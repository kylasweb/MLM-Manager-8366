import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isValidToken, setSession, generateToken } from '../utils/jwt';
import { encryptData, decryptData } from '../utils/crypto';
import axios from 'axios';

// Constants
const ADMIN_EMAIL = 'kailaspnair@yahoo.com';
const ADMIN_PASSWORD = '@Cargo123#';
const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 900000; // 15 minutes in milliseconds

// Define async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { getState, rejectWithValue }) => {
    try {
      // Check login attempts
      const { loginAttempts } = getState().auth;
      const attempts = loginAttempts[credentials.email] || { count: 0, lastAttempt: 0 };
      const currentTime = Date.now();
      
      // Check if lockout period has passed
      if (attempts.count >= MAX_LOGIN_ATTEMPTS && 
          currentTime - attempts.lastAttempt < LOCKOUT_DURATION) {
        const remainingLockout = Math.ceil(
          (LOCKOUT_DURATION - (currentTime - attempts.lastAttempt)) / 60000
        );
        throw new Error(`Account temporarily locked. Try again in ${remainingLockout} minutes.`);
      }

      // Check for admin login
      if (credentials.email === ADMIN_EMAIL) {
        if (credentials.password === ADMIN_PASSWORD) {
          const token = generateToken({
            id: 'admin',
            email: ADMIN_EMAIL,
            role: 'admin'
          });

          const adminUser = {
            id: 'admin',
            name: 'Admin',
            email: ADMIN_EMAIL,
            role: 'admin',
            permissions: [
              'manage_users',
              'manage_investments',
              'manage_pools',
              'manage_settings',
              'view_reports'
            ],
            lastLogin: new Date().toISOString()
          };

          setSession(token);
          
          // Store encrypted user info in localStorage
          const encryptedUser = encryptData(adminUser);
          localStorage.setItem('mlm_user_secure', encryptedUser);
          
          return { 
            user: adminUser, 
            token,
            loginSuccess: { email: credentials.email, success: true }
          };
        } else {
          return rejectWithValue({ 
            message: 'Invalid admin credentials',
            loginFailure: { email: credentials.email, success: false }
          });
        }
      }

      // Regular user login
      const token = generateToken({
        id: Date.now().toString(),
        email: credentials.email,
        role: 'user'
      });

      const regularUser = {
        id: Date.now().toString(),
        name: credentials.name || 'User',
        email: credentials.email,
        role: 'user',
        permissions: [
          'view_investments',
          'manage_own_investments',
          'view_pools',
          'join_pools'
        ],
        lastLogin: new Date().toISOString()
      };

      setSession(token);
      
      // Store encrypted user info in localStorage
      const encryptedUser = encryptData(regularUser);
      localStorage.setItem('mlm_user_secure', encryptedUser);
      
      return { 
        user: regularUser, 
        token,
        loginSuccess: { email: credentials.email, success: true }
      };
    } catch (error) {
      return rejectWithValue({ 
        message: error.message || 'Login failed',
        loginFailure: { email: credentials.email, success: false }
      });
    }
  }
);

export const initialize = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('mlm_token');
      
      if (token && isValidToken(token)) {
        const encryptedUser = localStorage.getItem('mlm_user_secure');
        if (encryptedUser) {
          const userData = decryptData(encryptedUser);
          const lastActivity = localStorage.getItem('mlm_last_activity');
          
          return { 
            user: userData, 
            token, 
            lastActivity: parseInt(lastActivity) || Date.now()
          };
        }
      }
      
      // If no valid token or user data, clear session
      setSession(null);
      return rejectWithValue('No valid session found');
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setSession(null);
      return rejectWithValue('Session initialization failed');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  lastActivity: null,
  loginAttempts: {},
  sessionTimeout: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state, action) => {
      setSession(null);
      localStorage.removeItem('mlm_user_secure');
      localStorage.removeItem('mlm_last_activity');
      
      return {
        ...initialState,
        loading: false,
        error: action.payload || null
      };
    },
    updateLastActivity: (state) => {
      const currentTime = Date.now();
      state.lastActivity = currentTime;
      localStorage.setItem('mlm_last_activity', currentTime.toString());
    },
    updateLoginAttempts: (state, action) => {
      const { email, success } = action.payload;
      const currentTime = Date.now();
      
      if (success) {
        // Reset attempts on successful login
        delete state.loginAttempts[email];
      } else {
        // Increment failed attempts
        const attempts = state.loginAttempts[email] || { count: 0, lastAttempt: 0 };
        attempts.count += 1;
        attempts.lastAttempt = currentTime;
        state.loginAttempts[email] = attempts;
      }
    },
    checkSession: (state) => {
      const currentTime = Date.now();
      
      if (state.lastActivity && (currentTime - state.lastActivity > SESSION_TIMEOUT)) {
        setSession(null);
        localStorage.removeItem('mlm_user_secure');
        localStorage.removeItem('mlm_last_activity');
        
        return {
          ...initialState,
          loading: false,
          error: 'Session expired'
        };
      }
      
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth state
      .addCase(initialize.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initialize.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.lastActivity = action.payload.lastActivity;
        state.error = null;
      })
      .addCase(initialize.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Initialization failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.lastActivity = Date.now();
        state.error = null;
        
        // Handle login attempt tracking
        if (action.payload.loginSuccess) {
          const { email } = action.payload.loginSuccess;
          delete state.loginAttempts[email];
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        
        // Handle login attempt tracking
        if (action.payload?.loginFailure) {
          const { email } = action.payload.loginFailure;
          const attempts = state.loginAttempts[email] || { count: 0, lastAttempt: 0 };
          attempts.count += 1;
          attempts.lastAttempt = Date.now();
          state.loginAttempts[email] = attempts;
        }
      });
  }
});

export const { logout, updateLastActivity, updateLoginAttempts, checkSession } = authSlice.actions;

export default authSlice.reducer; 