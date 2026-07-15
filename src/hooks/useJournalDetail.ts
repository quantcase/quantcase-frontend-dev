"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { JournalDetail } from "@/types/journal";

interface State {
  data: JournalDetail | null;
  loading: boolean;
  error: string | null;
}

// Journal detail — the journal plus its tickers with live market data, latest
// entry, and latest thesis health. For the Holdings journal the backend runs a
// holdings sync before responding, so this is always current.
//
// Pass `null` to skip fetching (e.g. before the route param resolves).
export function useJournalDetail(journalId: string | null) {
  const [state, setState] = useState<State>({ data: null, loading: journalId != null, error: null });

  const fetch = useCallback(() => {
    if (!journalId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    apiAuthGet<{ success: boolean; data: JournalDetail }>(
      `${BACKEND_URL}/api/journal/journals/${journalId}`,
      {
        onSuccess: (res) => setState({ data: res.data, loading: false, error: null }),
        onError: (err) => setState({ data: null, loading: false, error: err }),
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, [journalId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
