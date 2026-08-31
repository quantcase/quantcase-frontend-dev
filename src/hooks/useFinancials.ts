import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { FinancialsResponse } from "@/types/financials";

export function useFinancials(symbol: string, reportType?: "C" | "S") {
  const [data, setData] = useState<FinancialsResponse | null>(null);
  const [loading, setLoading] = useState(!!symbol?.trim());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) { setLoading(false); return; }
    let url = `${BACKEND_URL}/api/screener/${symbol}/financials`;
    if (reportType) url += `?reportType=${reportType}`;
    rawFetch<FinancialsResponse>(url, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol, reportType]);

  return { data, loading, error };
}
