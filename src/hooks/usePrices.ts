import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
}

interface PricesResponse {
  symbol: string;
  ticker: string;
  count: number;
  prices: PriceBar[];
}

export function usePrices(symbol: string) {
  const [prices, setPrices] = useState<PriceBar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;
    rawFetch<PricesResponse>(`${BACKEND_URL}/api/screener/${symbol}/prices`, {
      onStart: () => { setLoading(true); setError(null); setPrices([]); },
      onSuccess: (res) => { setPrices(res.prices); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol]);

  return { prices, loading, error };
}
