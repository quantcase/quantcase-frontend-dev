import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiCall } from "@/lib/api";
import type { L4AnalysisResponse } from "@/types/analysis";
import { adaptL4Results } from "@/lib/overview-adapter";
import type { OverviewAnalysis } from "@/types/overview";

// L4 is the current overview layer served by /api/post-html-analysis. It returns
// one rolled-up `summary` result which we adapt to the flat OverviewAnalysis shape.
const LAYER_ID = "l4";

// ─── Fetch hook ────────────────────────────────────────────────────────────────

interface UseOverviewFetchResult {
  data: OverviewAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOverviewFetch(ticker: string): UseOverviewFetchResult {
  const [data, setData] = useState<OverviewAnalysis | null>(null);
  const [loading, setLoading] = useState(!!ticker?.trim());
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!ticker.trim()) { setData(null); setLoading(false); return; }

    const url = `${BACKEND_URL}/api/post-html-analysis?ticker=${ticker}&layer_id=${LAYER_ID}`;
    apiCall<L4AnalysisResponse>(url, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (res) => {
        setData(adaptL4Results(res.data?.results ?? []));
        setLoading(false);
      },
      onError: (err) => { setError(err); setData(null); setLoading(false); },
    });
  }, [ticker]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
