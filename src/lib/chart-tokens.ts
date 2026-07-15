/**
 * Single source of truth for CHART / data-viz colors.
 *
 * Charts render into SVG (Recharts) or `<canvas>`. SVG attributes accept
 * `var(--qc-*)` strings directly, so for **semantic** series (gains/losses,
 * M/O/D dimensions, etc.) prefer the `QC` helpers below — they resolve through
 * the same `--qc-*` tokens as the rest of the app, so a token edit in
 * globals.css cascades into the charts too.
 *
 * For **canvas** contexts (which cannot resolve CSS custom properties) call
 * `readQC()` to pull the computed token value at draw time.
 *
 * `SEQUENTIAL` / `CATEGORICAL` are the ONE place decorative multi-series ramps
 * live. They intentionally stay visually distinct (a monochrome ink ramp would
 * make stacked bars / multi-slice donuts unreadable), but they're centralized
 * here so there is still a single control point rather than per-file hex.
 */

/** CSS `var(--qc-*)` strings — valid as SVG `fill`/`stroke` attribute values. */
export const QC = {
  ink: "var(--qc-ink)",
  ink2: "var(--qc-ink-2)",
  ink3: "var(--qc-ink-3)",
  hair: "var(--qc-hair)",
  section: "var(--qc-section)",
  card: "var(--qc-card)",
  onDark: "var(--qc-on-dark)",
  up: "var(--qc-up)",
  upSoft: "var(--qc-up-soft)",
  down: "var(--qc-down)",
  downSoft: "var(--qc-down-soft)",
  warn: "var(--qc-warn)",
  warnSoft: "var(--qc-warn-soft)",
  blue: "var(--qc-blue)",
  blueSoft: "var(--qc-blue-soft)",
  brandAccent: "var(--qc-brand-accent)",
  brandAccentSoft: "var(--qc-brand-accent-soft)",
  lime: "var(--qc-lime)",
  limeSoft: "var(--qc-lime-soft)",
  limeEdge: "var(--qc-lime-edge)",
  goldenInk: "var(--qc-golden-ink)",
} as const;

/**
 * The M / O / D pillar (Management / Opportunity / Deal) dimension palette —
 * semantic and recurring across pillar charts, the diary, and the journal.
 * Active = blue / green / amber (= --qc-blue / --qc-up / --qc-warn).
 */
export const PILLAR = {
  M: QC.blue,
  O: QC.up,
  D: QC.warn,
} as const;

export const PILLAR_MUTED = {
  M: QC.ink,
  O: QC.ink2,
  D: QC.ink3,
} as const;

/**
 * Decorative sequential ramp for multi-slice / stacked series that carry NO
 * semantic meaning (e.g. shareholding composition, capital structure). Built
 * from the brand plum + lime/golden accents so it stays on-brand while
 * remaining distinguishable. Single control point for all such ramps.
 */
export const SEQUENTIAL = [
  "var(--qc-ink)",
  "var(--qc-brand-accent)",
  "var(--qc-blue)",
  "var(--qc-up)",
  "var(--qc-lime-edge)",
  "var(--qc-golden-ink)",
  "var(--qc-ink-3)",
] as const;

/**
 * Read a `--qc-*` token's computed value for `<canvas>` contexts, which cannot
 * resolve `var(...)`. Falls back to the given literal during SSR / before
 * hydration. Call at draw time so a token change is picked up on re-render.
 */
export function readQC(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
