import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { FinancialsResponse } from "@/types/financials";

export function useFinancials(symbol: string) {
  const [data, setData] = useState<FinancialsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;
    rawFetch<FinancialsResponse>(`${BACKEND_URL}/api/screener/${symbol}/financials`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol]);

  return { data, loading, error };
}
