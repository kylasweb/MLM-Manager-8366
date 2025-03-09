// Production-optimized entry point
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import App from './App';
import './index.css';

// Simple loading component for production
const AppLoading = () => (
  <div className="app-loading">
    <div className="app-loading-spinner"></div>
  </div>
);

// Create root with concurrent mode
const root = createRoot(document.getElementById('root'));

// Mark app as loaded for fallback detection
window.appLoaded = true;

// Render with optimized production settings
root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<AppLoading />} persistor={persistor}>
        <HashRouter>
          <App />
        </HashRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
); 