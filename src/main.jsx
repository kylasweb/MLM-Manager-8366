// Add performance tracking to main initialization
const startTime = performance.now();
console.log('[Performance] App initialization started');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
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

// Create root with concurrent mode
const root = createRoot(document.getElementById('root'));

// Render with performance optimization
if (DEBUG) window.markPerf('Rendering started');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Track total initialization time
window.addEventListener('load', () => {
  const totalTime = performance.now() - startTime;
  console.log(`[Performance] Total app initialization: ${totalTime.toFixed(2)}ms`);
});