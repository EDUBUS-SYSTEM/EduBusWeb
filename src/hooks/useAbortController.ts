import { useEffect, useRef } from 'react';
import { CancelTokenSource } from 'axios';
import axios from 'axios';

export function useAbortController() {
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    cancelTokenSourceRef.current = axios.CancelToken.source();

    return () => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
        cancelTokenSourceRef.current = null;
      }
    };
  }, []);

  return cancelTokenSourceRef.current;
}

