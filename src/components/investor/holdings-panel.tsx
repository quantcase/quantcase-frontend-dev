"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatINR } from "@/lib/utils";
import { MonoLabel } from "@/components/ds";
import { QC, SEQUENTIAL } from "@/lib/chart-tokens";
import type { AllocationSegment, ValueTrendPoint } from "@/types/investor-dashboard";

// Allocation categories carry no semantic meaning, so per the design system they
// use the shared decorative SEQUENTIAL ramp. Differentiate segments by position +
// label, never by decorative color.
const SEGMENT_COLORS = SEQUENTIAL;

function segmentColor(i: number): string {
  return SEGMENT_COLORS[i % SEGMENT_COLORS.length];
}

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
  /** Current market value, ₹ (raw number). */
  equityValue: number;
  /** Total cost basis, ₹ (raw number). */
  investedValue: number;
  /** ₹ P/L today. null for first-party portfolios that lack share quantity. */
  todayChangeValue: number | null;
  todayChangePct: number | null;
  ytdChangePct: number | null;
  return6mPct: number | null;
  valueTrend: ValueTrendPoint[];
  capSegments: AllocationSegment[];
  industrySegments: AllocationSegment[];
  /** true when figures are approximated (first-party CSV portfolio, no share qty). */
  approximate?: boolean;
  isShadow?: boolean;
  /** True when a broker/smallcase account is linked. Shows a synced pill instead of the connect CTA. */
  brokerConnected?: boolean;
  /** Display name of the connected broker, e.g. "Zerodha". */
  brokerLabel?: string;
  onUploadPortfolio?: () => void;
}

// Short month label from an ISO date, e.g. "2026-01-31" → "Jan"
function trendLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short" });
}

function EquityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: { value: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--qc-ink)",
        color: "#fff",
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: "var(--qc-fz-11)",
        fontFamily: "var(--qc-font-mono)",
        letterSpacing: ".02em",
        pointerEvents: "none",
      }}
    >
      <div style={{ opacity: 0.6, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: "var(--qc-w-semi)" }}>{formatINR(payload[0].payload.value)}</div>
    </div>
  );
}

// Percentage → signed display string, e.g. 14.2 → "+14.2%", -2.1 → "-2.1%"
function fmtPct(pct: number | null | undefined): string {
  if (pct == null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

// Signed ₹ change, e.g. 38200 → "+₹38,200", -1200 → "-₹1,200"
function fmtSignedINR(value: number | null | undefined): string {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "-";
  return `${sign}₹${Math.abs(value).toLocaleString("en-IN")}`;
}

function AllocationDonut({
  segments,
  hovered,
  onHover,
  size = 72,
}: {
  segments: Segment[];
  hovered: string | null;
  onHover: (label: string | null) => void;
  size?: number;
}) {
  // Add 4px padding so active slice expansion isn't clipped
  const pad = 4;
  const total = size + pad * 2;

  // Recharts derives clip-path IDs from a module-level counter that isn't stable
  // between the server and client render, which triggers a hydration mismatch.
  // Render the chart only after mount so the SSR markup carries no Recharts IDs.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div style={{ width: total, height: total, flexShrink: 0 }} aria-hidden />;
  }

  return (
    <PieChart width={total} height={total}>
      <Pie
        data={segments}
        cx={total / 2 - 1}
        cy={total / 2 - 1}
        innerRadius={size * 0.30}
        outerRadius={size * 0.44}
        dataKey="pct"
        stroke="none"
        paddingAngle={2}
        onMouseEnter={(_, i) => onHover(segments[i].label)}
        onMouseLeave={() => onHover(null)}
        isAnimationActive={false}
      >
        {segments.map((seg) => (
          <Cell
            key={seg.label}
            fill={seg.color}
            opacity={hovered === null || hovered === seg.label ? 1 : 0.25}
            style={{ outline: "none", transition: "opacity 0.15s" }}
          />
        ))}
      </Pie>
    </PieChart>
  );
}

export function HoldingsPanel({
  stockCount,
  fundCount,
  equityValue,
  investedValue,
  todayChangeValue,
  todayChangePct,
  ytdChangePct,
  return6mPct,
  valueTrend,
  capSegments,
  industrySegments,
  approximate,
  isShadow,
  brokerConnected,
  brokerLabel,
  onUploadPortfolio,
}: HoldingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"cap" | "industry">("cap");
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Attach display strings + design-system colors to the raw API segments.
  const toDisplaySegments = (raw: AllocationSegment[]): Segment[] =>
    raw.map((s, i) => ({
      label: s.label,
      value: formatINR(s.value),
      count: s.count,
      pct: Math.round(s.pct),
      color: segmentColor(i),
    }));

  const capDisplay = toDisplaySegments(capSegments);
  const industryDisplay = toDisplaySegments(industrySegments);
  const segments = activeTab === "cap" ? capDisplay : industryDisplay;

  // Normalize the trend series for the area chart (0–1 within its own min/max range).
  const trendVals = valueTrend.map((p) => p.value);
  const trendMin = trendVals.length ? Math.min(...trendVals) : 0;
  const trendMax = trendVals.length ? Math.max(...trendVals) : 0;
  const trendData = valueTrend.map((p) => ({
    period: trendLabel(p.date),
    value: p.value,
    norm: trendMax - trendMin === 0 ? 0.5 : (p.value - trendMin) / (trendMax - trendMin),
  }));

  const todayPositive = (todayChangeValue ?? 0) >= 0;
  const todayColor = todayChangeValue == null
    ? "var(--qc-ink-3)"
    : todayPositive ? "var(--qc-up)" : "var(--qc-down)";

  // Show a real empty state instead of rendering ₹0.00L / "— YTD" / a donut off
  // zero values when there's nothing to display yet (audit #11).
  const hasEquity = equityValue > 0;

  return (
    <div
      style={{
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "24px 24px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <MonoLabel size={10} tracking="0.14em" color="var(--qc-ink-3)">
          {isShadow ? "Trackers" : "Your Holdings"} · {stockCount} {stockCount === 1 ? "stock" : "stocks"}
          {fundCount > 0 && ` · ${fundCount} mutual fund${fundCount === 1 ? "" : "s"}`}
        </MonoLabel>

        {isShadow && !brokerConnected ? (
          onUploadPortfolio && (
            <button
              onClick={onUploadPortfolio}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "var(--qc-fz-11)",
                fontWeight: "var(--qc-w-medium)",
                color: "var(--qc-ink)",
                fontFamily: "var(--qc-font-sans)",
                background: "var(--qc-section)",
                border: "1px solid var(--qc-hair)",
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Connect your portfolio
            </button>
          )
        ) : (
          // Broker-linked (shadow view with a connected smallcase account) or a
          // native demat-linked portfolio — both surface a green synced pill.
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
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--qc-up)",
                display: "inline-block",
              }}
            />
            {isShadow ? `${brokerLabel ?? "Broker"} connected` : "Demat-linked"}
          </span>
        )}
      </div>

      {/* ── Equity value + chart ──────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Lime gradient wash */}
        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            height: "60%",
            background:
              "linear-gradient(180deg, transparent 0%, var(--qc-lime, #f7fee7) 100%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Value strip */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "12px 18px 2px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "var(--qc-fz-10)",
                fontWeight: "var(--qc-w-semi)",
                fontFamily: "var(--qc-font-sans)",
                color: "var(--qc-ink-3)",
                letterSpacing: "var(--qc-track-eyebrow-l)",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              EQUITY VALUE
            </div>
            {hasEquity ? (
              <>
                <div
                  style={{
                    fontSize: "var(--qc-fz-26)",
                    fontWeight: "var(--qc-w-medium)",
                    fontFamily: "var(--qc-font-mono)",
                    color: "var(--qc-ink)",
                    letterSpacing: "var(--qc-track-display)",
                    lineHeight: 1,
                  }}
                >
                  {formatINR(equityValue)}
                </div>
                <div
                  style={{
                    fontSize: "var(--qc-fz-11)",
                    fontFamily: "var(--qc-font-sans)",
                    color: todayColor,
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    flexWrap: "wrap",
                  }}
                >
                  {todayChangeValue != null && (
                    <>
                      <span>
                        {fmtSignedINR(todayChangeValue)}
                        {todayChangePct != null && ` (${fmtPct(todayChangePct)})`} today
                      </span>
                      <span style={{ color: "var(--qc-ink-3)" }}>·</span>
                    </>
                  )}
                  {ytdChangePct != null && (
                    <span style={{ color: todayColor }}>{fmtPct(ytdChangePct)} YTD</span>
                  )}
                  {approximate && (
                    <>
                      <span style={{ color: "var(--qc-ink-3)" }}>·</span>
                      <span style={{ color: "var(--qc-ink-3)", fontStyle: "italic" }}>approx.</span>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: "var(--qc-fz-13)",
                  fontFamily: "var(--qc-font-sans)",
                  color: "var(--qc-ink-3)",
                  lineHeight: 1.4,
                  maxWidth: 260,
                }}
              >
                {brokerConnected
                  ? "Syncing your holdings — your equity value will appear here shortly."
                  : "Connect or sync your holdings to see your equity value."}
              </div>
            )}
          </div>

          {/* Quick stat chips — only render stats that actually have a value
              (no bare "6M RETURN —" placeholders; audit #11). */}
          <div
            className="hidden sm:flex"
            style={{ flexDirection: "column", gap: 4, alignItems: "flex-end" }}
          >
            {[
              return6mPct != null && {
                label: "6M RETURN",
                value: fmtPct(return6mPct),
                positive: return6mPct >= 0,
              },
              investedValue > 0 && { label: "INVESTED", value: formatINR(investedValue), positive: null },
            ].filter((s): s is { label: string; value: string; positive: boolean | null } => Boolean(s)).map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "var(--qc-fz-9)",
                    fontFamily: "var(--qc-font-mono)",
                    color: "var(--qc-ink-3)",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: "var(--qc-fz-13)",
                    fontWeight: "var(--qc-w-semi)",
                    fontFamily: "var(--qc-font-mono)",
                    color:
                      s.positive === true
                        ? "var(--qc-up)"
                        : s.positive === false
                        ? "var(--qc-down)"
                        : "var(--qc-ink)",
                  }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Area chart */}
        <div style={{ position: "relative", zIndex: 1, marginTop: 4 }}>
          <ResponsiveContainer width="100%" height={68}>
            <AreaChart
              data={trendData}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="holdingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={QC.up} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={QC.up} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="period"
                tick={{
                  fontSize: 9,
                  fill: "var(--qc-ink-2)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: ".04em",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                padding={{ left: 12, right: 12 }}
              />
              <Tooltip
                content={<EquityTooltip />}
                cursor={{
                  stroke: "var(--qc-ink)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <Area
                type="monotone"
                dataKey="norm"
                stroke={QC.up}
                strokeWidth={1.5}
                fill="url(#holdingsFill)"
                dot={false}
                activeDot={{ r: 3, fill: QC.up, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Allocation breakdown ──────────────────────────────────────── */}
      <div style={{ padding: "10px 18px 14px", borderTop: "1px solid var(--qc-hair)" }}>
        {/* Tab row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            borderBottom: "1px solid var(--qc-hair)",
            marginBottom: 10,
          }}
        >
          {(["cap", "industry"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: "var(--qc-fz-12)",
                fontFamily: "var(--qc-font-sans)",
                fontWeight:
                  activeTab === tab
                    ? "var(--qc-w-medium)"
                    : "var(--qc-w-regular)",
                color:
                  activeTab === tab ? "var(--qc-ink)" : "var(--qc-ink-3)",
                background: "none",
                border: "none",
                padding: "0 0 6px",
                borderBottom:
                  activeTab === tab
                    ? "2px solid var(--qc-ink)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {tab === "cap" ? "By Market Cap" : "By Industry"}
            </button>
          ))}
        </div>

        {/* Donut + legend side-by-side */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* Donut */}
          <div className="hidden sm:block" style={{ flexShrink: 0, margin: -4 }}>
            <AllocationDonut
              segments={segments}
              hovered={hoveredSegment}
              onHover={setHoveredSegment}
              size={72}
            />
          </div>

          {/* Stacked bar + labels */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Stacked bar */}
            <div
              style={{
                display: "flex",
                height: 6,
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 8,
                gap: 2,
              }}
            >
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    flex: seg.pct,
                    background: seg.color,
                    minWidth: 2,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>

            {/* Legend rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  onMouseEnter={() => setHoveredSegment(seg.label)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: hoveredSegment === null || hoveredSegment === seg.label ? 1 : 0.35,
                    transition: "opacity 0.15s",
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 2,
                        background: seg.color,
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "var(--qc-fz-11)",
                        fontFamily: "var(--qc-font-sans)",
                        color: "var(--qc-ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {seg.label}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--qc-fz-10)",
                        fontFamily: "var(--qc-font-sans)",
                        color: "var(--qc-ink-3)",
                        flexShrink: 0,
                      }}
                    >
                      {seg.count} {seg.count === 1 ? "stock" : "stocks"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--qc-fz-12)",
                        fontWeight: "var(--qc-w-medium)",
                        fontFamily: "var(--qc-font-mono)",
                        color: "var(--qc-ink)",
                      }}
                    >
                      {seg.value}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--qc-fz-10)",
                        fontFamily: "var(--qc-font-mono)",
                        color: "var(--qc-ink-3)",
                        minWidth: 28,
                        textAlign: "right",
                      }}
                    >
                      {seg.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
