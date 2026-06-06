import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiCall } from "@/lib/api";
import type { OverviewAnalysis, OverviewAnalysisApiResponse } from "@/types/overview";

// ─── Fetch hook ────────────────────────────────────────────────────────────────

interface UseOverviewFetchResult {
  data: OverviewAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOverviewFetch(ticker: string): UseOverviewFetchResult {
  const [data, setData] = useState<OverviewAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!ticker.trim()) return;
    apiCall<OverviewAnalysisApiResponse>(`${BACKEND_URL}/api/analysis/overview?ticker=${ticker}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => {
        const d = res.data;
        setData(d.available ? d : null);
        setLoading(false);
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [ticker]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

