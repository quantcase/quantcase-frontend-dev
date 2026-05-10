import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";

export interface Signal {
  id: string;
  call_id: string;
  ticker: string;
  fiscal_year: string;
  quarter: string;
  call_date: string;
  source_type: string;
  signal_type: string;
  metric: string;
  value: number | null;
  raw_value: string | null;
  unit: string | null;
  multiplier: number;
  impact: string | null;
  severity: string | null;
  metric_family: string | null;
  statement: string | null;
  start_date: string | null;
  end_date: string | null;
  period_type: string | null;
  is_invalidated: boolean;
  created_at: string;
  updated_at: string;
}

interface SignalsApiResponse {
  count: number;
  signals: Signal[];
}

interface UseSignalsResult {
  signals: Signal[];
  loading: boolean;
  error: string | null;
}

export function useSignals(callId: string): UseSignalsResult {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId.trim()) return;
    setLoading(true);
    setError(null);

    fetch(`${BACKEND_URL}/api/signals?callId=${callId}`)
      .then((r) => r.json())
      .then((data: SignalsApiResponse) => {
        setSignals(data.signals ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [callId]);

  return { signals, loading, error };
}
