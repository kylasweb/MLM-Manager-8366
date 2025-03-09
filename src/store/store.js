import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';

// Debug flag
const DEBUG = true;

// Add safety mechanism to detect corrupted state
const safeStorage = {
  ...storage,
  getItem: async (key) => {
    try {
      if (DEBUG) console.log(`[Store] Getting item from storage: ${key}`);
      const value = await storage.getItem(key);
      
      // Check if value is valid JSON
      if (value) {
        try {
          JSON.parse(value);
          return value;
        } catch (e) {
          console.error(`[Store] Corrupted state detected in ${key}, resetting:`, e);
          // Clear corrupted state
          await storage.removeItem(key);
          return null;
        }
      }
      return value;
    } catch (e) {
      console.error(`[Store] Error reading from storage:`, e);
      return null;
    }
  }
};

// Define persist configuration - only persist what's necessary
const authPersistConfig = {
  key: 'auth',
  storage: safeStorage,
  whitelist: ['token', 'user', 'lastActivity', 'loginAttempts'], // only persist these fields
  blacklist: ['loading', 'error'], // don't persist these fields
  // Add version for migrations
  version: 1,
  // Safe migration strategy
  migrate: (state) => {
    if (DEBUG) console.log('[Store] Migrating persisted state', state);
    // Always return a promise
    return Promise.resolve(state);
  },
  // Debug rehydration issues
  debug: DEBUG,
  // Timeout to prevent hanging on rehydration
  timeout: 2000
};

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  // Add other reducers here as needed
});

// Create store with performance optimizations
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check to improve performance
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these field paths for serializable check
        ignoredPaths: ['auth.lastActivity'],
      },
      immutableCheck: { warnAfter: 128 },
      thunk: {
        extraArgument: {
          // You can add extra arguments for thunks here
        },
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
  // Prevent potential memory leaks
  enhancers: []
});

// Create persistor with safeguards
export const persistor = persistStore(store, {
  // The following options are to optimize rehydration
  manualPersist: false,
}, () => {
  if (DEBUG) console.log('[Store] Rehydration complete');
});

// Add safety net - allow manual purging of persist store if needed
window.purgeStore = () => {
  if (DEBUG) console.log('[Store] Manually purging persisted state');
  persistor.purge();
  window.location.reload();
};

// Create a hook for session checking with improved performance
export const setupSessionChecker = () => {
  let intervalId = null;
  let lastCheck = 0;
  const CHECK_INTERVAL = 60000; // 1 minute
  let isChecking = false; // Prevent concurrent checks
  
  return {
    startSessionCheck: () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      // Check session every minute, but throttle checks
      intervalId = setInterval(() => {
        if (isChecking) return; // Skip if already checking
        
        const now = Date.now();
        // Only check if at least CHECK_INTERVAL has passed since last check
        if (now - lastCheck >= CHECK_INTERVAL) {
          isChecking = true;
          if (DEBUG) console.log('[Store] Checking session');
          
          try {
            store.dispatch({ type: 'auth/checkSession' });
          } catch (e) {
            console.error('[Store] Error during session check:', e);
          } finally {
            isChecking = false;
            lastCheck = Date.now();
          }
        }
      }, CHECK_INTERVAL);
    },
    stopSessionCheck: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
};

export default store; 