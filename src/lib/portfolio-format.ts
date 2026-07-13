// Shared formatting + semantic-color helpers for the investment diary / portfolio UI.
// Decoupled from any mock data so both live-data pages and modals can reuse them.

import type { ThesisHealth, Pillar } from "@/types/journal";

export function fmt(n: number, digits = 0) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

// Compact INR: ₹2.4 L / ₹38.0 K / ₹450
export function fmtLakhs(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${fmt(n)}`;
}

// Broker slug → display label, e.g. "kite" → "Zerodha" (Kite is Zerodha's platform).
// Unknown slugs fall back to a capitalized version of the slug.
const BROKER_LABELS: Record<string, string> = {
  kite: "Zerodha",
  zerodha: "Zerodha",
  groww: "Groww",
  angelone: "Angel One",
  angel_one: "Angel One",
  upstox: "Upstox",
  hdfc: "HDFC Sec",
  kotak: "Kotak Sec",
  "5paisa": "5paisa",
  axisdirect: "AxisDirect",
};

export function brokerLabel(slug: string | null | undefined): string {
  if (!slug) return "Broker";
  return BROKER_LABELS[slug.toLowerCase()] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export const PILLAR_COLOR: Record<Pillar, string> = {
  mgmt: "var(--qc-up)",
  opp:  "var(--qc-blue)",
  deal: "#7C3AED",
};

export function modColor(score: number) {
  if (score >= 80) return "var(--qc-up)";
  if (score >= 60) return "var(--qc-warn)";
  return "#B91C1C";
}

export interface ThesisStyle {
  label: string;
  color: string;
  bg: string;
  icon: string;
  border: string;
  headerBg: string;
  rule: string;
}

// Visual config keyed to thesis health — colored rule / badge / header tints.
export function thesisConfig(h: ThesisHealth): ThesisStyle {
  if (h === "intact")  return { label: "Intact",    color: "var(--qc-up)",   bg: "var(--qc-up-soft)",   icon: "●", border: "#86EFAC",        headerBg: "var(--qc-up-soft)", rule: "var(--qc-up)"  };
  if (h === "partial") return { label: "Partial",   color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", icon: "⚡", border: "#FCD34D",        headerBg: "#FFFBEB",           rule: "var(--qc-warn)" };
  if (h === "broken")  return { label: "Broken",    color: "#B91C1C",        bg: "#FEF2F2",             icon: "✕", border: "#FCA5A5",        headerBg: "#FEF2F2",           rule: "#B91C1C"        };
  return                      { label: "No thesis", color: "#9A9A92",        bg: "var(--qc-bg)",        icon: "○", border: "var(--qc-hair)", headerBg: "var(--qc-bg)",      rule: "var(--qc-hair)" };
}
