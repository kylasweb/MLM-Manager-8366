/**
 * Performance Monitoring Utility
 * Tracks component render times, network requests, and resource usage
 */

// Store performance metrics
const metrics = {
  components: {},
  pages: {},
  network: [],
  longTasks: [],
  resources: {}
};

// Configuration
const config = {
  enabled: true,
  logToConsole: true,
  threshold: 50, // ms - log renders taking longer than this
  longTaskThreshold: 50 // ms
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if (!config.enabled) return;

  console.log('[Performance] Monitoring initialized');
  
  // Monitor long tasks using PerformanceObserver
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const taskData = {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
            timestamp: new Date().toISOString()
          };
          
          metrics.longTasks.push(taskData);
          
          if (config.logToConsole && entry.duration > config.longTaskThreshold) {
            console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`, taskData);
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      console.log('[Performance] Long task monitoring enabled');
    } catch (e) {
      console.error('[Performance] Failed to initialize long task observer:', e);
    }
  }
  
  // Monitor resource timing
  try {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
          const url = new URL(entry.name);
          const pathname = url.pathname;
          
          metrics.network.push({
            url: pathname,
            duration: entry.duration,
            startTime: entry.startTime,
            size: entry.transferSize || 0,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
    console.log('[Performance] Network monitoring enabled');
  } catch (e) {
    console.error('[Performance] Failed to initialize resource observer:', e);
  }
  
  // Expose metrics globally for debugging
  window.__PERFORMANCE_METRICS__ = metrics;
  window.__TOGGLE_PERFORMANCE_LOGGING__ = (enabled) => {
    config.logToConsole = enabled;
    console.log(`[Performance] Console logging ${enabled ? 'enabled' : 'disabled'}`);
  };
};

/**
 * Component performance tracking HOC
 * Usage: export default withPerformanceTracking(MyComponent, 'MyComponent');
 */
export const withPerformanceTracking = (Component, componentName) => {
  if (!config.enabled) return Component;
  
  return (props) => {
    const startTime = performance.now();
    const result = Component(props);
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Store metrics
    if (!metrics.components[componentName]) {
      metrics.components[componentName] = {
        totalRenders: 0,
        totalTime: 0,
        averageTime: 0,
        maxTime: 0,
        lastRenderTime: 0,
        history: []
      };
    }
    
    const componentMetrics = metrics.components[componentName];
    componentMetrics.totalRenders += 1;
    componentMetrics.totalTime += renderTime;
    componentMetrics.lastRenderTime = renderTime;
    componentMetrics.averageTime = componentMetrics.totalTime / componentMetrics.totalRenders;
    
    if (renderTime > componentMetrics.maxTime) {
      componentMetrics.maxTime = renderTime;
    }
    
    // Store history (last 10 renders)
    componentMetrics.history.push({
      renderTime,
      timestamp: new Date().toISOString()
    });
    
    if (componentMetrics.history.length > 10) {
      componentMetrics.history.shift();
    }
    
    // Log slow renders
    if (config.logToConsole && renderTime > config.threshold) {
      console.warn(`[Performance] Slow render for ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    return result;
  };
};

/**
 * Track page performance
 * Call this at the top of your page components
 */
export const trackPagePerformance = (pageName) => {
  if (!config.enabled) return () => {};
  
  const startTime = performance.now();
  
  if (config.logToConsole) {
    console.log(`[Performance] Page ${pageName} started rendering`);
  }
  
  // Return function to call when component is fully rendered
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (!metrics.pages[pageName]) {
      metrics.pages[pageName] = {
        visits: 0,
        averageRenderTime: 0,
        totalRenderTime: 0,
        maxRenderTime: 0,
        lastRenderTime: 0,
        history: []
      };
    }
    
    // Update metrics
    const pageMetrics = metrics.pages[pageName];
    pageMetrics.visits += 1;
    pageMetrics.totalRenderTime += renderTime;
    pageMetrics.lastRenderTime = renderTime;
    pageMetrics.averageRenderTime = pageMetrics.totalRenderTime / pageMetrics.visits;
    
    if (renderTime > pageMetrics.maxRenderTime) {
      pageMetrics.maxRenderTime = renderTime;
    }
    
    // Record history
    pageMetrics.history.push({
      renderTime,
      timestamp: new Date().toISOString()
    });
    
    if (pageMetrics.history.length > 10) {
      pageMetrics.history.shift();
    }
    
    if (config.logToConsole) {
      console.log(`[Performance] Page ${pageName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  };
};

/**
 * Get performance report - call this to get a summary of performance metrics
 */
export const getPerformanceReport = () => {
  if (!config.enabled) return { enabled: false };
  
  const sortedComponents = Object.entries(metrics.components)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.averageTime - a.averageTime);
  
  const sortedPages = Object.entries(metrics.pages)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  
  return {
    enabled: true,
    timestamp: new Date().toISOString(),
    summary: {
      componentsTracked: Object.keys(metrics.components).length,
      pagesTracked: Object.keys(metrics.pages).length,
      networkRequestsTracked: metrics.network.length,
      longTasksDetected: metrics.longTasks.length
    },
    slowestComponents: sortedComponents.slice(0, 5),
    slowestPages: sortedPages.slice(0, 5),
    recentLongTasks: metrics.longTasks.slice(-5)
  };
};

// Initialize on import
initPerformanceMonitoring(); 