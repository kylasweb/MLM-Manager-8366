// Add performance tracking to main initialization
const startTime = performance.now();
console.log('[Performance] App initialization started');

import { StrictMode, lazy, Suspense, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import './index.css';

// Debug flag
const DEBUG = true;

// Performance monitoring
if (DEBUG) {
  console.log(`[Performance] Modules imported: ${(performance.now() - startTime).toFixed(2)}ms`);
}

// Prevent React DevTools in production
if (process.env.NODE_ENV === 'production') {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {};
  }
}

// Simple performance monitoring
if (DEBUG) {
  console.log('App starting - Performance monitoring enabled');
  window.perfEntries = [];
  
  // Track performance marks
  window.markPerf = (name) => {
    const time = performance.now();
    window.perfEntries.push({ name, time });
    console.log(`[PERF] ${name}: ${time.toFixed(2)}ms`);
  };
  
  window.markPerf('App init');
}

// Lazy load non-critical components
const App = lazy(() => {
  if (DEBUG) window.markPerf('App component lazy loading started');
  return import('./App').then(module => {
    if (DEBUG) window.markPerf('App component loaded');
    return module;
  });
});

// Import the other components directly to avoid potential issues
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';

// Import CSS separately to avoid blocking render
import('react-toastify/dist/ReactToastify.css');

// Simple loading component
const AppLoading = () => (
  <div className="app-loading">
    <div className="app-loading-spinner"></div>
  </div>
);

// Error boundary for lazy loading
const ErrorFallback = () => (
  <div className="error-boundary">
    <h2>Something went wrong loading the application.</h2>
    <button onClick={() => window.location.reload()}>Reload</button>
  </div>
);

// Safe app wrapper to prevent infinite loops
const SafeAppWrapper = () => {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Set a timeout to detect if the app is hanging
    const timeout = setTimeout(() => {
      console.warn('App may be hanging - setting up emergency recovery');
      
      // Set up emergency reset button
      const recoveryDiv = document.createElement('div');
      recoveryDiv.style.position = 'fixed';
      recoveryDiv.style.top = '10px';
      recoveryDiv.style.right = '10px';
      recoveryDiv.style.zIndex = '9999';
      recoveryDiv.style.background = 'red';
      recoveryDiv.style.color = 'white';
      recoveryDiv.style.padding = '10px';
      recoveryDiv.style.borderRadius = '5px';
      recoveryDiv.style.cursor = 'pointer';
      recoveryDiv.textContent = 'Reset App';
      recoveryDiv.onclick = () => {
        localStorage.removeItem('persist:root');
        window.location.reload();
      };
      
      document.body.appendChild(recoveryDiv);
    }, 10000); // 10 seconds timeout
    
    if (DEBUG) window.markPerf('Safe wrapper mounted');
    
    return () => {
      clearTimeout(timeout);
      if (DEBUG) window.markPerf('Safe wrapper unmounted');
    };
  }, []);
  
  if (error) {
    return (
      <div className="error-boundary">
        <h2>The application crashed</h2>
        <p>{error.toString()}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
        <button 
          onClick={() => {
            localStorage.removeItem('persist:root');
            window.location.reload();
          }}
          style={{ marginLeft: '10px' }}
        >
          Reset & Reload
        </button>
      </div>
    );
  }
  
  try {
    // Track render performance
    const renderStart = performance.now();
    if (DEBUG) console.log('[Performance] Starting render');
    
    // Monitor Redux store rehydration
    const unsubscribe = persistor.subscribe(() => {
      const persistorState = persistor.getState();
      if (persistorState.bootstrapped) {
        if (DEBUG) console.log(`[Performance] Redux store rehydrated: ${(performance.now() - renderStart).toFixed(2)}ms`);
        unsubscribe();
      }
    });
    
    return (
      <StrictMode>
        <Provider store={store}>
          <PersistGate loading={<AppLoading />} persistor={persistor}>
            <Suspense fallback={<AppLoading />}>
              <HashRouter>
                <ThemeProvider>
                  <App />
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                  />
                </ThemeProvider>
              </HashRouter>
            </Suspense>
          </PersistGate>
        </Provider>
      </StrictMode>
    );
  } catch (err) {
    console.error('Error rendering app:', err);
    setError(err);
    return <ErrorFallback />;
  }
};

// Create root with concurrent mode
const root = createRoot(document.getElementById('root'));

// Render with performance optimization
if (DEBUG) window.markPerf('Rendering started');
root.render(<SafeAppWrapper />);

// Track total initialization time
window.addEventListener('load', () => {
  const totalTime = performance.now() - startTime;
  console.log(`[Performance] Total app initialization: ${totalTime.toFixed(2)}ms`);
});