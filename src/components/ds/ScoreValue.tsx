import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * ScoreValue — the ONE "big number / N" score display.
 *
 * Replaces the divergent big-number treatments (oversized green numerics in
 * final-conclusion-card, inline fontSize + var(--qc-ink-3) in book-at-a-glance,
 * the "82 /100" diary panel text, etc). Mono, navy ink — a score is data, not
 * sentiment, so it is not green. Use `tier` only when the number itself must
 * signal good/caution/bad.
 */
type Tier = "up" | "warn" | "down";

const TIER_TEXT: Record<Tier, string> = {
  up: "text-up",
  warn: "text-warn",
  down: "text-down",
};

const SIZES = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
} as const;

interface ScoreValueProps {
  value: number | string;
  /** Denominator shown as a muted "/max" suffix. */
  max?: number;
  size?: keyof typeof SIZES;
  tier?: Tier;
  className?: string;
  /** For a dynamic per-value color (e.g. a continuous score→color scale). */
  style?: CSSProperties;
}

export function ScoreValue({ value, max, size = "md", tier, className, style }: ScoreValueProps) {
  return (
    <span
      className={cn("font-mono font-semibold tabular-nums", SIZES[size], tier ? TIER_TEXT[tier] : "text-ink", className)}
      style={style}
    >
      {value}
      {max != null && (
        <span className="ml-0.5 align-baseline text-[0.45em] font-medium text-ink-3">/{max}</span>
      )}
    </span>
  );
}
