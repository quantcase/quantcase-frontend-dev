"use client";

import { useState } from "react";

interface Segment {
  label: string;
  value: string;
  count: number;
  pct: number;
  color: string;
}

interface HoldingsPanelProps {
  stockCount: number;
  fundCount: number;
  syncedAgo: string;
  equityValue: string;
  todayChange: string;
  ytdChange: string;
  capSegments: Segment[];
  industrySegments: Segment[];
  isShadow?: boolean;
  onUploadPortfolio?: () => void;
}

function MiniSparkline() {
  // Static SVG sparkline — replace with real data when API is ready
  const points = [10, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15, 17, 16, 18, 17];
  const w = 220, h = 40;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((v) => h - ((v - min) / (max - min)) * h);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`}
        fill="url(#sparkFill)"
      />
      <path d={d} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function HoldingsPanel({
  stockCount,
  fundCount,
  syncedAgo,
  equityValue,
  todayChange,
  ytdChange,
  capSegments,
  industrySegments,
  isShadow,
  onUploadPortfolio,
}: HoldingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"cap" | "industry">("cap");
  const segments = activeTab === "cap" ? capSegments : industrySegments;

  return (
    <div
      style={{
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", letterSpacing: "var(--qc-track-eyebrow-l)", textTransform: "uppercase", marginBottom: 2 }}>
            {isShadow ? "SHADOW HOLDINGS" : "YOUR HOLDINGS"}
          </div>
          <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)" }}>
            {stockCount} stocks · {fundCount} mutual funds · synced {syncedAgo}
          </div>
        </div>
        {isShadow ? (
          onUploadPortfolio && (
            <button
              onClick={onUploadPortfolio}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)",
                fontFamily: "var(--qc-font-sans)",
                background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                borderRadius: 6, padding: "5px 12px",
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload portfolio
            </button>
          )
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: "var(--qc-fz-11)",
              fontWeight: "var(--qc-w-medium)",
              fontFamily: "var(--qc-font-sans)",
              color: "var(--qc-up)",
              background: "var(--qc-up-soft)",
              border: "1px solid rgba(31,122,74,0.20)",
              borderRadius: 20,
              padding: "3px 10px",
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--qc-up)", display: "inline-block" }}
            />
            Demat-linked
          </span>
        )}
      </div>

      {/* Equity value + sparkline */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", letterSpacing: "var(--qc-track-eyebrow-l)", textTransform: "uppercase", marginBottom: 4 }}>
            EQUITY VALUE
          </div>
          <div style={{ fontSize: "var(--qc-fz-30)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink)", letterSpacing: "var(--qc-track-display)", lineHeight: 1 }}>
            {equityValue}
          </div>
          <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-up)", marginTop: 4 }}>
            {todayChange} today
            <span style={{ color: "var(--qc-ink-3)", margin: "0 6px" }}>·</span>
            <span style={{ color: "var(--qc-up)" }}>{ytdChange} YTD</span>
          </div>
        </div>
        <MiniSparkline />
      </div>

      {/* Cap breakdown tabs */}
      <div>
        <div style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--qc-hair, #E2E2E2)", marginBottom: 12 }}>
          <button
            onClick={() => setActiveTab("cap")}
            style={{
              fontSize: "var(--qc-fz-12)",
              fontFamily: "var(--qc-font-sans)",
              fontWeight: activeTab === "cap" ? "var(--qc-w-medium)" : "var(--qc-w-regular)",
              color: activeTab === "cap" ? "var(--qc-ink)" : "var(--qc-ink-3)",
              background: "none",
              border: "none",
              padding: "0 0 8px",
              borderBottom: activeTab === "cap" ? "2px solid var(--qc-ink)" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            By Market Cap
          </button>
          <button
            onClick={() => setActiveTab("industry")}
            style={{
              fontSize: "var(--qc-fz-12)",
              fontFamily: "var(--qc-font-sans)",
              fontWeight: activeTab === "industry" ? "var(--qc-w-medium)" : "var(--qc-w-regular)",
              color: activeTab === "industry" ? "var(--qc-ink)" : "var(--qc-ink-3)",
              background: "none",
              border: "none",
              padding: "0 0 8px",
              borderBottom: activeTab === "industry" ? "2px solid var(--qc-ink)" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            By Industry
          </button>
        </div>

        {/* Stacked bar + aligned labels */}
        <div style={{ position: "relative" }}>
          {/* Bar */}
          <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 10, gap: 2 }}>
            {segments.map((seg) => (
              <div key={seg.label} style={{ flex: seg.pct, background: seg.color, minWidth: 2 }} />
            ))}
          </div>
          {/* Labels — flex children with same proportions as bar segments */}
          <div style={{ display: "flex", gap: 2 }}>
            {segments.map((seg) => (
              <div key={seg.label} style={{ flex: seg.pct, minWidth: 0 }}>
                <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", whiteSpace: "nowrap" }}>{seg.label}</div>
                <div style={{ fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink)" }}>{seg.value}</div>
                <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)" }}>{seg.count} stocks · {seg.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
