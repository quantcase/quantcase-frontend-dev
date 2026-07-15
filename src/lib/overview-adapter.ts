// Maps the raw /api/post-html-analysis (layer L4) `summary` result onto the flat
// OverviewAnalysis shape the /overview components already consume. Keeping the
// mapping in one place means the many downstream components stay untouched.
//
// NOTE: L4-specific. L4 rolls the three pillars into ONE summary result whose
// body (pillar_patterns, about, watch_outs) differs from the L3 per-type shape,
// so this lives alongside `adaptL3Result` rather than overloading it.

import type { L4Result, L4SummaryBody, L4PillarPattern } from "@/types/analysis";
import type { OverviewAnalysis, OverviewDimension } from "@/types/overview";

// The L4 verdict is a single word ("STRONG" | "MODERATE" | "WEAK"). Map it onto
// the band / conviction / action-bias fields the panel + cards read.
function bandForVerdict(verdict: string): string {
  const v = (verdict ?? "").toUpperCase();
  if (v.includes("STRONG")) return "Strong Band";
  if (v.includes("WEAK")) return "Weak Band";
  return "Moderate Band";
}

function convictionForVerdict(verdict: string): "LOW" | "MEDIUM" | "HIGH" {
  const v = (verdict ?? "").toUpperCase();
  if (v.includes("STRONG")) return "HIGH";
  if (v.includes("WEAK")) return "LOW";
  return "MEDIUM";
}

// Average of a pattern's lens scores → the pillar's rollup score (0–100).
function pillarScore(p: L4PillarPattern): number {
  const lenses = p.pattern?.lenses ?? [];
  if (lenses.length === 0) return 0;
  const sum = lenses.reduce((acc, l) => acc + (l.score ?? 0), 0);
  return Math.round(sum / lenses.length);
}

// pillar_patterns → OverviewDimension[]. The QC-insight narrative reads
// `dimensions[].headline`; we surface each pillar's `snapshot` there.
function toDimensions(patterns: L4PillarPattern[]): OverviewDimension[] {
  return patterns.map((p) => ({
    type: p.pillar.toLowerCase() as OverviewDimension["type"],
    score: pillarScore(p),
    weight: 0,
    verdict: p.pattern?.name ?? null,
    verdict_band: null,
    headline: p.pattern?.snapshot ?? null,
    contribution: 0,
  }));
}

export function adaptL4Summary(raw: L4Result): OverviewAnalysis {
  const r: L4SummaryBody = raw.result;

  return {
    ticker: raw.ticker,
    callId: "",
    available: true,
    analyzed_at: raw.updated_at ?? null,
    // CompanyProfileCard / FundamentalOverviewCard render `about` as the snapshot.
    snapshot: r.about ?? "",
    // L4 has no separate technical narrative — technicals card falls back to its own.
    technical_summary: "",
    score: r.score ?? 0,
    verdict: r.verdict ?? "",
    verdict_band: bandForVerdict(r.verdict ?? ""),
    conviction: convictionForVerdict(r.verdict ?? ""),
    // Decision-intelligence "Overall Rating" headline + supporting line.
    headline: r.title ?? "",
    subtitle: r.subtitle ?? "",
    // `subtitle` is the actionable directive ("Wait for digital monetization…").
    action_bias: r.subtitle ?? r.verdict ?? "",
    dimensions: toDimensions(r.pillar_patterns ?? []),
    key_signals: [],
    signal_map: [],
    thesis: r.thesis ?? "",
    evidence: [],
    watch_outs: r.watch_outs ?? [],
    technical_regime: "",
    ideal_for: "",
    timeframe: "",
    ic_metrics: [],
  };
}

// The L4 endpoint returns an array; pick the single `summary` result.
export function adaptL4Results(results: L4Result[]): OverviewAnalysis | null {
  const summary = results.find((r) => r.type === "summary") ?? results[0] ?? null;
  return summary ? adaptL4Summary(summary) : null;
}
