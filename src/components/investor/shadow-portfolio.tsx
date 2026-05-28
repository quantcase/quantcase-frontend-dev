"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { MonoLabel, LimeCountPip, ActionButton } from "@/components/ds";

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
  thesisDriftCount: number;
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

export function ShadowPortfolio({ count, stocks, thesisDriftCount }: ShadowPortfolioProps) {
  const mgmtCount = stocks.filter(s => s.thesisTags.includes("MANAGEMENT")).length;
  const oppCount  = stocks.filter(s => s.thesisTags.includes("OPPORTUNITY")).length;
  const dealCount = stocks.filter(s => s.thesisTags.includes("DEAL")).length;

  return (
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Header — matches WhoToCallToday */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Shadow Portfolio</MonoLabel>
          <LimeCountPip count={count} />
        </div>
        <div className="flex items-center gap-3">
          <button
            style={{
              fontFamily: "var(--qc-font-mono)",
              fontSize: "var(--qc-fz-11)",
              letterSpacing: "var(--qc-track-mono)",
              color: "var(--qc-ink-3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              whiteSpace: "nowrap",
            }}
          >
            ALL THESES ▾
          </button>
          <span
            style={{
              fontFamily: "var(--qc-font-mono)",
              fontSize: "var(--qc-fz-11)",
              letterSpacing: "var(--qc-track-mono)",
              color: "var(--qc-ink-3)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            MANAGE →
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: -8 }}>
        Stocks you&apos;re tracking · tagged by your investment thesis (MOD)
      </div>

      {/* Inner white card */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--qc-card)" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 0.6fr 0.6fr 3fr 1.1fr 0.7fr",
            padding: "7px 18px",
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
          <div>LTP</div>
          <div>1D</div>
          <div>QC</div>
          <div>THESIS</div>
          <div>CONVICTION</div>
          <div />
        </div>

        {/* Rows */}
        <div>
          {stocks.map((s, i) => (
            <div
              key={s.symbol}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 0.6fr 0.6fr 3fr 1.1fr 0.7fr",
                padding: "10px 18px",
                alignItems: "center",
                borderBottom: i < stocks.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
              }}
            >
              <div>
                <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{s.symbol}</div>
                <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: 1 }}>{s.name}</div>
              </div>

              <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>{s.ltp}</div>

              <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)", color: s.changePositive ? "var(--qc-up)" : "var(--qc-down)", fontFamily: "var(--qc-font-mono)" }}>
                {s.change1d}
              </div>

              <div style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>{s.qcScore}</div>

              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                {s.thesisTags.map(tag => <ThesisChip key={tag} tag={tag} />)}
                <button
                  style={{
                    fontSize: "var(--qc-fz-10)",
                    fontFamily: "var(--qc-font-sans)",
                    color: "var(--qc-ink-2)",
                    background: "var(--qc-section)",
                    border: "1px solid var(--qc-hair)",
                    borderRadius: 3,
                    padding: "1px 6px",
                    cursor: "pointer",
                  }}
                >
                  {s.whyInvested} ▾
                </button>
                {s.thesisDrift && (
                  <span
                    style={{
                      fontSize: "var(--qc-fz-10)",
                      fontWeight: "var(--qc-w-medium)",
                      fontFamily: "var(--qc-font-sans)",
                      color: "#92400e",
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      borderRadius: 3,
                      padding: "1px 6px",
                      letterSpacing: "var(--qc-track-mono)",
                      textTransform: "uppercase",
                    }}
                  >
                    DRIFT
                  </span>
                )}
              </div>

              <div style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", letterSpacing: "var(--qc-track-mono)", textTransform: "uppercase" }}>
                {s.conviction}
              </div>

              <Link href={s.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <ActionButton noWrap size="sm">Open →</ActionButton>
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ height: 1, background: "var(--qc-hair-2)" }} />
        <div style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>
            <span style={{ fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink-2)" }}>{mgmtCount} on Management</span>
            <span style={{ color: "var(--qc-hair)", margin: "0 5px" }}>·</span>
            <span style={{ fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink-2)" }}>{oppCount} on Opportunity</span>
            <span style={{ color: "var(--qc-hair)", margin: "0 5px" }}>·</span>
            <span style={{ fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink-2)" }}>{dealCount} on Deal</span>
            {thesisDriftCount > 0 && (
              <>
                <span style={{ color: "var(--qc-hair)", margin: "0 5px" }}>·</span>
                <span style={{ color: "#92400e" }}>⚠ {thesisDriftCount} thesis drifting from QC view</span>
              </>
            )}
          </div>
          <ActionButton size="sm">+ Add a stock to track</ActionButton>
        </div>
      </div>
    </div>
  );
}
