export interface OverviewDimension {
  type: "management" | "opportunity" | "deal" | "technicals";
  score: number;
  weight: number;
  verdict: string | null;
  verdict_band: string | null;
  headline: string | null;
  contribution: number;
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

