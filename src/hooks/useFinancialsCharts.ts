import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { FinancialsChartsResponse } from "@/types/financials";

export function useFinancialsCharts(symbol: string, reportType?: "C" | "S") {
  const [data, setData] = useState<FinancialsChartsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;
    let url = `${BACKEND_URL}/api/screener/${symbol}/charts`;
    if (reportType) url += `?reportType=${reportType}`;
    rawFetch<FinancialsChartsResponse>(url, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol, reportType]);

  return { data, loading, error };
}
