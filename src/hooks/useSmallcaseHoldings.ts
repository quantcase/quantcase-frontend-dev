"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet, apiAuthPost } from "@/lib/api";
import type { SmallcaseHoldingsData } from "@/types/smallcase";

interface State {
  data: SmallcaseHoldingsData | null;
  loading: boolean;
  error: string | null;
  notConnected: boolean;
  /** True while a broker-side re-sync is in flight (POST /holdings/sync). */
  syncing: boolean;
}

export function useSmallcaseHoldings() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, notConnected: false, syncing: false });

  // The GET itself — kept free of any pre-call setState so it can run straight from
  // the mount effect without tripping react-hooks/set-state-in-effect.
  const load = useCallback(() => {
    apiAuthGet<{ success: boolean; data: SmallcaseHoldingsData }>(
      `${BACKEND_URL}/api/smallcase/holdings`,
      {
        onSuccess: (res) => {
          setState(s => ({ ...s, data: res.data, loading: false, error: null, notConnected: false }));
        },
        onError: (err) => {
          const notConnected = err.includes("404") || err.toLowerCase().includes("not connected");
          setState(s => ({ ...s, data: null, loading: false, error: notConnected ? null : err, notConnected }));
        },
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, []);

  // User-triggered refetch: flip to a loading state, then run the GET.
  const fetch = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null, notConnected: false }));
    load();
  }, [load]);

  // Trigger a broker-side refetch, then reload the local holdings once it settles.
  const sync = useCallback(() => {
    setState(s => ({ ...s, syncing: true, error: null }));
    apiAuthPost<{ success: boolean; data?: SmallcaseHoldingsData }>(
      `${BACKEND_URL}/api/smallcase/holdings/sync`,
      {
        onSuccess: (res) => {
          // Prefer the freshly-synced payload when the endpoint returns it; otherwise re-GET.
          if (res.data) {
            setState(s => ({ ...s, data: res.data!, error: null, notConnected: false }));
          } else {
            fetch();
          }
        },
        onError: (err) => setState(s => ({ ...s, error: err })),
        onComplete: () => setState(s => ({ ...s, syncing: false })),
      }
    );
  }, [fetch]);

  // Initial load — state already starts in { loading: true }, so no setState here.
  useEffect(() => { load(); }, [load]);

  return { ...state, refetch: fetch, sync };
}
