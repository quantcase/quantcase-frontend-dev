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
  // Comparative Relative Strength (CRS) lines for the Dominance bucket. Shipped
  // in the same `indicators` payload as the rest; optional so pre-CRS payloads
  // (backend not yet updated) still typecheck and simply render no lines.
  crsStockVsNifty?: IndicatorPoint[];
  crsStockVsSector?: IndicatorPoint[];
  crsSectorVsNifty?: IndicatorPoint[];
}

interface PricesResponse {
  symbol: string;
  ticker: string;
  count: number;
  prices: PriceBar[];
  indicators?: PriceIndicators;
}

export interface UsePricesOptions {
  years?: number;
  from?: string;
  to?: string;
}

export function usePrices(symbol: string, options?: UsePricesOptions) {
  const [prices, setPrices] = useState<PriceBar[]>([]);
  const [indicators, setIndicators] = useState<PriceIndicators | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = options?.years;
  const from = options?.from;
  const to = options?.to;

  useEffect(() => {
    if (!symbol?.trim()) return;
    const params = new URLSearchParams();
    if (years != null) params.set("years", String(years));
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString() ? `?${params.toString()}` : "";

    rawFetch<PricesResponse>(`${BACKEND_URL}/api/screener/${symbol}/prices${qs}`, {
      onStart: () => { setLoading(true); setError(null); setPrices([]); setIndicators(null); },
      onSuccess: (res) => {
        setPrices(res.prices);
        setIndicators(res.indicators ?? null);
        setLoading(false);
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol, years, from, to]);

  return { prices, indicators, loading, error };
}
