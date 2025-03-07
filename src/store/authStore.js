import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { isValidToken, setSession } from '../utils/jwt';

const ADMIN_EMAIL = 'kailaspnair@yahoo.com';
const ADMIN_PASSWORD = '@Cargo123#';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      error: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      initialize: async () => {
        try {
          const token = localStorage.getItem('mlm_token');
          if (token && isValidToken(token)) {
            const userData = JSON.parse(localStorage.getItem('mlm_user'));
            set({ user: userData, token, isAuthenticated: true });
          } else {
            setSession(null);
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          setSession(null);
          set({ user: null, token: null, isAuthenticated: false });
        }
        set({ loading: false });
      },

      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          
          // Mock authentication for demo
          if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
            const adminUser = {
              id: 'admin',
              name: 'Admin',
              email: ADMIN_EMAIL,
              role: 'admin',
              token: 'admin_token'
            };
            setSession(adminUser.token);
            localStorage.setItem('mlm_user', JSON.stringify(adminUser));
            set({ 
              user: adminUser,
              token: adminUser.token,
              isAuthenticated: true,
              error: null 
            });
            return adminUser;
          }

          // Mock regular user login
          const regularUser = {
            id: Date.now().toString(),
            name: 'Regular User',
            email: credentials.email,
            role: 'user',
            token: 'user_token'
          };
          setSession(regularUser.token);
          localStorage.setItem('mlm_user', JSON.stringify(regularUser));
          set({ 
            user: regularUser,
            token: regularUser.token,
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
          
          // Mock registration
          const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            role: 'user',
            token: 'new_user_token'
          };
          setSession(newUser.token);
          localStorage.setItem('mlm_user', JSON.stringify(newUser));
          set({ 
            user: newUser,
            token: newUser.token,
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

      logout: () => {
        setSession(null);
        set({ 
          user: null,
          token: null,
          isAuthenticated: false,
          error: null 
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      })
    }
  )
);

export default useAuthStore;