import { useCallback } from 'react';

export function useRefreshData() {
  const refreshData = useCallback((callback?: () => void) => {
    // Trigger a custom event that pages can listen to
    window.dispatchEvent(new CustomEvent('refreshData'));
    
    // Also call the callback if provided
    if (callback) {
      callback();
    }
  }, []);

  return { refreshData };
}
