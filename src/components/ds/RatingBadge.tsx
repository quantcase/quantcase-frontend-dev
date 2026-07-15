import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * RatingBadge — encodes the STRONG/FAIR/WEAK (and synonyms) → semantic-color
 * mapping in ONE place, so the audit's "gold for a strong score" mistake
 * cannot recur. STRONG → green, WEAK → red, FAIR/MODERATE → amber (caution).
 *
 * Consolidates the tier mapping that was re-implemented independently across
 * ~6 files (status-badge, verdict-badge, priority-badge, im-score LensRow,
 * insight-scorecard, deal-score-breakdown, …).
 */
type Tier = "up" | "warn" | "down" | "neutral";

const TIER_BY_LABEL: Record<string, Tier> = {
  // positive
  STRONG: "up", HIGH: "up", GOOD: "up", ACHIEVED: "up", BUY: "up",
  SUBSCRIBE: "up", POSITIVE: "up", STABLE: "up", "LOW RISK": "up",
  // caution
  FAIR: "warn", MODERATE: "warn", MEDIUM: "warn", NEUTRAL: "warn",
  STRETCHED: "warn", PENDING: "warn", CAUTION: "warn",
  // negative
  WEAK: "down", LOW: "down", POOR: "down", MISSED: "down", AVOID: "down",
  SELL: "down", NEGATIVE: "down", "HIGH RISK": "down", EXPENSIVE: "down",
};

const VARIANT_BY_TIER: Record<Tier, BadgeVariant> = {
  up: "up",
  warn: "warn",
  down: "down",
  neutral: "muted",
};

/** Resolve a free-text rating/label to its semantic tier. */
export function ratingTier(label: string): Tier {
  return TIER_BY_LABEL[label.trim().toUpperCase()] ?? "neutral";
}

interface RatingBadgeProps {
  label: string;
  /** Force a tier instead of inferring from the label text. */
  tier?: Tier;
  className?: string;
}

export function RatingBadge({ label, tier, className }: RatingBadgeProps) {
  const resolved = tier ?? ratingTier(label);
  return (
    <Badge
      variant={VARIANT_BY_TIER[resolved]}
      className={cn("font-semibold uppercase tracking-[0.04em]", className)}
    >
      {label}
    </Badge>
  );
}
