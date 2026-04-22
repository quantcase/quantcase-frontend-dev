"use client";

import { DollarSign, Activity, LayoutGrid } from "lucide-react";
import type { FinancialStrengthSectionFull } from "@/types/opportunity";
import {
  IntelligenceCardShell,
  IntelligenceCardHeader,
  ScoreSignalsCard,
  IntelligenceSubCard,
} from "./intelligence-card-shared";

// ─── helpers ──────────────────────────────────────────────────────────────────

function verdictVars(status: string) {
  if (status === "positive" || status === "green")
    return { color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  if (status === "negative" || status === "red")
    return { color: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)" };
}

function valueColor(val: string) {
  if (val.startsWith("-")) return "var(--qc-down)";
  if (val.startsWith("+")) return "var(--qc-up)";
  return "var(--qc-text-heading)";
}

// ─── Operating Leverage sub-card ──────────────────────────────────────────────

function OperatingLeverageCard({ data }: { data: NonNullable<FinancialStrengthSectionFull["operating_leverage"]> }) {
  const verdict = data.verdict;
  const metrics = data.metrics;
  const fixedLines = data.fixed_cost_lines ?? [];
  const totalFixed = data.total_fixed_costs;

  const metricList = metrics
    ? [metrics.revenue_growth_yoy, metrics.ebit_growth_yoy, metrics.leverage_spread].filter(Boolean)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* tag line under eyebrow */}
      {verdict?.tag && (
        <span style={{
          fontSize: 10, color: "var(--qc-text-muted)", lineHeight: 1.4,
          paddingLeft: 2,
        }}>
          {verdict.tag}
        </span>
      )}

      {/* 3 metric rows */}
      {metricList.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {metricList.map((m, i) => (
            <div key={m!.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "5px 0",
              borderBottom: i < metricList.length - 1 ? "1px solid var(--qc-border-default)" : "none",
            }}>
              <span style={{ fontSize: 12, color: "var(--qc-text-body)" }}>{m!.label}</span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: valueColor(m!.value ?? ""),
                fontFamily: "'IBM Plex Mono', monospace",
                fontVariantNumeric: "tabular-nums",
              }}>
                {m!.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fixed cost breakdown */}
      {fixedLines.length > 0 && (
        <div style={{
          background: "var(--qc-surface-row-alt)",
          border: "1px solid var(--qc-border-default)",
          borderRadius: 8, padding: "8px 10px",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 9, color: "var(--qc-text-muted)",
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: "uppercase" as const, letterSpacing: ".1em",
            }}>
              Fixed Costs
            </span>
            {totalFixed?.current_pct != null && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-text-heading)" }}>
                {totalFixed.current_pct}% of revenue
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 0, height: 6, borderRadius: 999, overflow: "hidden" }}>
            {fixedLines.map((line, i) => {
              const pct = line.current_pct ?? 0;
              const total = totalFixed?.current_pct || 1;
              const barPct = (pct / total) * 100;
              const colors = ["var(--qc-blue, #3A6BEF)", "var(--qc-warn)", "var(--qc-text-muted)"];
              return (
                <div key={line.label} title={`${line.label}: ${pct}%`} style={{
                  width: `${barPct}%`, height: "100%",
                  background: colors[i % colors.length],
                  borderRight: i < fixedLines.length - 1 ? "1px solid var(--qc-surface-white)" : "none",
                }} />
              );
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px 10px" }}>
            {fixedLines.map((line, i) => {
              const colors = ["var(--qc-blue, #3A6BEF)", "var(--qc-warn)", "var(--qc-text-muted)"];
              return (
                <div key={line.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: colors[i % colors.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "var(--qc-text-body)" }}>{line.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-text-heading)" }}>
                    {line.current_pct != null ? `${line.current_pct}%` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Working Capital mini-table ───────────────────────────────────────────────

function WorkingCapitalCard({ data }: { data: NonNullable<FinancialStrengthSectionFull["working_capital"]> }) {
  const quarters = data.quarters ?? [];
  const rows = data.rows ?? [];
  const verdict = data.trend_chart?.verdict_badge;
  const verdictColor = data.trend_chart?.verdict_color;
  const vv = verdictColor ? verdictVars(verdictColor) : null;

  // Pick last 2 non-null quarters per row for a compact view
  const lastTwo = quarters.slice(-2);
  const lastTwoIdx = lastTwo.map((q) => quarters.indexOf(q));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>


      {/* Mini table */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "3px 0 5px", borderBottom: "1px solid var(--qc-border-default)",
        }}>
          <span style={{ flex: 1, fontSize: 9, color: "var(--qc-text-muted)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" as const, letterSpacing: ".08em" }}>
            Metric
          </span>
          {lastTwo.map((q) => (
            <span key={q} style={{ width: 52, textAlign: "right" as const, fontSize: 9, color: "var(--qc-text-muted)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" as const, letterSpacing: ".06em" }}>
              {q}
            </span>
          ))}
          <span style={{ width: 24, textAlign: "center" as const, fontSize: 9, color: "var(--qc-text-muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
            ↕
          </span>
        </div>

        {/* Rows */}
        {rows.map((row, ri) => {
          const vals = lastTwoIdx.map((idx) => row.values[idx]);
          const [prev, curr] = vals;
          let trendColor = "var(--qc-text-muted)";
          let trendSymbol = "—";
          if (curr != null && prev != null) {
            const diff = curr - prev;
            // For CCC/DSO/DIO: lower is better; for DPO: higher is better
            const lowerIsBetter = row.key !== "dpo";
            if (Math.abs(diff) > 0.1) {
              const improved = lowerIsBetter ? diff < 0 : diff > 0;
              trendColor = improved ? "var(--qc-up)" : "var(--qc-down)";
              trendSymbol = diff < 0 ? "↓" : "↑";
            }
          }

          return (
            <div key={row.key} style={{
              display: "flex", alignItems: "center",
              padding: "5px 0",
              borderBottom: ri < rows.length - 1 ? "1px solid var(--qc-border-default)" : "none",
            }}>
              <span style={{ flex: 1, fontSize: 11, color: "var(--qc-text-body)" }}>{row.label}</span>
              {vals.map((v, vi) => (
                <span key={vi} style={{
                  width: 52, textAlign: "right" as const,
                  fontSize: 11, fontWeight: vi === 1 ? 600 : 400,
                  color: vi === 1 ? "var(--qc-text-heading)" : "var(--qc-text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {v != null ? v : "—"}
                </span>
              ))}
              <span style={{ width: 24, textAlign: "center" as const, fontSize: 12, color: trendColor, fontWeight: 600 }}>
                {trendSymbol}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  data: FinancialStrengthSectionFull;
}

export function FinancialIntelligenceCard({ data }: Props) {
  const fs = data.final_scoring;
  if (!fs) return null;

  const score = fs.score ?? 0;
  const maxScore = fs.max_score ?? 10;
  const status = fs.status ?? "NEUTRAL";
  const statusColor = fs.color ?? fs.status_color;
  const signals = fs.signal_breakdown ?? [];
  const takeaway = data.text?.takeaway ?? fs.body;

  const opLev = data.operating_leverage;
  const wc = data.working_capital;
  const hasWc = wc && (wc.rows?.length ?? 0) > 0;

  return (
    <IntelligenceCardShell>
      <IntelligenceCardHeader
        icon={<DollarSign style={{ width: 14, height: 14, color: "var(--qc-text-body)" }} />}
        title="Financial Intelligence"
      />

      <ScoreSignalsCard
        eyebrow="Financial Strength Score"
        score={score}
        maxScore={maxScore}
        status={status}
        statusColor={statusColor}
        takeaway={takeaway}
        signals={signals}
        subLabels={["Weak", "Moderate", "Strong"]}
      />

      {opLev && (() => {
        const vv = opLev.verdict ? verdictVars(opLev.verdict.status) : null;
        return (
          <IntelligenceSubCard
            icon={<Activity style={{ width: 10, height: 10, color: "var(--qc-text-body)" }} />}
            eyebrow="Operating Leverage"
            badge={opLev.verdict?.label?.split(" ")[0]}
            badgeColor={vv?.color}
            badgeBg={vv?.bg}
          >
            <OperatingLeverageCard data={opLev} />
          </IntelligenceSubCard>
        );
      })()}

      {hasWc && (() => {
        const verdictColor = wc!.trend_chart?.verdict_color;
        const vv = verdictColor ? verdictVars(verdictColor) : null;
        return (
          <IntelligenceSubCard
            icon={<LayoutGrid style={{ width: 10, height: 10, color: "var(--qc-text-body)" }} />}
            eyebrow="Working Capital"
            badge={wc!.trend_chart?.verdict_badge?.split(" ")[0]}
            badgeColor={vv?.color}
            badgeBg={vv?.bg}
          >
            <WorkingCapitalCard data={wc!} />
          </IntelligenceSubCard>
        );
      })()}
    </IntelligenceCardShell>
  );
}
