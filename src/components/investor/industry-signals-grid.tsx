"use client";

import Link from "next/link";

export type SignalRating = "BUY" | "WAIT" | "AVOID";

export interface IndustrySignal {
  id: string;
  rating: SignalRating;
  sector: string;
  etfLabel: string;
  etfTicker: string;
  href: string;
}

interface IndustrySignalsGridProps {
  count: number;
  signals: IndustrySignal[];
}

const ratingStyle: Record<SignalRating, { bg: string; border: string; labelColor: string; sectorColor: string; etfColor: string }> = {
  BUY:   { bg: "#f0faf0", border: "#c3e6c3", labelColor: "#3a6b3a", sectorColor: "#1a3a1a", etfColor: "#3a6b3a" },
  WAIT:  { bg: "#fdf8ed", border: "#f0d89a", labelColor: "#8a5e1a", sectorColor: "#3a2800", etfColor: "#8a5e1a" },
  AVOID: { bg: "#fdf0f0", border: "#f0c4c4", labelColor: "#8a2020", sectorColor: "#3a0000", etfColor: "#8a2020" },
};

export function IndustrySignalsGrid({ count, signals }: IndustrySignalsGridProps) {
  const buyCount   = signals.filter(s => s.rating === "BUY").length;
  const waitCount  = signals.filter(s => s.rating === "WAIT").length;
  const avoidCount = signals.filter(s => s.rating === "AVOID").length;

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
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink, #0F172B)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              INDUSTRY SIGNALS
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#555",
                background: "#F0F0F0",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {count}
            </span>
          </div>
          <Link href="#" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>
            All sectors →
          </Link>
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
          Aligned to your holdings · scored across 6 frameworks
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E2E2E2", margin: "0 0 0 0" }} />

      {/* 2-column grid */}
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
        {signals.map((sig) => {
          const rs = ratingStyle[sig.rating];
          return (
            <Link
              key={sig.id}
              href={sig.href}
              style={{
                display: "block",
                background: rs.bg,
                border: `1px solid ${rs.border}`,
                borderRadius: 10,
                padding: "14px 16px",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: rs.labelColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                {sig.rating}
              </div>
              <div style={{ fontSize: 16, fontWeight: 400, color: rs.sectorColor, marginBottom: 8, fontFamily: "Georgia, serif" }}>
                {sig.sector}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: rs.etfColor, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                → {sig.etfTicker}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E2E2E2" }} />

      {/* Footer */}
      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "#444" }}>
          <span style={{ fontWeight: 700 }}>{buyCount} buy</span>
          <span style={{ color: "#aaa", margin: "0 5px" }}>·</span>
          <span style={{ fontWeight: 700 }}>{waitCount} wait</span>
          <span style={{ color: "#aaa", margin: "0 5px" }}>·</span>
          <span style={{ fontWeight: 700 }}>{avoidCount} avoid</span>
          <span style={{ color: "#aaa" }}> aligned to your sectors</span>
        </div>
        <Link
          href="#"
          style={{
            fontSize: 12,
            color: "#0F172B",
            background: "#fff",
            border: "1px solid #E2E2E2",
            borderRadius: 8,
            padding: "6px 14px",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Industry Terminal →
        </Link>
      </div>
    </div>
  );
}
