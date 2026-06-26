"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { JournalPendingResponse } from "@/types/journal";

interface State {
  data: JournalPendingResponse | null;
  loading: boolean;
  error: string | null;
}

export function useJournalPending() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const fetch = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null }));
    apiAuthGet<{ success: boolean; data: JournalPendingResponse }>(
      `${BACKEND_URL}/api/journal/pending`,
      {
        onSuccess: (res) => setState({ data: res.data, loading: false, error: null }),
        onError: (err) => setState({ data: null, loading: false, error: err }),
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
