export interface OverviewDimension {
  type: "management" | "opportunity" | "deal" | "technicals";
  score: number;
  weight: number;
  verdict: string | null;
  verdict_band: string | null;
  headline: string | null;
  contribution: number;
}

// ─── Pillar patterns (L4) ──────────────────────────────────────────────────────
// The L4 summary carries a "pattern" per pillar with a mini time-series (`spark`),
// a trend, a plain-language snapshot, a long-form interpretation, and the lens
// ratings that roll up into the pillar. This drives the QC-Insight "what's moving
// the thesis" pattern cards + the "twelve lenses" grid on /overview.

export interface OverviewLensRating {
  lens: string;
  score: number;
  rating: string;
}

export interface OverviewPillarPattern {
  pillar: "management" | "opportunity" | "deal";
  name: string;
  snapshot: string;
  interpretation: string;
  trend: "rising" | "steady" | "falling" | string;
  evidenceStrength: string;
  spark: number[];
  score: number;
  lenses: OverviewLensRating[];
}

export interface OverviewKeySignal {
  label: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface OverviewSignalMapItem {
  category: string;
  signal: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface IcMetric {
  category: "entry_trigger" | "suggested_stop" | "upside_target" | "time_horizon";
  title: string;
  value: string;
  label: string;
  description: string;
  status: "active" | "pending" | "avoid";
}

export interface OverviewAnalysis {
  ticker: string;
  callId: string;
  available: boolean;
  analyzed_at: string | null;
  snapshot: string;
  technical_summary: string;
  score: number;
  verdict: string;
  verdict_band: string;
  conviction: "LOW" | "MEDIUM" | "HIGH";
  headline: string;
  subtitle: string;
  dimensions: OverviewDimension[];
  pillar_patterns: OverviewPillarPattern[];
  key_signals: OverviewKeySignal[];
  signal_map: OverviewSignalMapItem[];
  thesis: string;
  evidence: string[];
  watch_outs: string[];
  action_bias: string;
  technical_regime: string;
  ideal_for: string;
  timeframe: string;
  ic_metrics?: IcMetric[];
}

