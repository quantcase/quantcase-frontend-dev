"use client";

import { formatINR } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── KpiCard ─────────────────────────────────────────────────────────────────

interface YoyResult {
  text: string;
  cls: "pos" | "neg" | "na";
}

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  yoy: YoyResult;
  muted?: boolean;
}

function KpiCard({ label, value, unit, yoy, muted }: KpiCardProps) {
  const yoyBg =
    yoy.cls === "pos" ? "var(--qc-up-soft)"
    : yoy.cls === "neg" ? "var(--qc-down-soft)"
    : "var(--qc-chip-bg, #F2F1EC)";
  const yoyColor =
    yoy.cls === "pos" ? "var(--qc-up)"
    : yoy.cls === "neg" ? "var(--qc-down)"
    : "var(--qc-text-muted)";

  const Icon =
    yoy.cls === "pos" ? TrendingUp
    : yoy.cls === "neg" ? TrendingDown
    : Minus;

  return (
    <div
      style={{
        background: muted ? "var(--qc-surface-panel, #F2F1EC)" : "var(--qc-surface-white)",
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 80,
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
            display: "inline-flex", alignItems: "center", gap: 3,
          }}
        >
          <Icon size={10} strokeWidth={2.5} />
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
            fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em",
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
    </div>
  );
}

// ─── KpiGrid ─────────────────────────────────────────────────────────────────

function yoyText(growth: number | null | undefined, invert = false): YoyResult {
  if (growth == null) return { text: "—", cls: "na" };
  const sign = growth >= 0 ? "+" : "";
  const pctStr = `${sign}${(growth * 100).toFixed(1)}% YoY`;
  const isPositive = invert ? growth < 0 : growth >= 0;
  return { text: pctStr, cls: isPositive ? "pos" : "neg" };
}

interface KpiGridProps {
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
      <KpiCard label="Revenue" value={formatINR(revenue)} yoy={revenueYoy} />
      <KpiCard label="EBITDA" value={ebitda != null ? formatINR(ebitda) : "—"} yoy={ebitdaYoy} muted={ebitda == null} />
      <KpiCard label="Net Profit" value={netProfit != null ? formatINR(netProfit) : "—"} yoy={netProfitYoy} muted={netProfit == null} />
      <KpiCard label="CFO" value={operatingCashflow != null ? formatINR(operatingCashflow) : "—"} yoy={cfoYoy} muted={operatingCashflow == null} />
      <KpiCard label="FCF" value={freeCashflow != null ? formatINR(freeCashflow) : "—"} yoy={fcfYoy} muted={freeCashflow == null} />
      <KpiCard label="Reserves" value={reserves != null ? formatINR(reserves) : "—"} yoy={reservesYoy} muted={reserves == null} />
      <KpiCard label="Debt" value={totalDebt != null ? formatINR(totalDebt) : "—"} yoy={debtYoy} muted={totalDebt == null} />
      <KpiCard label="Interest Coverage" value="—" yoy={{ text: "—", cls: "na" }} muted />
    </div>
  );
}
