import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * GradientPanel — the ONE gradient surface primitive.
 *
 * Replaces the canonical `.qc-dark-gradient-card`, `GoldenCard`/`LimeGradientCard`
 * bodies, the 6 hardcoded inline dark-navy/purple gradients (insight-tab,
 * place-order-modal, community-discussion-row, LandingPoweredByAi,
 * complete-journal-modal), and the 8× copy-pasted lime-banner glow.
 *
 * Every tone reads --qc-* tokens (no hardcoded ramps), so all dark surfaces
 * across the app share ONE gradient definition — fixing the audit's
 * "dashboard vs management vs QC-Intuition gradients don't match".
 *
 *  - dark    → the layered navy glow (verdict heroes, research banners)
 *  - verdict → alias of dark (semantic name for verdict hero cards)
 *  - golden  → soft gold (meeting/next-up strips)
 *  - lime    → lime intelligence banners
 */
export type GradientTone = "dark" | "verdict" | "golden" | "lime";

const TONE_CLASS: Record<GradientTone, string> = {
  dark: "qc-dark-gradient-card",
  verdict: "qc-dark-gradient-card",
  golden: "qc-golden-card",
  lime: "qc-lime-gradient-card",
};

/** Text color that reads on each tone — for convenience defaulting. */
const TONE_TEXT: Record<GradientTone, string> = {
  dark: "text-[var(--qc-on-dark)]",
  verdict: "text-[var(--qc-on-dark)]",
  golden: "text-ink",
  lime: "text-ink",
};

interface GradientPanelProps {
  tone?: GradientTone;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: number;
  /** Skip the default readable text color (when children set their own). */
  bareText?: boolean;
}

export function GradientPanel({
  tone = "dark",
  children,
  className,
  style,
  radius = 18,
  bareText = false,
}: GradientPanelProps) {
  return (
    <div
      className={cn(TONE_CLASS[tone], !bareText && TONE_TEXT[tone], className)}
      style={{ borderRadius: radius, ...style }}
    >
      {children}
    </div>
  );
}
