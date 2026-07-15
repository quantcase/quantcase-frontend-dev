import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge — the canonical semantic dot/glyph pill.
 *
 * Replaces the bespoke opportunity/status-badge, wealthos/priority-badge, and
 * the diary ✓/⚡/✕ SignalChip cloud. Sentiment drives BOTH the glyph and the
 * color from a single source (green ✓ positive, amber ⚡ caution, red ✕
 * negative, neutral •). Fixed padding/radius so a row of them wraps evenly.
 */
export type StatusSentiment = "positive" | "caution" | "negative" | "neutral";

const GLYPH: Record<StatusSentiment, string> = {
  positive: "✓",
  caution: "⚡",
  negative: "✕",
  neutral: "•",
};

const VARIANT: Record<StatusSentiment, BadgeVariant> = {
  positive: "up",
  caution: "warn",
  negative: "down",
  neutral: "muted",
};

interface StatusBadgeProps {
  label: string;
  sentiment?: StatusSentiment;
  /** Hide the leading glyph (dot/check/cross). */
  hideGlyph?: boolean;
  className?: string;
}

export function StatusBadge({
  label,
  sentiment = "neutral",
  hideGlyph = false,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={VARIANT[sentiment]}
      className={cn("gap-1.5 font-medium", className)}
    >
      {!hideGlyph && <span aria-hidden className="leading-none">{GLYPH[sentiment]}</span>}
      {label}
    </Badge>
  );
}
