"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { JournalEntry } from "@/types/journal";

interface State {
  data: JournalEntry[] | null;
  loading: boolean;
  error: string | null;
}

// All entries for a ticker within a journal, newest first. Lazy — pass `null`
// for either arg (e.g. while the side panel is closed) to skip the fetch.
export function useTickerEntries(journalId: string | null, ticker: string | null) {
  const active = Boolean(journalId && ticker);
  const [state, setState] = useState<State>({ data: null, loading: active, error: null });

  const fetch = useCallback(() => {
    if (!journalId || !ticker) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    apiAuthGet<{ success: boolean; data: { ticker: string; entries: JournalEntry[] } }>(
      `${BACKEND_URL}/api/journal/journals/${journalId}/tickers/${encodeURIComponent(ticker)}/entries`,
      {
        onSuccess: (res) => setState({ data: res.data.entries, loading: false, error: null }),
        onError: (err) => setState({ data: null, loading: false, error: err }),
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, [journalId, ticker]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
