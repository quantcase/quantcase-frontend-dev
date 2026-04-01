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

export interface IndicatorPoint {
  date: string;
  value: number | null;
}

export interface PriceIndicators {
  sma20: IndicatorPoint[];
  sma50: IndicatorPoint[];
  sma100: IndicatorPoint[];
  sma200: IndicatorPoint[];
  ema20: IndicatorPoint[];
  ema50: IndicatorPoint[];
  bbUpper: IndicatorPoint[];
  bbMiddle: IndicatorPoint[];
  bbLower: IndicatorPoint[];
  cmf14: IndicatorPoint[];
  rsi14: IndicatorPoint[];
  adx14: IndicatorPoint[];
}

interface PricesResponse {
  symbol: string;
  ticker: string;
  count: number;
  prices: PriceBar[];
  indicators?: PriceIndicators;
}

export function usePrices(symbol: string) {
  const [prices, setPrices] = useState<PriceBar[]>([]);
  const [indicators, setIndicators] = useState<PriceIndicators | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;
    rawFetch<PricesResponse>(`${BACKEND_URL}/api/screener/${symbol}/prices`, {
      onStart: () => { setLoading(true); setError(null); setPrices([]); setIndicators(null); },
      onSuccess: (res) => {
        setPrices(res.prices);
        setIndicators(res.indicators ?? null);
        setLoading(false);
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol]);

  return { prices, indicators, loading, error };
}
