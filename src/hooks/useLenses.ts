import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import { LENS_DISPLAY_NAME } from "@/lib/analysis-adapter";

// Apply the frontend-only lens display-name overrides (shared with the L3 adapter)
// so the lens drawer header matches the relabelled card/tile/radar names.
function relabelLensDetails(
  categories: Record<LensCategory, LensDetail[]>,
): Record<LensCategory, LensDetail[]> {
  const relabel = (lenses: LensDetail[]) =>
    lenses.map((l) => ({ ...l, name: LENS_DISPLAY_NAME[l.slug] ?? l.name }));
  return {
    management: relabel(categories.management ?? []),
    opportunity: relabel(categories.opportunity ?? []),
    deal: relabel(categories.deal ?? []),
  };
}

export interface TimeseriesPoint {
  callId: string | null;
  period: string;
  fiscal_year: string;
  quarter: string;
  call_date: string | null;
  value: number;
  abbrUsed: string;
}

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
  sentence?: string | null;
  statement: string | null;
  original_statement: string | null;
  source_ref?: string | null;
  evidence?: PatternEvidence[];
  timeseries?: {
    annual: TimeseriesPoint[];
    latest_quarter: TimeseriesPoint | null;
  };
}

export interface PatternEvidence {
  quote: string;
  value: number;
  period: string;
  signal_id: string;
}

export interface Pattern {
  pattern_type: "drumbeat" | "emergence" | "going_quiet" | "tone_divergence" | "narrative_gap" | "street_pressure" | string;
  label: string;
  impact: "high" | "medium" | "low" | string;
  direction: "positive" | "negative" | "neutral" | "watch" | string;
  sentence: string;
  confidence: number;
  confidence_reason: string;
  evidence: PatternEvidence[];
  statement?: string | null;
  source_ref?: string | null;
  shape_data: string | null;
  shape_label: string | null;
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
  patterns?: Pattern[];
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

    authFetch(`${BACKEND_URL}/api/lenses?ticker=${ticker}`)
      .then((r) => r.json())
      .then((data: LensesApiResponse) => {
        setLenses(relabelLensDetails(data.categories ?? { management: [], opportunity: [], deal: [] }));
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [ticker]);

  return { lenses, loading, error };
}

export interface FinancialStrengthData {
  ticker: string;
  call_id: string;
  available: boolean;
  is_stale: boolean;
  computed_at: string | null;
  score: number;
  status: string | null;
  z_score: number | null;
  takeaway: string | null;
  key_metrics: Record<string, string>;
  highlights: string[];
  risks: string[];
  top_signals: TopSignal[];
}

interface UseFinancialStrengthResult {
  data: FinancialStrengthData | null;
  loading: boolean;
  error: string | null;
}

export function useFinancialStrength(ticker: string): UseFinancialStrengthResult {
  const [data, setData] = useState<FinancialStrengthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);

    authFetch(`${BACKEND_URL}/api/opportunity/financial-strength?ticker=${ticker}`)
      .then((r) => r.json())
      .then((res: { success: boolean; data: FinancialStrengthData }) => {
        setData(res.data ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [ticker]);

  return { data, loading, error };
}
