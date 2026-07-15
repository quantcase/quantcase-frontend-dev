"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { Journal } from "@/types/journal";

interface State {
  data: Journal[] | null;
  loading: boolean;
  error: string | null;
}

// Lists the user's journals. The GET creates the two defaults (Holdings +
// Tracking) lazily on the backend, so this always resolves to at least those
// two, defaults first.
export function useJournals() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const fetch = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null }));
    apiAuthGet<{ success: boolean; data: { journals: Journal[] } }>(
      `${BACKEND_URL}/api/journal/journals`,
      {
        onSuccess: (res) => setState({ data: res.data.journals, loading: false, error: null }),
        onError: (err) => setState({ data: null, loading: false, error: err }),
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
