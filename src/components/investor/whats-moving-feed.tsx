"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { MonoLabel, LimeCountPip } from "@/components/ds";

export type MovingItemKind = "score_upgrade" | "score_downgrade" | "earnings";

export interface MovingItem {
  id: string;
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePositive: boolean;
  kind: MovingItemKind;
  headlineLabel: string;
  headlineDetail: string;
  body: string;
  holdingDetail: string;
  qcScore: number;
  ctaLabel: string;
  ctaHref: string;
}

interface WhatsMovingFeedProps {
  count: number;
  items: MovingItem[];
}

const kindColors: Record<MovingItemKind, string> = {
  score_upgrade:   "var(--qc-up,  #22c55e)",
  score_downgrade: "var(--qc-down, #ef4444)",
  earnings:        "var(--qc-warn, #f59e0b)",
};

const kindBorderColors: Record<MovingItemKind, string> = {
  score_upgrade:   "var(--qc-up,  #22c55e)",
  score_downgrade: "var(--qc-down, #ef4444)",
  earnings:        "var(--qc-warn, #f59e0b)",
};

function scoreColor(score: number) {
  if (score >= 70) return "var(--qc-up, #22c55e)";
  if (score >= 50) return "var(--qc-warn, #f59e0b)";
  return "var(--qc-down, #ef4444)";
}

export function WhatsMovingFeed({ count, items }: WhatsMovingFeedProps) {
  return (
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">What&apos;s moving in your stocks</MonoLabel>
          <LimeCountPip count={count} />
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: -8 }}>
        Updates on stocks you hold or watch · scored by QC Insight
      </div>

      {/* Inner white card */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--qc-card)" }}>
        {items.map((item, idx) => (
          <Link
            key={item.id}
            href={item.ctaHref}
            style={{ textDecoration: "none", display: "block" }}
            className="moving-feed-row"
          >
            <div
              style={{
                padding: "14px 18px",
                borderTop: idx === 0 ? "none" : "1px solid var(--qc-hair-2)",
                borderLeft: `3px solid ${kindBorderColors[item.kind]}`,
                transition: "background 0.12s ease",
              }}
            >
              {/* Mobile: symbol + price inline above body */}
              <div className="flex items-start gap-4 sm:hidden mb-2">
                <div style={{ flexShrink: 0, minWidth: 80 }}>
                  <div style={{
                    fontSize: "var(--qc-fz-13)",
                    fontWeight: "var(--qc-w-semi)",
                    fontFamily: "var(--qc-font-sans)",
                    color: "var(--qc-ink)",
                    lineHeight: 1.3,
                    letterSpacing: "0.02em",
                  }}>
                    {item.symbol}
                  </div>
                  <div style={{
                    fontSize: "var(--qc-fz-11)",
                    fontFamily: "var(--qc-font-mono)",
                    color: item.priceChangePositive ? "var(--qc-up)" : "var(--qc-down)",
                    marginTop: 3,
                    letterSpacing: "0.01em",
                  }}>
                    {item.price}
                    <span style={{ marginLeft: 4, opacity: 0.85 }}>{item.priceChange}</span>
                  </div>
                </div>
                {/* QC score inline on mobile */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto", flexShrink: 0 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: scoreColor(item.qcScore),
                    display: "inline-block", flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: "var(--qc-fz-14)",
                    fontWeight: "var(--qc-w-semi)",
                    color: "var(--qc-ink)",
                    fontFamily: "var(--qc-font-mono)",
                  }}>
                    {item.qcScore}
                  </span>
                </div>
              </div>

              {/* Desktop: 3-column grid */}
              <div
                className="hidden sm:grid"
                style={{
                  gridTemplateColumns: "100px minmax(0,1fr) 64px",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                {/* Symbol + price */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    fontSize: "var(--qc-fz-13)",
                    fontWeight: "var(--qc-w-semi)",
                    fontFamily: "var(--qc-font-sans)",
                    color: "var(--qc-ink)",
                    lineHeight: 1.3,
                    letterSpacing: "0.02em",
                  }}>
                    {item.symbol}
                  </div>
                  <div style={{
                    fontSize: "var(--qc-fz-11)",
                    fontFamily: "var(--qc-font-mono)",
                    color: item.priceChangePositive ? "var(--qc-up)" : "var(--qc-down)",
                    marginTop: 3,
                    letterSpacing: "0.01em",
                  }}>
                    {item.price}
                    <span style={{ marginLeft: 4, opacity: 0.85 }}>{item.priceChange}</span>
                  </div>
                </div>

                {/* Body (desktop) */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "var(--qc-fz-12)",
                      fontWeight: "var(--qc-w-semi)",
                      fontFamily: "var(--qc-font-sans)",
                      color: kindColors[item.kind],
                      whiteSpace: "nowrap",
                    }}>
                      {item.headlineLabel}
                    </span>
                    {item.headlineDetail && (
                      <span style={{
                        fontSize: "var(--qc-fz-12)",
                        fontFamily: "var(--qc-font-mono)",
                        color: "var(--qc-ink-2)",
                        fontWeight: "var(--qc-w-regular)",
                      }}>
                        {item.headlineDetail}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: "var(--qc-fz-12)",
                    fontFamily: "var(--qc-font-sans)",
                    color: "var(--qc-ink-2)",
                    lineHeight: 1.55,
                    marginBottom: 5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {item.body}
                  </div>
                  <div style={{
                    fontSize: "var(--qc-fz-11)",
                    fontFamily: "var(--qc-font-sans)",
                    color: "var(--qc-ink-3)",
                    letterSpacing: "0.01em",
                  }}>
                    {item.holdingDetail}
                  </div>
                </div>

                {/* QC Score (desktop) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <div style={{
                    fontFamily: "var(--qc-font-mono)",
                    fontSize: "var(--qc-fz-9)",
                    fontWeight: "var(--qc-w-semi)",
                    color: "var(--qc-ink-3)",
                    letterSpacing: "var(--qc-track-eyebrow-l)",
                    textTransform: "uppercase",
                  }}>
                    QC SCORE
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: scoreColor(item.qcScore),
                      display: "inline-block", flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: "var(--qc-fz-15)",
                      fontWeight: "var(--qc-w-semi)",
                      color: "var(--qc-ink)",
                      fontFamily: "var(--qc-font-mono)",
                    }}>
                      {item.qcScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body (mobile only) */}
              <div className="sm:hidden">
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "var(--qc-fz-12)",
                    fontWeight: "var(--qc-w-semi)",
                    fontFamily: "var(--qc-font-sans)",
                    color: kindColors[item.kind],
                    whiteSpace: "nowrap",
                  }}>
                    {item.headlineLabel}
                  </span>
                  {item.headlineDetail && (
                    <span style={{
                      fontSize: "var(--qc-fz-12)",
                      fontFamily: "var(--qc-font-mono)",
                      color: "var(--qc-ink-2)",
                      fontWeight: "var(--qc-w-regular)",
                    }}>
                      {item.headlineDetail}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: "var(--qc-fz-12)",
                  fontFamily: "var(--qc-font-sans)",
                  color: "var(--qc-ink-2)",
                  lineHeight: 1.55,
                  marginBottom: 5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.body}
                </div>
                <div style={{
                  fontSize: "var(--qc-fz-11)",
                  fontFamily: "var(--qc-font-sans)",
                  color: "var(--qc-ink-3)",
                  letterSpacing: "0.01em",
                }}>
                  {item.holdingDetail}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .moving-feed-row:hover > div {
          background: var(--qc-section, #f5f5f5) !important;
        }
      `}</style>
    </div>
  );
}
