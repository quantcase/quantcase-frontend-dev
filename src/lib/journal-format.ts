// Presentation helpers for the unified Journal UI (composer, entry timeline,
// health badges). Salvaged from the retired complete-journal-modal so the new
// components share one source of truth for dimension colors, conviction copy,
// and sub-factor hint text.

import type { Dimension, ThesisHealth, MarketConviction } from "@/types/journal";
import type { StatusSentiment } from "@/components/ds";

// ── Dimension colors (M = green / O = blue / D = brand accent) ───────────────

export function dimColor(dim: Dimension): string {
  if (dim === "M") return "var(--qc-up)";
  if (dim === "O") return "var(--qc-blue)";
  return "var(--qc-brand-accent)";
}

export function dimBg(dim: Dimension): string {
  if (dim === "M") return "var(--qc-up-soft)";
  if (dim === "O") return "var(--qc-blue-soft)";
  return "var(--qc-brand-accent-soft)";
}

// ── Conviction (1..5) copy ──────────────────────────────────────────────────

export const CONV_LABELS: { label: string; desc: string }[] = [
  { label: "Watching",   desc: "Not yet decided" },
  { label: "Interested", desc: "Early signals positive" },
  { label: "Moderate",   desc: "Core thesis in place" },
  { label: "High",       desc: "Strong conviction" },
  { label: "Highest",    desc: "Maximum conviction" },
];

// ── Sub-factor hint copy (keyed by the exact sub-factor label) ──────────────

export const SF_HINTS: Record<string, string> = {
  "Guidance Accuracy":       "Management has consistently delivered on forward guidance — or consistently missed. Check how closely revenue/margin actuals tracked what was said.",
  "Capital Allocation":      "Where does surplus cash go — buybacks, dividends, acquisitions, or capex? Compounders allocate capital to highest-return uses.",
  "Disclosure Honesty":      "Does management acknowledge headwinds early, or bury negatives? Tone in concalls, change in auditor, related-party transactions.",
  "Industry Tailwind":       "Is demand for this product/service structurally growing? Is this a sunrise sector or a sunset one with temporary revival?",
  "Distribution Strength":   "How deep is the reach — geographically and across customer segments? A strong distribution moat is hard to replicate.",
  "Competitive Edge":        "What stops competitors from taking share? Brand, switching costs, network effects, patents, regulatory moats.",
  "TAM Expansion":           "Is the total addressable market growing through new geographies, new customer segments, or adjacent products?",
  "Valuation":               "Is the stock cheap vs intrinsic value, vs sector peers, and vs its own historical multiples?",
  "Earnings Growth/Quality": "Is EPS growing — and is that growth real (operating leverage, volume) vs manufactured (buybacks, one-offs)?",
  "P/E Re-rating Potential": "Is there a specific trigger — debt paydown, margin improvement, sector rotation — that could cause the multiple to expand?",
  "Risk-Reward":             "At the current price, what do you make in the bull case vs what you lose in the bear case? Is the skew favourable?",
};

// ── Thesis health → StatusBadge sentiment ───────────────────────────────────

export function thesisHealthSentiment(h: ThesisHealth): StatusSentiment {
  if (h === "intact") return "positive";
  if (h === "partial") return "caution";
  if (h === "broken") return "negative";
  return "neutral"; // "none"
}

export function thesisHealthLabel(h: ThesisHealth): string {
  if (h === "intact") return "Intact";
  if (h === "partial") return "Partial";
  if (h === "broken") return "Broken";
  return "Neutral";
}

// ── Market conviction → StatusBadge sentiment ───────────────────────────────

export function marketConvictionSentiment(c: MarketConviction): StatusSentiment {
  if (c === "POSITIVE") return "positive";
  if (c === "WATCH") return "caution";
  return "neutral"; // NEUTRAL
}

// ── Price formatting ────────────────────────────────────────────────────────

export function fmtPrice(price: number | null): string {
  if (price == null) return "—";
  return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
