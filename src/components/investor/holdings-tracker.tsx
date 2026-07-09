"use client";

import Link from "next/link";
import { Wallet, Plus } from "lucide-react";
import { MonoLabel, LimeCountPip } from "@/components/ds";
import { LoadingRows, EmptyState } from "@/components/investor/shadow-portfolio";
import type { Holding } from "@/types/investor-portfolio";

interface HoldingsTrackerProps {
  holdings: Holding[];
  count: number;
  loading?: boolean;
  /** When true, no portfolio is connected — renders the connect empty state. */
  empty?: boolean;
  /** Opens the connect / upload portfolio flow from the empty state and header. */
  onConnect?: () => void;
}

/** Shared 4-column grid so header + rows stay aligned in the half-width layout. */
const GRID = "1.6fr 1fr 0.6fr 1fr";

function ConvictionPill({ value }: { value: string | null | undefined }) {
  if (!value) return <span style={{ color: "var(--qc-ink-3)", fontSize: "var(--qc-fz-11)" }}>—</span>;
  const map: Record<string, { bg: string; color: string }> = {
    POSITIVE: { bg: "rgba(31,122,74,0.10)", color: "var(--qc-up,#1F7A4A)" },
    WATCH:    { bg: "#FEF3C7",              color: "#92400E" },
    NEUTRAL:  { bg: "var(--qc-section)",    color: "var(--qc-ink-2)" },
  };
  const style = map[value] ?? map.NEUTRAL;
  return (
    <span
      style={{
        fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", padding: "2px 7px",
        borderRadius: 3, letterSpacing: "var(--qc-track-mono)", textTransform: "uppercase", ...style,
      }}
    >
      {value}
    </span>
  );
}

function fmtInvested(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function HoldingsTracker({ holdings, count, loading, empty, onConnect }: HoldingsTrackerProps) {
  const isEmpty = !loading && (empty || holdings.length === 0);

  return (
    <div
      className="rounded-[10px] p-2 flex flex-col"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", height: "100%" }}
    >
      {/* Header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Holdings</MonoLabel>
          <LimeCountPip count={loading ? "…" : count} />
        </div>
        <div className="flex items-center gap-3">
          {!isEmpty && onConnect && (
            <button
              onClick={onConnect}
              style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-11)",
                letterSpacing: "var(--qc-track-mono)", color: "var(--qc-ink-3)",
                background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              + ADD
            </button>
          )}
          <Link
            href="/diary"
            style={{
              fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-11)",
              letterSpacing: "var(--qc-track-mono)", color: "var(--qc-ink-3)",
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            MANAGE →
          </Link>
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: -8 }}>
        Your portfolio · invested positions scored on the MOD framework
      </div>

      {/* Inner white card */}
      <div className="rounded-[10px] overflow-hidden flex-1" style={{ background: "var(--qc-card)" }}>
        {loading ? (
          <LoadingRows cols={4} />
        ) : isEmpty ? (
          <EmptyState
            icon={<Wallet className="size-4" style={{ color: "var(--qc-ink-3)" }} />}
            title="No holdings yet"
            body="Connect your broker or upload a CSV to score your real portfolio on management, opportunity & deal quality."
            ctaLabel="Connect your portfolio"
            onCta={onConnect}
            ctaIcon={<Plus className="size-3.5" />}
          />
        ) : (
          <>
            {/* Table header — desktop only */}
            <div
              className="hidden sm:grid"
              style={{
                gridTemplateColumns: GRID,
                padding: "7px 16px",
                fontSize: "var(--qc-fz-10)",
                fontWeight: "var(--qc-w-medium)",
                color: "var(--qc-ink-3)",
                letterSpacing: "var(--qc-track-eyebrow)",
                textTransform: "uppercase",
                borderBottom: "1px solid var(--qc-hair-2)",
                fontFamily: "var(--qc-font-mono)",
              }}
            >
              <div>STOCK</div>
              <div>INVESTED</div>
              <div>QC</div>
              <div>CONVICTION</div>
            </div>

            {/* Rows */}
            <div>
              {holdings.map((h, i) => {
                const md = h.market_data;
                const score = md?.qc_score;
                const scoreColor = score == null ? "var(--qc-ink-3)" : score >= 75 ? "var(--qc-up)" : score >= 55 ? "var(--qc-warn)" : "var(--qc-down)";
                const investedDate = h.invested_at
                  ? new Date(h.invested_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                  : null;

                return (
                  <Link
                    key={h.id}
                    href={`/screener/management?symbol=${h.ticker}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", display: "block" }}
                    className="holdings-tracker-row"
                  >
                    {/* Desktop row */}
                    <div
                      className="hidden sm:grid"
                      style={{
                        gridTemplateColumns: GRID,
                        padding: "10px 16px",
                        alignItems: "center",
                        borderBottom: i < holdings.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
                        transition: "background 0.12s ease",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{h.ticker}</div>
                        {investedDate && (
                          <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: 1 }}>
                            Since {investedDate}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>
                        {fmtInvested(h.amount_invested)}
                      </div>
                      <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: scoreColor, fontFamily: "var(--qc-font-mono)" }}>
                        {score != null ? score.toFixed(0) : "—"}
                      </div>
                      <div>
                        <ConvictionPill value={md?.conviction} />
                      </div>
                    </div>

                    {/* Mobile card row */}
                    <div
                      className="sm:hidden"
                      style={{
                        padding: "12px 16px",
                        borderBottom: i < holdings.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
                        transition: "background 0.12s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{h.ticker}</div>
                          {investedDate && (
                            <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: 1 }}>Since {investedDate}</div>
                          )}
                        </div>
                        <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)", textAlign: "right" }}>
                          {fmtInvested(h.amount_invested)}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>
                          QC {score != null ? score.toFixed(0) : "—"}
                        </span>
                        <span style={{ color: "var(--qc-hair-2)" }}>·</span>
                        <ConvictionPill value={md?.conviction} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <style>{`
              .holdings-tracker-row:hover > div {
                background: var(--qc-section, #f5f5f5) !important;
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}
