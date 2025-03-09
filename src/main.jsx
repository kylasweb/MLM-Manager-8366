import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import './index.css';

// Lazy load non-critical components
const App = lazy(() => import('./App'));
const ThemeProvider = lazy(() => import('./contexts/ThemeContext').then(module => ({ default: module.ThemeProvider })));
const ToastContainer = lazy(() => 
  import('react-toastify').then(module => ({ 
    default: module.ToastContainer 
  }))
);

// Import CSS separately to avoid blocking render
import('react-toastify/dist/ReactToastify.css');

// Simple loading component
const AppLoading = () => (
  <div className="app-loading">
    <div className="app-loading-spinner"></div>
  </div>
);

// Create root with concurrent mode
const root = createRoot(document.getElementById('root'));

// Render with performance optimization
root.render(
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