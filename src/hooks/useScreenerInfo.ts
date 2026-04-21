import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";

interface ScreenerInfo {
  symbol: string;
  ticker: string;
  company: {
    name: string;
    exchange: string;
    sector: string;
    industry: string;
    description: string;
    website: string;
    employees: number;
    country: string;
  };
}

export function useScreenerInfo(symbol: string) {
  const [data, setData] = useState<ScreenerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;
    rawFetch<ScreenerInfo>(`${BACKEND_URL}/api/screener/${symbol}/`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol]);

  return { data, loading, error };
}
