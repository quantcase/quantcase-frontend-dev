import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { IndustryBasket, IndustryBasketMetrics } from "@/hooks/useIndustryBaskets";

export interface IndustryBasketStock {
  ticker: string;
  composite_score: number;
  factors: {
    momentum?: number;
    growth?: number;
    quality?: number;
    value?: number;
    [key: string]: number | undefined;
  };
}

interface IndustryBasketStocksPagination {
  page: number;
  size: number;
  total: number;
}

export interface IndustryBasketStocksApiResponse {
  basket: Pick<IndustryBasket, "id" | "signal" | "metrics"> & { title?: string; etfTicker?: string };
  pagination: IndustryBasketStocksPagination;
  stocks: IndustryBasketStock[];
}

export function useIndustryBasketStocks(basketId: string | null) {
  const [data, setData] = useState<IndustryBasketStocksApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!basketId) return;

    rawFetch<IndustryBasketStocksApiResponse>(
      `${BACKEND_URL}/api/industry-baskets/${basketId}/stocks`,
      {
        onStart: () => {
          setLoading(true);
          setError(null);
          setData(null);
        },
        onSuccess: (json) => {
          setData(json);
          setLoading(false);
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
      }
    );
  }, [basketId]);

  return { data, loading, error };
}
