import { memo, useEffect, useState } from 'react';

/**
 * Optimized loading spinner component that reuses the initial loading spinner
 * from the HTML to avoid jumping/flickering during initial load.
 * 
 * The component is memoized to prevent unnecessary re-renders.
 */
const LoadingSpinner = memo(({ fullscreen = true, size = 'md', text = '' }) => {
  // State to track spinner visibility (for SSR/hydration)
  const [visible, setVisible] = useState(false);
  
  // Show spinner after a slight delay to avoid jumping for quick loads
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Additional classes to apply based on props
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4'
  };

  // CSS classes for styling
  const containerClass = fullscreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity duration-300'
    : 'flex items-center justify-center py-8 transition-opacity duration-300';
  
  const spinnerClass = `rounded-full border-primary-200 border-t-primary-600 animate-spin ${sizeClasses[size] || sizeClasses.md}`;
  
  // For server-side rendering compatibility
  if (typeof window === 'undefined') {
    return null;
  }

  // Try to reuse the existing spinner from the HTML
  const existingSpinner = document.querySelector('.app-loading');
  if (existingSpinner && fullscreen && !visible) {
    return null; // Let the HTML spinner show initially
  }

  // Hide HTML spinner once our React spinner is ready
  if (existingSpinner && visible) {
    existingSpinner.style.display = 'none';
  }

  // Apply visibility styles
  const visibilityStyle = visible ? 'opacity-100' : 'opacity-0';

  return (
    <div className={`${containerClass} ${visibilityStyle}`} aria-live="polite" role="status">
      <div className="text-center">
        <div className={spinnerClass}></div>
        {text && <p className="mt-4 text-gray-600 dark:text-gray-300">{text}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
});

// Display name for easier debugging
LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;