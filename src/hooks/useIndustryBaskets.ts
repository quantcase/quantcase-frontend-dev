import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";

export interface IndustryBasketMetrics {
  composite_score: number;
  velocity_3w: number;
  breadth_pct: number;
  stock_count: number;
}

export interface IndustryBasket {
  id: string;
  title: string;
  etfTicker: string;
  signal: "BUY" | "WAIT" | "AVOID";
  metrics: IndustryBasketMetrics;
}

export interface IndustryBasketsApiResponse {
  as_of_date: string;
  summary: { buy: number; wait: number; avoid: number };
  baskets: IndustryBasket[];
}

export function useIndustryBaskets() {
  const [data, setData] = useState<IndustryBasketsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<IndustryBasketsApiResponse>(`${BACKEND_URL}/api/industry-baskets`, {
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (json) => {
        setData(json);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, []);

  return { data, loading, error };
}
