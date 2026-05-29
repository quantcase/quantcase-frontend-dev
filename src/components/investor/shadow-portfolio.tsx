"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
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

export function ShadowPortfolio({ count, stocks }: ShadowPortfolioProps) {

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
            ALL THESES ▾
          </Link>
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
            gridTemplateColumns: "2fr 1fr 0.6fr 0.6fr 3fr 1.1fr",
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
        </div>

        {/* Rows */}
        <div>
          {stocks.map((s, i) => (
            <Link
              key={s.symbol}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "block" }}
              className="shadow-portfolio-row"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 0.6fr 0.6fr 3fr 1.1fr",
                  padding: "10px 18px",
                  alignItems: "center",
                  borderBottom: i < stocks.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
                  transition: "background 0.12s ease",
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
                    onClick={e => e.preventDefault()}
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
              </div>
            </Link>
          ))}
        </div>

        <style>{`
          .shadow-portfolio-row:hover > div {
            background: var(--qc-section, #f5f5f5) !important;
          }
        `}</style>

      </div>
    </div>
  );
}
