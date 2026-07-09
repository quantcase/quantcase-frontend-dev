"use client";

import { useState, useEffect, useCallback } from "react";
import { apiAuthGet } from "@/lib/api";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Shared GET hook for the read-only investor-dashboard resources.
 * All of them use the `{ success, data }` envelope and Bearer auth.
 */
export function useDashboardResource<T>(url: string) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    apiAuthGet<{ success: boolean; data: T }>(url, {
      onSuccess: (res) => setState({ data: res.data, loading: false, error: null }),
      onError: (err) => setState({ data: null, loading: false, error: err }),
      onComplete: () => setState((s) => ({ ...s, loading: false })),
    });
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
