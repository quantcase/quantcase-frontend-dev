"use client";

import { formatINR } from "@/lib/utils";
import type { QuarterlyTrend } from "@/types/screener";

// ─── Sparkline ────────────────────────────────────────────────────────────────

function sparkPoints(data: QuarterlyTrend[], key: keyof QuarterlyTrend, invert = false): string {
  const vals = data
    .map((q) => q[key] as number | null)
    .filter((v) => v != null) as number[];
  if (vals.length === 0) return "";
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = 100 / Math.max(vals.length - 1, 1);
  return vals
    .map((v, i) => {
      const x = i * step;
      const normalized = (v - min) / range;
      const y = invert ? normalized * 18 + 2 : (1 - normalized) * 18 + 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface SparklineProps {
  data: QuarterlyTrend[];
  dataKey: keyof QuarterlyTrend;
  positive: boolean;
  invert?: boolean;
}

function Sparkline({ data, dataKey, positive, invert = false }: SparklineProps) {
  const points = sparkPoints(data, dataKey, invert);
  if (!points) return null;
  const color = positive ? "var(--qc-up)" : "var(--qc-down)";
  return (
    <svg
      viewBox="0 0 100 22"
      preserveAspectRatio="none"
      style={{ height: 22, marginTop: 2, display: "block", width: "100%" }}
    >
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

// ─── KpiCard ─────────────────────────────────────────────────────────────────

export interface YoyResult {
  text: string;
  cls: "pos" | "neg" | "na";
}

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  yoy: YoyResult;
  muted?: boolean;
  spark?: React.ReactNode;
}

function KpiCard({ label, value, unit, yoy, muted, spark }: KpiCardProps) {
  const yoyBg =
    yoy.cls === "pos" ? "var(--qc-up-soft)"
    : yoy.cls === "neg" ? "var(--qc-down-soft)"
    : "var(--qc-chip-bg, #F2F1EC)";
  const yoyColor =
    yoy.cls === "pos" ? "var(--qc-up)"
    : yoy.cls === "neg" ? "var(--qc-down)"
    : "var(--qc-text-muted)";

  return (
    <div
      style={{
        background: muted ? "var(--qc-surface-panel, #F2F1EC)" : "var(--qc-surface-white)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 112,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11.5, color: "var(--qc-text-body)", letterSpacing: ".01em" }}>
          {label}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5, padding: "2px 6px", borderRadius: 4,
            letterSpacing: ".02em", fontWeight: 500, lineHeight: 1.3,
            background: yoyBg, color: yoyColor,
          }}
        >
          {yoy.text}
        </span>
      </div>
      {muted ? (
        <div
          style={{
            fontSize: 18, fontWeight: 400,
            color: "var(--qc-text-muted)",
            fontVariantNumeric: "tabular-nums", lineHeight: 1.1, marginTop: "auto",
          }}
        >
          —
        </div>
      ) : (
        <div
          style={{
            fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em",
            color: "var(--qc-text-heading)", fontVariantNumeric: "tabular-nums",
            lineHeight: 1.1, marginTop: "auto",
          }}
        >
          {value}
          {unit && (
            <span
              style={{ fontSize: 12, fontWeight: 400, color: "var(--qc-text-muted)", marginLeft: 3, letterSpacing: 0 }}
            >
              {unit}
            </span>
          )}
        </div>
      )}
      {spark}
    </div>
  );
}

// ─── KpiGrid ─────────────────────────────────────────────────────────────────

export function yoyText(growth: number | null | undefined, invert = false): YoyResult {
  if (growth == null) return { text: "—", cls: "na" };
  const sign = growth >= 0 ? "+" : "";
  const pctStr = `${sign}${(growth * 100).toFixed(1)}% YoY`;
  const isPositive = invert ? growth < 0 : growth >= 0;
  return { text: pctStr, cls: isPositive ? "pos" : "neg" };
}

interface KpiGridProps {
  quarterlyTrend: QuarterlyTrend[];
  revenue: number | null;
  revenueGrowth: number | null | undefined;
  ebitda: number | null;
  ebitdaGrowth: number | null | undefined;
  netProfit: number | null;
  netProfitGrowth: number | null | undefined;
  operatingCashflow: number | null;
  cfoGrowth: number | null | undefined;
  freeCashflow: number | null;
  fcfGrowth: number | null | undefined;
  reserves: number | null;
  reservesGrowth: number | null | undefined;
  totalDebt: number | null;
  debtGrowth: number | null | undefined;
}

export function KpiGrid({
  quarterlyTrend: qt,
  revenue, revenueGrowth,
  ebitda, ebitdaGrowth,
  netProfit, netProfitGrowth,
  operatingCashflow, cfoGrowth,
  freeCashflow, fcfGrowth,
  reserves, reservesGrowth,
  totalDebt, debtGrowth,
}: KpiGridProps) {
  const revenueYoy = yoyText(revenueGrowth);
  const ebitdaYoy = yoyText(ebitdaGrowth);
  const netProfitYoy = yoyText(netProfitGrowth);
  const cfoYoy = yoyText(cfoGrowth);
  const fcfYoy = yoyText(fcfGrowth);
  const reservesYoy = yoyText(reservesGrowth);
  const debtYoy = yoyText(debtGrowth, true);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 1,
        background: "var(--qc-border-default)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 14,
      }}
    >
      <KpiCard
        label="Revenue"
        value={formatINR(revenue)}
        yoy={revenueYoy}
        spark={<Sparkline data={qt} dataKey="revenue" positive={revenueYoy.cls === "pos"} />}
      />
      <KpiCard
        label="EBITDA"
        value={ebitda != null ? formatINR(ebitda) : "—"}
        yoy={ebitdaYoy}
        muted={ebitda == null}
        spark={ebitda != null ? <Sparkline data={qt} dataKey="ebitda" positive={ebitdaYoy.cls === "pos"} /> : undefined}
      />
      <KpiCard
        label="Net Profit"
        value={netProfit != null ? formatINR(netProfit) : "—"}
        yoy={netProfitYoy}
        muted={netProfit == null}
        spark={netProfit != null ? <Sparkline data={qt} dataKey="netIncome" positive={netProfitYoy.cls === "pos"} /> : undefined}
      />
      <KpiCard
        label="CFO"
        value={operatingCashflow != null ? formatINR(operatingCashflow) : "—"}
        yoy={cfoYoy}
        muted={operatingCashflow == null}
        spark={operatingCashflow != null ? <Sparkline data={qt} dataKey="revenue" positive={cfoYoy.cls === "pos"} /> : undefined}
      />
      <KpiCard
        label="FCF"
        value={freeCashflow != null ? formatINR(freeCashflow) : "—"}
        yoy={fcfYoy}
        muted={freeCashflow == null}
        spark={freeCashflow != null ? <Sparkline data={qt} dataKey="revenue" positive={fcfYoy.cls === "pos"} /> : undefined}
      />
      <KpiCard
        label="Reserves"
        value={reserves != null ? formatINR(reserves) : "—"}
        yoy={reservesYoy}
        muted={reserves == null}
        spark={reserves != null ? <Sparkline data={qt} dataKey="totalEquity" positive={reservesYoy.cls === "pos"} /> : undefined}
      />
      <KpiCard
        label="Debt"
        value={totalDebt != null ? formatINR(totalDebt) : "—"}
        yoy={debtYoy}
        muted={totalDebt == null}
        spark={totalDebt != null ? <Sparkline data={qt} dataKey="totalDebt" positive={debtYoy.cls === "pos"} invert /> : undefined}
      />
      <KpiCard label="Interest Coverage" value="—" yoy={{ text: "—", cls: "na" }} muted />
    </div>
  );
}
