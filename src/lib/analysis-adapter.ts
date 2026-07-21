// Maps the raw /api/post-html-analysis (layer L3) wire format onto the flat
// InsightData shape the insight/overview components already consume. Keeping the
// mapping in one place means the many downstream components stay untouched.
//
// NOTE: L3-specific. A future L4 layer_id may return a different result body, in
// which case add an `adaptL4Result` alongside this rather than overloading it.

import type { InsightData, InsightKeySignal, InsightLens, L3Result } from "@/types/analysis";

// How many signals to surface as the dark-panel "key signals" pills.
const MAX_KEY_SIGNALS = 4;

// Every L3 lens `score` is now on a 0–100 scale. The wire `max_score` is stale
// and inconsistent (25 for management/opportunity, 50 for deal), so we ignore it
// and pin every lens to a 100 denominator. Downstream percentage math
// (score / max_score * 100) and the "N/100" display then read correctly.
const LENS_SCALE = 100;

// Frontend-only display-name overrides, keyed by lens slug. The backend still
// serves the original name; we relabel purely for presentation. Keep in sync with
// the drawer's own lookup in useLenses (LENS_DISPLAY_NAME there).
export const LENS_DISPLAY_NAME: Record<string, string> = {
  "pe-rerating-potential": "Earnings Quality",
};

function normalizeLenses(lenses: InsightLens[]): InsightLens[] {
  return lenses.map((l) => ({
    ...l,
    max_score: LENS_SCALE,
    name: LENS_DISPLAY_NAME[l.slug] ?? l.name,
  }));
}

function deriveKeySignals(signalMap: L3Result["result"]["signal_map"]): InsightKeySignal[] {
  return signalMap.slice(0, MAX_KEY_SIGNALS).map((s) => ({
    label: s.summary || s.signal,
    sentiment: s.sentiment,
  }));
}

export function adaptL3Result(raw: L3Result): InsightData {
  const r = raw.result;

  return {
    type: raw.type,
    available: true,
    score: r.score,
    // verdict card / band chip read `verdict` + `verdict_band`.
    verdict: r.verdict?.rating ?? "",
    verdict_band: r.verdict_band ?? "",
    // Dark verdict panel: serif thesis headline + the verdict body paragraph.
    headline: r.thesis?.headline ?? "",
    subtitle: r.thesis?.title ?? "",
    description: r.verdict?.body ?? "",
    key_signals: deriveKeySignals(r.signal_map ?? []),
    lenses: normalizeLenses(r.lenses ?? []),
    signal_map: r.signal_map ?? [],
    // thesis.body is a 3-item paragraph array. Keep both the raw array (white
    // radar card bullets) and the joined string (legacy blurb slot).
    thesis: (r.thesis?.body ?? []).join("\n\n"),
    thesis_points: r.thesis?.body ?? [],
    // Verdict pill groups shown at the foot of the dark panel.
    evidence: r.verdict?.strengths ?? [],
    concerns: r.verdict?.concerns ?? [],
    watch_outs: r.verdict?.watch_for ?? [],
    analyzed_at: raw.updated_at ?? "",
  };
}

export function adaptL3Results(results: L3Result[]): InsightData[] {
  return results.map(adaptL3Result);
}
