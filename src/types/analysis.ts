// Shared types for the unified /api/analysis endpoint

export type InsightType = "management" | "opportunity" | "deal";

export interface InsightKeySignal {
  label: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface InsightLens {
  name: string;
  slug: string;
  score: number;
  status: string;
  subtitle: string;
  max_score: number;
  description: string;
}

export interface InsightSignalMapItem {
  signal: string;
  category?: string;
  label?: string;
  summary?: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface InsightData {
  type: InsightType;
  available: boolean;
  score: number;
  verdict: string;
  verdict_band: string;
  headline: string;
  subtitle: string;
  description: string;
  key_signals: InsightKeySignal[];
  lenses: InsightLens[];
  signal_map: InsightSignalMapItem[];
  thesis: string;
  evidence: string[];
  watch_outs: string[];
  analyzed_at: string;
}

export interface AnalysisResponse {
  success: boolean;
  ticker: string;
  callId: string;
  insights: InsightData[];
}

// Trigger POST /api/analysis response
export interface AnalysisTriggerJob {
  type: InsightType;
  jobId: string;
}

export interface AnalysisTriggerResponse {
  success: boolean;
  message: string;
  callId: string;
  jobs: AnalysisTriggerJob[];
}
