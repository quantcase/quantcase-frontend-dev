/**
 * Presentation-only constants for the Wyckoff page.
 *
 * Everything analytical now comes from the API — this file holds copy and
 * token mappings, nothing derived.
 */

import type {
  SignalDirection,
  StructureTrend,
  VolumeBias,
  WyckoffSubPhase,
} from "@/types/wyckoff";

/** Narrative for each cycle stage, indexed to `cycle.phases`. */
export const CYCLE_DESC = [
  "Institutions absorbing supply after a downtrend — or a pause before another leg down.",
  "Higher highs and higher lows. Demand in control.",
  "Uptrend stalled sideways. Healthy pause or early distribution.",
  "Price stalling at highs. Smart money quietly offloading.",
  "Supply in control. Price trending lower.",
  "Downtrend paused sideways. Brief rest before the next leg down.",
];

/** Expanded copy for the terse sub-phase codes the engine returns. */
export const SUB_PHASE_COPY: Partial<Record<WyckoffSubPhase, string>> = {
  Spring: "Spring — Phase C shakeout detected",
  "SOS Pullback": "Last Point of Support detected",
  "SOS Breakout": "Sign of Strength breakout",
  UTAD: "Upthrust After Distribution detected",
  LPSY: "Last Point of Supply detected",
};

/**
 * Semantic tone, driven off `signal.direction` — never off the phase name.
 * Green = positive, red = negative, ink = neutral. Amber stays reserved for
 * caution states (split warnings, stale data), per the design-system contract.
 */
export interface Tone {
  text: string;
  /** Tinted surface — for panels. */
  bg: string;
  /** Full-strength fill — for rules, bars and accents. */
  solid: string;
  border: string;
  /** Token name for canvas, which can't resolve CSS custom properties. */
  cssVar: string;
}

export const DIRECTION_TONE: Record<SignalDirection, Tone> = {
  bullish: {
    text: "text-up",
    bg: "bg-up-soft",
    solid: "bg-up",
    border: "border-up/25",
    cssVar: "--qc-up",
  },
  bearish: {
    text: "text-down",
    bg: "bg-down-soft",
    solid: "bg-down",
    border: "border-down/25",
    cssVar: "--qc-down",
  },
  neutral: {
    text: "text-ink",
    bg: "bg-[var(--qc-section)]",
    solid: "bg-ink",
    border: "border-hair",
    cssVar: "--qc-ink",
  },
};

export const STRUCTURE_COPY: Record<StructureTrend, string> = {
  uptrend: "↗ Uptrend",
  downtrend: "↘ Downtrend",
  insufficient: "—",
};

export const VOLUME_BIAS_COPY: Record<VolumeBias, string> = {
  bullish: "↑ Bullish",
  bearish: "↓ Bearish",
  neutral: "→ Neutral",
};

/** ISO 4217 → symbol. Falls back to the code itself for anything unmapped. */
const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOL[currency] ?? currency;
}

/** Formats a price with the response's currency — never hardcode ₹. */
export function fmtPrice(value: number, currency: string, decimals = 2): string {
  return `${currencySymbol(currency)}${value.toFixed(decimals)}`;
}

export function fmtPct(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/** Compact Indian-style volume: 1.2Cr / 3.4L. */
export function fmtVolume(v: number): string {
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  return v.toLocaleString();
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
