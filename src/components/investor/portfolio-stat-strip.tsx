"use client";

import { CtaLink, MonoLabel, ratingTier } from "@/components/ds";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

interface StripSubScore {
  label: string;
  score: number;
  rating: "STRONG" | "FAIR" | "STRETCHED" | "WEAK";
}

interface PortfolioStatStripProps {
  /** Total equity value of the book, in raw rupees. */
  equityValue: number;
  /** Signed change for the book, e.g. 1.5 → "+1.5%". */
  changePct: number | null;
  /** What `changePct` measures, surfaced as a tooltip so a bare % isn't ambiguous. */
  changeLabel?: string;
  /** Portfolio-level MOD score out of 100. */
  modScore: number | null;
  /** M/O/D sub-scores — rendered as the three tier-colored micro-bars. */
  subScores: StripSubScore[];
  stockCount: number;
  brokerConnected?: boolean;
  brokerLabel?: string;
  /** Tickers in the diary with no thesis written yet. */
  unwrittenCount?: number;
  isShadow?: boolean;
  onOpenBreakdown?: () => void;
  onUploadPortfolio?: () => void;
}

const TIER_BAR: Record<string, string> = {
  up: "bg-up",
  warn: "bg-warn",
  down: "bg-down",
  neutral: "bg-[var(--qc-ink-3)]",
};

/** One segmented cell: mono eyebrow above a mono value. */
function Cell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // Stacked rows with bottom hairlines on mobile, segmented cells on sm+.
    <div
      className={`min-w-0 shrink-0 border-b border-hair px-5 py-3.5 sm:border-b-0 sm:border-r ${className ?? ""}`}
    >
      <MonoLabel size={9} tracking="0.14em" color="var(--qc-ink-3)">
        {label}
      </MonoLabel>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/**
 * The compact one-row portfolio glance that replaces the tall MOD-synopsis +
 * holdings cards at the top of the investor dashboard: book value, MOD score
 * (with its three pillar bars) and holdings count in segmented cells, plus the
 * diary nudge on the right.
 *
 * Everything it summarises stays reachable — the MOD cell opens the breakdown
 * drawer, the diary CTA goes to the full journal.
 */
export function PortfolioStatStrip({
  equityValue,
  changePct,
  changeLabel = "today",
  modScore,
  subScores,
  stockCount,
  brokerConnected,
  brokerLabel,
  unwrittenCount = 0,
  isShadow,
  onOpenBreakdown,
  onUploadPortfolio,
}: PortfolioStatStripProps) {
  const up = (changePct ?? 0) >= 0;

  return (
    <div className="flex flex-col items-stretch overflow-hidden rounded-[10px] border border-hair bg-card sm:flex-row">
      <Cell label="Your Book">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[19px] font-medium leading-none text-ink">
            {equityValue > 0 ? formatINR(equityValue) : "—"}
          </span>
          {changePct != null && equityValue > 0 && (
            <span
              title={`${changeLabel} change`}
              className={`font-mono text-[11px] leading-none ${up ? "text-up" : "text-down"}`}
            >
              {up ? "+" : ""}
              {changePct.toFixed(1)}%
            </span>
          )}
        </div>
      </Cell>

      <Cell label="MOD">
        <button
          type="button"
          onClick={onOpenBreakdown}
          disabled={!onOpenBreakdown}
          className="flex cursor-pointer flex-col items-start gap-2 p-0 text-left disabled:cursor-default"
          title="Open MOD breakdown"
        >
          <span className="flex items-baseline gap-0.5">
            <span className="font-mono text-[19px] font-medium leading-none text-ink">
              {modScore ?? "—"}
            </span>
            <span className="font-mono text-[11px] leading-none text-ink-3">/100</span>
          </span>
          {/* One micro-bar per pillar, colored by its rating tier — same semantic
              mapping as the MOD score tiles, never a decorative per-category ramp. */}
          {subScores.length > 0 && (
            <span className="flex gap-1">
              {subScores.map((s) => (
                <span
                  key={s.label}
                  title={`${s.label} ${s.score} · ${s.rating}`}
                  className={`h-[3px] w-7 rounded-full ${TIER_BAR[ratingTier(s.rating)]}`}
                />
              ))}
            </span>
          )}
        </button>
      </Cell>

      <Cell label="Holdings">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[19px] font-medium leading-none text-ink">
            {stockCount || "—"}
          </span>
          <span className="text-[11px] leading-none text-ink-3">
            {brokerConnected && brokerLabel ? `· ${brokerLabel}` : "· not connected"}
          </span>
        </div>
      </Cell>

      {/* Right rail — pushed away from the cells so the strip reads as
          "metrics … action", matching the compact home layout. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 sm:ml-auto sm:flex-1 sm:justify-end">
        {isShadow && !brokerConnected && onUploadPortfolio ? (
          <Button size="xs" onClick={onUploadPortfolio}>
            Connect your portfolio
          </Button>
        ) : (
          <>
            {unwrittenCount > 0 && (
              <span className="whitespace-nowrap rounded-[4px] bg-warn-soft px-2 py-[3px] text-[11px] font-medium text-warn">
                {unwrittenCount} with no written reason
              </span>
            )}
            <CtaLink href="/diary" className="whitespace-nowrap text-[12px]">
              Open your diary
            </CtaLink>
          </>
        )}
      </div>
    </div>
  );
}
