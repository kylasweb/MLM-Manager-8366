import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { isValidToken, setSession, generateToken } from '../utils/jwt';
import { encryptData, decryptData } from '../utils/crypto';

const ADMIN_EMAIL = 'kailaspnair@yahoo.com';
const ADMIN_PASSWORD = '@Cargo123#';
const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 900000; // 15 minutes in milliseconds

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      lastActivity: null,
      loginAttempts: {},
      sessionTimeout: null,

      setUser: (user) => {
        if (user) {
          const encryptedUser = encryptData(user);
          localStorage.setItem('mlm_user_secure', encryptedUser);
        }
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      updateLastActivity: () => {
        const currentTime = Date.now();
        set({ lastActivity: currentTime });
        localStorage.setItem('mlm_last_activity', currentTime.toString());
      },

      checkSession: () => {
        const { lastActivity, logout } = get();
        const currentTime = Date.now();
        
        if (lastActivity && (currentTime - lastActivity > SESSION_TIMEOUT)) {
          logout('Session expired');
          return false;
        }
        return true;
      },

      startSessionTimer: () => {
        const { checkSession, sessionTimeout } = get();
        
        // Clear existing timer if any
        if (sessionTimeout) {
          clearInterval(sessionTimeout);
        }

        // Start new session check timer
        const timer = setInterval(() => {
          checkSession();
        }, 60000); // Check every minute

        set({ sessionTimeout: timer });
      },

      initialize: async () => {
        try {
          set({ loading: true });
          const token = localStorage.getItem('mlm_token');
          
          if (token && isValidToken(token)) {
            const encryptedUser = localStorage.getItem('mlm_user_secure');
            if (encryptedUser) {
              const userData = decryptData(encryptedUser);
              const lastActivity = localStorage.getItem('mlm_last_activity');
              
              set({ 
                user: userData, 
                token, 
                isAuthenticated: true,
                lastActivity: parseInt(lastActivity) || Date.now()
              });

              // Start session monitoring
              get().startSessionTimer();
              get().updateLastActivity();
            } else {
              get().logout('Invalid session data');
            }
          } else {
            get().logout();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          get().logout('Session initialization failed');
        } finally {
          set({ loading: false });
        }
      },

      checkLoginAttempts: (email) => {
        const { loginAttempts } = get();
        const attempts = loginAttempts[email] || { count: 0, lastAttempt: 0 };
        const currentTime = Date.now();

        // Check if lockout period has passed
        if (attempts.count >= MAX_LOGIN_ATTEMPTS && 
            currentTime - attempts.lastAttempt < LOCKOUT_DURATION) {
          const remainingLockout = Math.ceil(
            (LOCKOUT_DURATION - (currentTime - attempts.lastAttempt)) / 60000
          );
          throw new Error(`Account temporarily locked. Try again in ${remainingLockout} minutes.`);
        }

        // Reset attempts if lockout period has passed
        if (currentTime - attempts.lastAttempt > LOCKOUT_DURATION) {
          attempts.count = 0;
        }

        return attempts;
      },

      updateLoginAttempts: (email, success) => {
        const { loginAttempts } = get();
        const currentTime = Date.now();
        
        if (success) {
          // Reset attempts on successful login
          delete loginAttempts[email];
        } else {
          // Increment failed attempts
          const attempts = loginAttempts[email] || { count: 0, lastAttempt: 0 };
          attempts.count += 1;
          attempts.lastAttempt = currentTime;
          loginAttempts[email] = attempts;

          if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
            throw new Error('Maximum login attempts exceeded. Account temporarily locked.');
          }
        }

        set({ loginAttempts });
      },

      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          
          // Check login attempts
          const attempts = get().checkLoginAttempts(credentials.email);

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
              get().setUser(adminUser);
              get().updateLoginAttempts(credentials.email, true);
              get().startSessionTimer();
              get().updateLastActivity();

              set({ 
                token,
                isAuthenticated: true,
                error: null 
              });

              return adminUser;
            } else {
              get().updateLoginAttempts(credentials.email, false);
              throw new Error('Invalid admin credentials');
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
          get().setUser(regularUser);
          get().updateLoginAttempts(credentials.email, true);
          get().startSessionTimer();
          get().updateLastActivity();

          set({ 
            token,
            isAuthenticated: true,
            error: null 
          });

          return regularUser;
        } catch (error) {
          set({ error: error.message || 'Login failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true, error: null });
          
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
          }

          // Validate password strength
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!passwordRegex.test(userData.password)) {
            throw new Error(
              'Password must be at least 8 characters long and contain at least one uppercase letter, ' +
              'one lowercase letter, one number, and one special character'
            );
          }

          // Prevent registration with admin email
          if (userData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            throw new Error('This email is reserved for admin use');
          }

          const token = generateToken({
            id: Date.now().toString(),
            email: userData.email,
            role: 'user'
          });

          const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            role: 'user',
            permissions: [
              'view_investments',
              'manage_own_investments',
              'view_pools',
              'join_pools'
            ],
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            status: 'active',
            emailVerified: false
          };

          setSession(token);
          get().setUser(newUser);
          get().startSessionTimer();
          get().updateLastActivity();

          set({ 
            token,
            isAuthenticated: true,
            error: null 
          });

          return newUser;
        } catch (error) {
          set({ error: error.message || 'Registration failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      logout: (reason = '') => {
        const { sessionTimeout } = get();
        
        // Clear session timer
        if (sessionTimeout) {
          clearInterval(sessionTimeout);
        }

        // Clear all auth-related data
        setSession(null);
        localStorage.removeItem('mlm_user_secure');
        localStorage.removeItem('mlm_token');
        localStorage.removeItem('mlm_last_activity');

        set({ 
          user: null,
          token: null,
          isAuthenticated: false,
          error: reason || null,
          lastActivity: null,
          sessionTimeout: null
        });
      },

      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        lastActivity: state.lastActivity,
        loginAttempts: state.loginAttempts
      })
    }
  )
);

export default useAuthStore;