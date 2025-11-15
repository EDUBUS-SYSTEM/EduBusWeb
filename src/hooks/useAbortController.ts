import { useEffect, useRef } from 'react';
import { CancelTokenSource } from 'axios';
import axios from 'axios';

/**
 * Hook to automatically cancel axios requests when component unmounts
 * This prevents AbortError and improves performance
 */
export function useAbortController() {
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    // Create cancel token source
    cancelTokenSourceRef.current = axios.CancelToken.source();

    return () => {
      // Cancel all pending requests when component unmounts
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
        cancelTokenSourceRef.current = null;
      }
    };
  }, []);

  return cancelTokenSourceRef.current;
}

