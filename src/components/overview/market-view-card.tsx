"use client";

import React, { useState } from "react";

// ─── Hardcoded data ────────────────────────────────────────────────────────────

type Sentiment = "Bearish" | "Bullish" | "Neutral";

interface SignalRow {
  label: string;
  value: string;
  sentiment: "bearish" | "bullish" | "neutral";
}

interface FrameworkBlock {
  title: string;
  timeframe: string;
  signalCount: number;
  verdict: Sentiment;
  signals: SignalRow[];
}

const FRAMEWORK_BLOCKS: FrameworkBlock[] = [
  {
    title: "Price structure",
    timeframe: "Weekly + Daily",
    signalCount: 6,
    verdict: "Bearish",
    signals: [
      { label: "Trend direction",   value: "Downtrend",     sentiment: "bearish" },
      { label: "Higher highs / lows", value: "No",          sentiment: "bearish" },
      { label: "Key level breach",  value: "Yes",           sentiment: "bearish" },
      { label: "Price vs SMA 200",  value: "Below",         sentiment: "bearish" },
      { label: "Pattern",           value: "Base forming",  sentiment: "neutral" },
      { label: "Volume trend",      value: "Declining",     sentiment: "bearish" },
    ],
  },
  {
    title: "Technical momentum",
    timeframe: "Daily",
    signalCount: 4,
    verdict: "Bearish",
    signals: [
      { label: "RSI (14)",    value: "38 — Weak",      sentiment: "bearish" },
      { label: "MACD",        value: "Negative",       sentiment: "bearish" },
      { label: "Stochastic",  value: "42 — Neutral",   sentiment: "neutral" },
      { label: "ADX",         value: "28 — Trending",  sentiment: "bullish" },
    ],
  },
  {
    title: "Market breadth",
    timeframe: "Weekly",
    signalCount: 5,
    verdict: "Bearish",
    signals: [
      { label: "Advance / Decline",    value: "Declining",  sentiment: "bearish" },
      { label: "% above SMA 200",      value: "38%",        sentiment: "bearish" },
      { label: "New 52W highs",        value: "Low",        sentiment: "bearish" },
      { label: "Sector rotation",      value: "Defensive",  sentiment: "neutral" },
      { label: "Mid / Small cap ratio",value: "Weak",       sentiment: "bearish" },
    ],
  },
  {
    title: "Capital flows",
    timeframe: "Weekly",
    signalCount: 2,
    verdict: "Neutral",
    signals: [
      { label: "FII flows (4W)", value: "−₹2,400 Cr", sentiment: "bearish" },
      { label: "DII flows (4W)", value: "+₹5,100 Cr", sentiment: "bullish" },
    ],
  },
  {
    title: "Macro & policy",
    timeframe: "Monthly",
    signalCount: 4,
    verdict: "Neutral",
    signals: [
      { label: "RBI stance",    value: "Neutral",           sentiment: "neutral" },
      { label: "GDP growth",    value: "6.8% — Strong",     sentiment: "bullish" },
      { label: "Inflation (CPI)", value: "4.6%",            sentiment: "neutral" },
      { label: "Capex cycle",   value: "Expanding",         sentiment: "bullish" },
    ],
  },
  {
    title: "Valuation & earnings",
    timeframe: "Monthly",
    signalCount: 3,
    verdict: "Bearish",
    signals: [
      { label: "Nifty P/E",          value: "21x — Premium",   sentiment: "bearish" },
      { label: "Earnings revision",  value: "Downgrade",       sentiment: "bearish" },
      { label: "Earnings growth",    value: "12% — Moderate",  sentiment: "neutral" },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function verdictStyle(v: Sentiment): { bg: string; text: string; border: string } {
  if (v === "Bearish") return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
  if (v === "Bullish") return { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" };
  return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
}

function signalValueColor(s: SignalRow["sentiment"]): string {
  if (s === "bearish") return "#DC2626";
  if (s === "bullish") return "#16A34A";
  return "#D97706";
}

function frameworkSummary(): { bear: number; neutral: number; bull: number; overall: string } {
  const counts = FRAMEWORK_BLOCKS.reduce(
    (acc, b) => {
      if (b.verdict === "Bearish") acc.bear++;
      else if (b.verdict === "Bullish") acc.bull++;
      else acc.neutral++;
      return acc;
    },
    { bear: 0, neutral: 0, bull: 0 }
  );
  const overall = counts.bear >= 4 ? "Risk-Off" : counts.bull >= 4 ? "Risk-On" : "Mixed";
  return { ...counts, overall };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: Sentiment }) {
  const s = verdictStyle(verdict);
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 4,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.text,
        whiteSpace: "nowrap",
      }}
    >
      {verdict}
    </span>
  );
}

function FrameworkBlockCard({ block, style }: { block: FrameworkBlock; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: 16, ...style }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}>{block.title}</p>
          <p style={{ fontSize: 11, color: "#888888", marginTop: 2 }}>
            {block.timeframe} · {block.signalCount} signals
          </p>
        </div>
        <VerdictBadge verdict={block.verdict} />
      </div>
      <div className="space-y-1.5">
        {block.signals.map((sig) => (
          <div key={sig.label} className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: "#888888" }}>{sig.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: signalValueColor(sig.sentiment) }}>
              {sig.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryView() {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid rgba(226,226,226,0.10)",
        background: "#fff",
        padding: 16,
      }}
    >
      {/* 3-column grid with dividers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          border: "1px solid #E2E2E2",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {FRAMEWORK_BLOCKS.map((block, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const totalRows = Math.ceil(FRAMEWORK_BLOCKS.length / 3);
          return (
            <FrameworkBlockCard
              key={block.title}
              block={block}
              style={{
                borderRight: col < 2 ? "1px solid #E2E2E2" : undefined,
                borderBottom: row < totalRows - 1 ? "1px solid #E2E2E2" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function DetailedView() {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid rgba(226,226,226,0.10)",
        background: "#fff",
        padding: 16,
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Framework", "Timeframe", "Signals", "Key Readings", "Verdict"].map((h) => (
                <th
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#888888",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "8px 12px 8px 0",
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #E2E2E2",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FRAMEWORK_BLOCKS.map((block, idx) => (
              <tr
                key={block.title}
                style={{
                  background: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                  borderTop: "1px solid transparent",
                }}
              >
                <td style={{ fontSize: 13, fontWeight: 600, color: "#0F172B", padding: "10px 12px 10px 0", whiteSpace: "nowrap" }}>
                  {block.title}
                </td>
                <td style={{ fontSize: 13, color: "#888888", padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {block.timeframe}
                </td>
                <td style={{ fontSize: 13, color: "#888888", padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {block.signalCount}
                </td>
                <td style={{ fontSize: 12, color: "#888888", padding: "10px 12px", maxWidth: 260 }}>
                  {block.signals.map((sig) => (
                    <span key={sig.label} className="inline-block mr-3 whitespace-nowrap">
                      <span style={{ color: "#888888" }}>{sig.label}: </span>
                      <span style={{ color: signalValueColor(sig.sentiment), fontWeight: 500 }}>{sig.value}</span>
                    </span>
                  ))}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  <VerdictBadge verdict={block.verdict} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── OutlineToggle (local, same pattern as TabularCard) ────────────────────────

function OutlineToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${value === option ? "#0F172B" : "#E2E2E2"}`,
            background: value === option ? "#0F172B" : "transparent",
            color: value === option ? "#ffffff" : "#888888",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function MarketViewCard() {
  const [activeTab, setActiveTab] = useState<"Summary" | "Detailed">("Summary");
  const { bear, neutral, bull, overall } = frameworkSummary();
  const overallStyle = overall === "Risk-Off"
    ? { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" }
    : overall === "Risk-On"
    ? { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" }
    : { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };

  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid #E2E2E2",
        background: "#F5F5F5",
        padding: 8,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between flex-wrap gap-2"
        style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}
      >
        {/* Left: title + tab-specific context */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0F172B",
              textTransform: "uppercase",
              letterSpacing: "0.01em",
            }}
          >
            Market View
          </div>

          {/* Summary tab: framework score badges */}
          {activeTab === "Detailed" && (
            <>
              <span style={{ width: 1, height: 14, background: "#E2E2E2", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#888888" }}>Framework score</span>
              {bear > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  {bear} Bear
                </span>
              )}
              {neutral > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>
                  {neutral} Neutral
                </span>
              )}
              {bull > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                  {bull} Bull
                </span>
              )}
              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: overallStyle.bg, color: overallStyle.text, border: `1px solid ${overallStyle.border}` }}>
                {overall}
              </span>
            </>
          )}

          {/* Detailed tab: combined signal */}
          {activeTab === "Summary" && (
            <>
              <span style={{ width: 1, height: 14, background: "#E2E2E2", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#888888" }}>
                Combined signal: <span style={{ fontWeight: 600, color: "#0F172B" }}>Cautious</span>
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                Bearish bias
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 4,
              background: "#FEF9C3",
              color: "#92400E",
              border: "1px solid #FDE68A",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Hardcoded for now
          </span>
          <OutlineToggle
            options={["Summary", "Detailed"]}
            value={activeTab}
            onChange={(v) => setActiveTab(v as "Summary" | "Detailed")}
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === "Summary" ? <DetailedView /> : <SummaryView />}
    </div>
  );
}
