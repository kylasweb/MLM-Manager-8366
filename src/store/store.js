import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';

// Define persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only persist auth
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here as needed
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Create a hook for session checking
export const setupSessionChecker = () => {
  let intervalId = null;
  
  return {
    startSessionCheck: () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      // Check session every minute
      intervalId = setInterval(() => {
        store.dispatch({ type: 'auth/checkSession' });
      }, 60000);
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