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

// Define persist configuration - only persist what's necessary
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'lastActivity', 'loginAttempts'], // only persist these fields
  blacklist: ['loading', 'error'], // don't persist these fields
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
});

// Create persistor
export const persistor = persistStore(store, {
  // The following options are to optimize rehydration
  manualPersist: false,
});

// Create a hook for session checking with improved performance
export const setupSessionChecker = () => {
  let intervalId = null;
  let lastCheck = 0;
  const CHECK_INTERVAL = 60000; // 1 minute
  
  return {
    startSessionCheck: () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      // Check session every minute, but throttle checks
      intervalId = setInterval(() => {
        const now = Date.now();
        // Only check if at least CHECK_INTERVAL has passed since last check
        if (now - lastCheck >= CHECK_INTERVAL) {
          store.dispatch({ type: 'auth/checkSession' });
          lastCheck = now;
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