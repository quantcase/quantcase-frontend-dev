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
  // thesis.body as its raw paragraph array — the white radar card renders these
  // as the "3 bullets of thesis body". `thesis` keeps the joined string form for
  // any legacy consumer.
  thesis_points: string[];
  // verdict.strengths / concerns / watch_for — the three semantic pill groups at
  // the foot of the dark verdict panel (positive / concern / watch dots).
  evidence: string[];
  concerns: string[];
  watch_outs: string[];
  analyzed_at: string;
}

export interface AnalysisResponse {
  success: boolean;
  ticker: string;
  callId: string;
  insights: InsightData[];
}

// ─── /api/post-html-analysis (layer L3) shapes ─────────────────────────────────
// The L3 analysis endpoint returns one raw result per insight type. These types
// describe that wire format; `adaptL3Result` maps them onto `InsightData`.
// NOTE: L3-specific — a future L4 layer_id may return a different shape, so keep
// these names layer-scoped rather than generic.

export interface L3Thesis {
  title: string;
  headline: string;
  body: string[];
}

export interface L3Verdict {
  body: string;
  rating: string;
  headline: string;
  strengths: string[];
  concerns: string[];
  watch_for: string[];
}

export interface L3Signal {
  signal: string;
  summary: string;
  category: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface L3ResultBody {
  score: number;
  lenses: InsightLens[];
  thesis: L3Thesis;
  verdict: L3Verdict;
  signal_map: L3Signal[];
  verdict_band: string;
}

export interface L3Result {
  id: string;
  layer_id: string;
  type: InsightType;
  ticker: string;
  result: L3ResultBody;
  updated_at: string;
  created_at: string;
}

export interface L3AnalysisResponse {
  success: boolean;
  data: {
    ticker: string;
    layer_id: string;
    results: L3Result[];
  };
}

// ─── /api/post-html-analysis (layer L4) shapes ─────────────────────────────────
// The L4 layer returns a SINGLE `summary` result that rolls the three pillars up
// into one conglomerate view. Its body shape is deliberately different from L3
// (pillar_patterns instead of per-type lenses/thesis/verdict), so keep these
// names layer-scoped. `adaptL4Summary` maps them onto the flat `OverviewAnalysis`
// shape the /overview components already consume.

export type L4Pillar = "Management" | "Opportunity" | "Deal";

export interface L4LensRating {
  lens: string;
  score: number;
  rating: string;
}

export interface L4PatternBody {
  name: string;
  spark: number[];
  trend: string;
  lenses: L4LensRating[];
  snapshot: string;
  interpretation: string;
  evidence_strength: string;
}

export interface L4PillarPattern {
  pillar: L4Pillar;
  pattern: L4PatternBody;
}

export interface L4SummaryBody {
  about: string;
  score: number;
  title: string;
  thesis: string;
  verdict: string;
  subtitle: string;
  watch_outs: string[];
  pillar_patterns: L4PillarPattern[];
}

export interface L4Result {
  id: string;
  layer_id: string;
  type: string; // "summary"
  ticker: string;
  result: L4SummaryBody;
  updated_at: string;
  created_at: string;
}

export interface L4AnalysisResponse {
  success: boolean;
  data: {
    ticker: string;
    layer_id: string;
    results: L4Result[];
  };
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
