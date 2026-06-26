"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { SmallcaseHoldingsData } from "@/types/smallcase";

interface State {
  data: SmallcaseHoldingsData | null;
  loading: boolean;
  error: string | null;
  notConnected: boolean;
}

export function useSmallcaseHoldings() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, notConnected: false });

  const fetch = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null, notConnected: false }));
    apiAuthGet<{ success: boolean; data: SmallcaseHoldingsData }>(
      `${BACKEND_URL}/api/smallcase/holdings`,
      {
        onSuccess: (res) => {
          setState({ data: res.data, loading: false, error: null, notConnected: false });
        },
        onError: (err) => {
          const notConnected = err.includes("404") || err.toLowerCase().includes("not connected");
          setState({ data: null, loading: false, error: notConnected ? null : err, notConnected });
        },
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
