"use client";

import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiCall } from "@/lib/api";
import type { StocksApiResponse } from "@/types/screener";

export interface StockOption {
  ticker: string;
  name: string;
  industry: string;
}

// The full tradeable stock universe (ticker + name), for ticker autocomplete.
// Public endpoint (no auth) — mirrors how the screener asset bar loads it.
export function useStocks() {
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (res) => {
        setStocks(
          (res.data ?? [])
            // The universe occasionally carries rows with a null/empty symbol or
            // name; drop them so downstream `.toLowerCase()` filters never throw.
            .filter((s) => s.company && s.company_name)
            .map((s) => ({
              ticker: s.company,
              name: s.company_name,
              industry: s.basic_industry,
            }))
        );
      },
      onError: () => setStocks([]),
      onComplete: () => setLoading(false),
    });
  }, []);

  return { stocks, loading };
}
