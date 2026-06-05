import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";

export interface TopSignal {
  signal_id: string | null;
  metric: string;
  label: string;
  guided_value: number | null;
  guided_date: string | null;
  value_targeted: number | null;
  value_at_announcement: number | null;
  announcement_date: string | null;
  target_date: string | null;
  actual_value: number | null;
  actual_date: string | null;
  unit: string | null;
  delta: number | null;
  delta_pct: number | null;
  direction: string | null;
  impact: string | null;
  statement: string | null;
  original_statement: string | null;
}

export interface LensDetail {
  slug: string;
  name: string;
  description: string;
  category: string;
  computed: boolean;
  score: number;
  status: string | null;
  takeaway: string | null;
  key_metrics: Record<string, string>;
  highlights: string[];
  risks: string[];
  z_score: number | null;
  signal_count: number;
  computed_at: string | null;
  top_signals?: TopSignal[];
}

export type LensCategory = "management" | "opportunity" | "deal";

interface LensesApiResponse {
  ticker: string;
  callId: string;
  categories: Record<LensCategory, LensDetail[]>;
}

interface UseLensesResult {
  lenses: Record<LensCategory, LensDetail[]>;
  loading: boolean;
  error: string | null;
}

export function useLenses(ticker: string): UseLensesResult {
  const [lenses, setLenses] = useState<Record<LensCategory, LensDetail[]>>({ management: [], opportunity: [], deal: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);

    fetch(`${BACKEND_URL}/api/lenses?ticker=${ticker}`)
      .then((r) => r.json())
      .then((data: LensesApiResponse) => {
        setLenses(data.categories ?? { management: [], opportunity: [], deal: [] });
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [ticker]);

  return { lenses, loading, error };
}
