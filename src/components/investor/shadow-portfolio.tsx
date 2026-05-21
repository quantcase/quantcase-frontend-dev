"use client";

import Link from "next/link";

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

function ThesisTag({ tag }: { tag: ThesisTag }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        background: "#F5F5F5",
        color: "#555",
        border: "1px solid #E2E2E2",
        borderRadius: 3,
        padding: "1px 6px",
        letterSpacing: "0.04em",
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
      style={{
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              SHADOW PORTFOLIO
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#555",
                background: "#F0F0F0",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {count}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              style={{
                fontSize: 11,
                color: "#555",
                background: "#fff",
                border: "1px solid #E2E2E2",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              All theses ▾
            </button>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: "#888", textDecoration: "none" }}
            >
              Manage →
            </Link>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", paddingBottom: 12 }}>
          Stocks you&apos;re tracking · tagged by your investment thesis (MOD)
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E2E2E2" }} />

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 0.6fr 0.6fr 3fr 1.1fr 0.7fr",
          padding: "7px 20px",
          fontSize: 10,
          fontWeight: 500,
          color: "#bbb",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          borderBottom: "1px solid #E2E2E2",
        }}
      >
        <div>STOCK</div>
        <div>LTP</div>
        <div>1D</div>
        <div>QC</div>
        <div>THESIS</div>
        <div>CONVICTION</div>
        <div></div>
      </div>

      {/* Rows */}
      <div style={{ flex: 1 }}>
        {stocks.map((s, i) => (
          <div
            key={s.symbol}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 0.6fr 0.6fr 3fr 1.1fr 0.7fr",
              padding: "10px 20px",
              alignItems: "center",
              borderBottom: i < stocks.length - 1 ? "1px solid #F5F5F5" : "none",
            }}
          >
            {/* Stock */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}>{s.symbol}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{s.name}</div>
            </div>

            {/* LTP */}
            <div style={{ fontSize: 12, fontWeight: 500, color: "#0F172B" }}>{s.ltp}</div>

            {/* 1D */}
            <div style={{ fontSize: 12, fontWeight: 500, color: s.changePositive ? "#16a34a" : "#dc2626" }}>
              {s.change1d}
            </div>

            {/* QC Score */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172B" }}>{s.qcScore}</div>

            {/* Thesis */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              {s.thesisTags.map(tag => <ThesisTag key={tag} tag={tag} />)}
              <button
                style={{
                  fontSize: 10,
                  color: "#777",
                  background: "#F5F5F5",
                  border: "1px solid #E2E2E2",
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
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#92400e",
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: 3,
                    padding: "1px 6px",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  DRIFT
                </span>
              )}
            </div>

            {/* Conviction — plain text, no color except semantic */}
            <div style={{ fontSize: 11, fontWeight: 600, color: "#555", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {s.conviction}
            </div>

            {/* CTA */}
            <div>
              <Link
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: "#0F172B",
                  background: "#fff",
                  border: "1px solid #E2E2E2",
                  borderRadius: 6,
                  padding: "4px 10px",
                  textDecoration: "none",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Open →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E2E2E2" }} />

      {/* Footer */}
      <div style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "#888" }}>
          <span style={{ fontWeight: 600, color: "#555" }}>{mgmtCount} on Management</span>
          <span style={{ color: "#ddd", margin: "0 5px" }}>·</span>
          <span style={{ fontWeight: 600, color: "#555" }}>{oppCount} on Opportunity</span>
          <span style={{ color: "#ddd", margin: "0 5px" }}>·</span>
          <span style={{ fontWeight: 600, color: "#555" }}>{dealCount} on Deal</span>
          {thesisDriftCount > 0 && (
            <>
              <span style={{ color: "#ddd", margin: "0 5px" }}>·</span>
              <span style={{ color: "#92400e" }}>⚠ {thesisDriftCount} thesis drifting from QC view</span>
            </>
          )}
        </div>
        <button
          style={{
            fontSize: 11,
            color: "#0F172B",
            background: "#fff",
            border: "1px solid #E2E2E2",
            borderRadius: 6,
            padding: "5px 12px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          + Add a stock to track
        </button>
      </div>
    </div>
  );
}
