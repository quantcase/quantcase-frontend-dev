import { StatusBadge as DsStatusBadge, type StatusSentiment } from "@/components/ds";

interface StatusBadgeProps {
  label: string;
  /** Backend color hint: "green" | "red" | "yellow" (defaults to green). */
  color?: string;
}

const SENTIMENT: Record<string, StatusSentiment> = {
  green: "positive",
  red: "negative",
  yellow: "caution",
};

/**
 * Thin adapter that keeps the backend `{label, color}` contract but renders
 * through the canonical `ds/StatusBadge`. Single source of truth for the pill
 * styling now lives in the design-system primitive.
 */
export function StatusBadge({ label, color }: StatusBadgeProps) {
  return <DsStatusBadge label={label} sentiment={SENTIMENT[color ?? "green"] ?? "positive"} hideGlyph />;
}
