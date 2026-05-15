import { useCallback, useEffect, useRef, useState } from 'react';
import { searchJobs, type JobSearchResult } from '../api/jobSearchApi';

export interface UseJobSearchReturn {
  query: string;
  setQuery: (value: string) => void;
  results: JobSearchResult[];
  loading: boolean;
  error: string | null;
}

/**
 * Debounced job search: updates `results` and `loading` when `query` stabilizes.
 */
export function useJobSearch(debounceMs: number = 300): UseJobSearchReturn {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<JobSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;

      void (async () => {
        try {
          const data = await searchJobs(trimmed);
          if (requestIdRef.current === requestId) {
            setResults(Array.isArray(data) ? data : []);
            setLoading(false);
          }
        } catch (e) {
          if (requestIdRef.current === requestId) {
            setError(e instanceof Error ? e.message : 'Search failed');
            setResults([]);
            setLoading(false);
          }
        }
      })();
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, debounceMs]);

  return { query, setQuery, results, loading, error };
}
