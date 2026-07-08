"use client";

import Link from "next/link";
import { Briefcase, Search } from "lucide-react";
import { MonoLabel, LimeCountPip } from "@/components/ds";

export type Conviction = "POSITIVE" | "NEUTRAL" | "WATCH" | "HOLD";
export type ThesisTag = "OPPORTUNITY" | "MANAGEMENT" | "DEAL";

export interface ShadowStock {
  symbol: string;
  name: string;
  ltp: string;
  change1d: string;
  changePositive: boolean;
  qcScore: number;
  thesisTags: ThesisTag[];
  whyInvested: string;
  thesisDrift?: boolean;
  conviction: Conviction;
  href: string;
}

interface ShadowPortfolioProps {
  count: number;
  stocks: ShadowStock[];
  loading?: boolean;
  /** When true, renders the empty state instead of the table. */
  empty?: boolean;
}

function ThesisChip({ tag }: { tag: ThesisTag }) {
  return (
    <span
      style={{
        fontSize: "var(--qc-fz-10)",
        fontWeight: "var(--qc-w-medium)",
        fontFamily: "var(--qc-font-sans)",
        background: "var(--qc-section)",
        color: "var(--qc-ink-2)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 3,
        padding: "1px 6px",
        letterSpacing: "var(--qc-track-mono)",
        textTransform: "uppercase",
      }}
    >
      {tag}
    </span>
  );
}

/** Shared 4-column grid so header + rows stay aligned in the half-width layout. */
const GRID = "1.6fr 0.6fr 2.4fr 1fr";

export function ShadowPortfolio({ count, stocks, loading, empty }: ShadowPortfolioProps) {
  const isEmpty = !loading && (empty || stocks.length === 0);

  return (
    <div
      className="rounded-[10px] p-2 flex flex-col"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", height: "100%" }}
    >
      {/* Header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Trackers</MonoLabel>
          <LimeCountPip count={loading ? "…" : count} />
        </div>
        <Link
          href="/investor/portfolio"
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-11)",
            letterSpacing: "var(--qc-track-mono)",
            color: "var(--qc-ink-3)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          MANAGE →
        </Link>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: -8 }}>
        Stocks you&apos;re tracking · tagged by your investment thesis (MOD)
      </div>

      {/* Inner white card */}
      <div className="rounded-[10px] overflow-hidden flex-1" style={{ background: "var(--qc-card)" }}>
        {loading ? (
          <LoadingRows cols={4} />
        ) : isEmpty ? (
          <EmptyState
            icon={<Briefcase className="size-4" style={{ color: "var(--qc-ink-3)" }} />}
            title="No trackers yet"
            body="Track stocks you're researching and tag them by your investment thesis to watch how they play out."
            ctaLabel="Find a stock to track"
            ctaHref="/screener/home"
            ctaIcon={<Search className="size-3.5" />}
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
              <div>QC</div>
              <div>THESIS</div>
              <div>CONVICTION</div>
            </div>

            {/* Rows */}
            <div>
              {stocks.map((s, i) => (
                <Link
                  key={`${s.symbol}-${i}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", display: "block" }}
                  className="shadow-portfolio-row"
                >
                  {/* Desktop row */}
                  <div
                    className="hidden sm:grid"
                    style={{
                      gridTemplateColumns: GRID,
                      padding: "10px 16px",
                      alignItems: "center",
                      borderBottom: i < stocks.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
                      transition: "background 0.12s ease",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{s.symbol}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 1 }}>
                        <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>{s.ltp}</span>
                        <span style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-medium)", color: s.changePositive ? "var(--qc-up)" : "var(--qc-down)", fontFamily: "var(--qc-font-mono)" }}>{s.change1d}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>{s.qcScore}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      {s.thesisTags.map(tag => <ThesisChip key={tag} tag={tag} />)}
                      {s.thesisDrift && (
                        <span style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 3, padding: "1px 6px", letterSpacing: "var(--qc-track-mono)", textTransform: "uppercase" }}>
                          DRIFT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", letterSpacing: "var(--qc-track-mono)", textTransform: "uppercase" }}>
                      {s.conviction}
                    </div>
                  </div>

                  {/* Mobile card row */}
                  <div
                    className="sm:hidden"
                    style={{
                      padding: "12px 16px",
                      borderBottom: i < stocks.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
                      transition: "background 0.12s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{s.symbol}</div>
                        <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: 1 }}>{s.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>{s.ltp}</div>
                        <div style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-medium)", color: s.changePositive ? "var(--qc-up)" : "var(--qc-down)", fontFamily: "var(--qc-font-mono)", marginTop: 2 }}>
                          {s.change1d}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>
                        QC {s.qcScore}
                      </span>
                      <span style={{ color: "var(--qc-hair-2)" }}>·</span>
                      {s.thesisTags.map(tag => <ThesisChip key={tag} tag={tag} />)}
                      {s.thesisDrift && (
                        <span style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 3, padding: "1px 6px", letterSpacing: "var(--qc-track-mono)", textTransform: "uppercase" }}>
                          DRIFT
                        </span>
                      )}
                      <span style={{ marginLeft: "auto", fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", letterSpacing: "var(--qc-track-mono)", textTransform: "uppercase" }}>
                        {s.conviction}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <style>{`
              .shadow-portfolio-row:hover > div {
                background: var(--qc-section, #f5f5f5) !important;
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}

// ── Shared building blocks ────────────────────────────────────────────────────

export function LoadingRows({ cols = 4 }: { cols?: number }) {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex", gap: 12, alignItems: "center",
            padding: "14px 16px",
            borderBottom: i < 3 ? "1px solid var(--qc-hair-2)" : "none",
          }}
        >
          {Array.from({ length: cols }).map((__, j) => (
            <div
              key={j}
              style={{
                height: 12, borderRadius: 4, background: "var(--qc-hair)",
                width: j === 0 ? 70 : j === cols - 1 ? 54 : undefined,
                flex: j !== 0 && j !== cols - 1 ? 1 : undefined,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  ctaLabel,
  ctaHref,
  ctaIcon,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaIcon?: React.ReactNode;
  onCta?: () => void;
}) {
  const ctaStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
    background: "var(--qc-ink)", color: "#fff", border: "none",
    borderRadius: 8, padding: "8px 16px", fontSize: "var(--qc-fz-12)",
    fontWeight: "var(--qc-w-medium)", cursor: "pointer",
    fontFamily: "var(--qc-font-sans)", textDecoration: "none",
  };

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "40px 24px", height: "100%", minHeight: 220, gap: 4,
      }}
    >
      <div
        style={{
          display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 10,
          background: "var(--qc-section)", border: "1px solid var(--qc-hair)", marginBottom: 8,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)" }}>
        {title}
      </div>
      <div style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-3)", maxWidth: 300, lineHeight: 1.4 }}>
        {body}
      </div>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} style={ctaStyle}>
          {ctaIcon}
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && !ctaHref && onCta && (
        <button onClick={onCta} style={ctaStyle}>
          {ctaIcon}
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
