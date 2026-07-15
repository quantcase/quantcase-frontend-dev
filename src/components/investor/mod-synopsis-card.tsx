"use client";

import Link from "next/link";
import { CardShell, MonoLabel, RatingBadge, ScoreGauge, ratingTier } from "@/components/ds";
import { Button } from "@/components/ui/button";

interface SubScore {
  label: string;
  score: number;
  rating: "STRONG" | "FAIR" | "STRETCHED" | "WEAK";
}

interface MODSynopsisCardProps {
  overallScore: number;
  headline: string;
  subScores: SubScore[];
  draggingSymbols: string[];
  /** Pillar the dragging symbols weigh on, e.g. "Deal". Defaults to "Deal". */
  draggingLabel?: string;
  onOpenBreakdown?: () => void;
  isShadow?: boolean;
  /** True when a broker/smallcase account is linked. Shows a synced pill instead of the connect CTA. */
  brokerConnected?: boolean;
  /** Display name of the connected broker, e.g. "Zerodha". */
  brokerLabel?: string;
  onUploadPortfolio?: () => void;
}

function ScoreTile({ label, score, rating }: SubScore) {
  // Rating drives the bar tier too, so chip color and bar color always agree
  // (audit: "make sure bar color follows the same semantic mapping as the chip").
  const tier = ratingTier(rating) as "up" | "warn" | "down" | "neutral";
  const barTier = tier === "neutral" ? undefined : tier;
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-[10px] border border-hair bg-card px-4 pb-3 pt-3.5">
      <MonoLabel size={9} tracking="0.12em" color="var(--qc-ink-3)">
        {label}
      </MonoLabel>
      <div className="my-1.5 font-mono text-[26px] font-medium leading-none text-ink">
        {score}
      </div>
      <RatingBadge label={rating} className="self-start" />
      <div className="mt-2.5">
        <ScoreGauge value={score} shape="bar" tier={barTier} strokeWidth={3} />
      </div>
    </div>
  );
}

export function MODSynopsisCard({ headline, subScores, draggingSymbols, draggingLabel = "Deal", onOpenBreakdown, isShadow, brokerConnected, onUploadPortfolio }: MODSynopsisCardProps) {
  return (
    <CardShell radius={14} style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>

      {/* Header — mono label + optional upload button */}
      <div className="flex items-center justify-between">
        <MonoLabel size={10} tracking="0.14em" color="var(--qc-ink-3)">
          {isShadow ? "Trackers · MOD Synopsis" : "Your Portfolio · MOD Synopsis"}
        </MonoLabel>
        {/* The "connected" confirmation pill lives once, on the Holdings panel.
            Here we only surface the connect CTA when not yet linked. */}
        {isShadow && !brokerConnected && onUploadPortfolio && (
          <Button size="xs" onClick={onUploadPortfolio} className="gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Connect your portfolio
          </Button>
        )}
      </div>

      {/* Headline — serif, matches management verdict card */}
      <p
        className="serif m-0 text-[26px] font-normal leading-[1.35] text-ink"
        dangerouslySetInnerHTML={{ __html: headline }}
      />

      {/* Sub-score tiles */}
      <div className="flex flex-1 gap-2">
        {subScores.map((s) => (
          <ScoreTile key={s.label} {...s} />
        ))}
      </div>

      {/* Footer — dragging signal + breakdown link */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {draggingSymbols.length > 0 && (
            <span className="text-[12px] text-ink-2">
              {draggingSymbols.length} holding{draggingSymbols.length === 1 ? "" : "s"} dragging your {draggingLabel} score ·{" "}
              {draggingSymbols.map((s, i) => (
                <span key={s}>
                  <Link
                    href={`/screener/management?symbol=${s}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink no-underline hover:text-ink-2"
                  >
                    {s}
                  </Link>
                  {i < draggingSymbols.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          )}
        </div>
        <button
          onClick={onOpenBreakdown}
          className="cursor-pointer whitespace-nowrap p-0 text-[12px] font-medium tracking-[var(--qc-track-pill)] text-ink transition-colors hover:text-ink-2"
        >
          Open MOD breakdown →
        </button>
      </div>
    </CardShell>
  );
}
