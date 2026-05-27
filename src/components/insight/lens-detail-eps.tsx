"use client";

import type React from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart2, Activity, Zap, TrendingDown, Minus } from "lucide-react";
import type { LensDetail } from "@/hooks/useLenses";
import { epsEngineData } from "@/components/deal/detailed-analysis-data";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
}

type ScenarioKey = "bull" | "base" | "bear";

const SCENARIO_ORDER: ScenarioKey[] = ["bull", "base", "bear"];

const SCENARIO_META: Record<ScenarioKey, { label: string; sub: string; cssVar: string }> = {
  bull: { label: "BULL CASE", sub: "Optimistic scenario", cssVar: "var(--qc-up)" },
  base: { label: "BASE CASE", sub: "As per mgmt guidance", cssVar: "var(--qc-blue)" },
  bear: { label: "BEAR CASE", sub: "Risk-heavy scenario", cssVar: "var(--qc-down)" },
};

const METRIC_ROWS: Array<{ key: keyof typeof epsEngineData.scenarios.bear; label: string; icon: React.ElementType }> = [
  { key: "industryCagr",     label: "INDUSTRY GROWTH",   icon: TrendingUp },
  { key: "revenueGrowth",    label: "REVENUE CAGR",      icon: BarChart2 },
  { key: "marginTrajectory", label: "MARGIN TRAJECTORY", icon: Activity },
  { key: "expectedEpsCagr",  label: "EPS CAGR FORECAST", icon: Zap },
];

const SCENARIO_ICON: Record<ScenarioKey, React.ElementType> = {
  bull: TrendingUp,
  base: Minus,
  bear: TrendingDown,
};

function valueColor(scenarioKey: ScenarioKey, rowKey: string, value: string): string {
  if (rowKey === "expectedEpsCagr") return SCENARIO_META[scenarioKey].cssVar;
  const num = parseFloat(value);
  if (!isNaN(num)) return num >= 0 ? "var(--qc-up)" : "var(--qc-down)";
  if (value.startsWith("+")) return "var(--qc-up)";
  if (value.startsWith("-")) return "var(--qc-down)";
  return "var(--qc-ink)";
}


// ─── Scenario table ───────────────────────────────────────────────────────────

function ScenarioTable() {
  const static_ = epsEngineData.scenarios;

  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

      {/* Title bar */}
      <div style={{
        padding: "10px 16px",
        background: "var(--qc-section)",
        borderBottom: "1px solid var(--qc-hair)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          SCENARIO-BASED EARNINGS FORECAST
        </p>
        <span style={{
          fontSize: 9, fontWeight: 600, padding: "2px 7px",
          background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
          borderRadius: 5, color: "var(--qc-ink-2)",
        }}>
          3-yr CAGR / Avg · All three scenarios
        </span>
      </div>

      {/* Subtitle */}
      <div style={{ padding: "6px 16px 8px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>
          Bull case — optimistic · Base case — as per mgmt guidance · Bear case — risk-heavy
        </p>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 1fr", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
        <div style={{ padding: "10px 14px", borderRight: "1px solid var(--qc-hair)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
          <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>METRIC</p>
          <p style={{ fontSize: 8, color: "var(--qc-ink-3)", margin: 0, opacity: 0.7 }}>3-yr forward view</p>
        </div>
        {SCENARIO_ORDER.map((key, i) => {
          const Icon = SCENARIO_ICON[key];
          return (
            <div key={key} style={{
              padding: "10px 14px",
              borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <Icon size={11} color={SCENARIO_META[key].cssVar} strokeWidth={2.5} />
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: SCENARIO_META[key].cssVar, margin: 0, textTransform: "uppercase" }}>
                  {SCENARIO_META[key].label}
                </p>
              </div>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{SCENARIO_META[key].sub}</p>
            </div>
          );
        })}
      </div>

      {/* Metric rows */}
      {METRIC_ROWS.map((row, rowIdx) => {
        const isLast = rowIdx === METRIC_ROWS.length - 1;
        const RowIcon = row.icon;
        return (
          <div
            key={row.key}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 1fr 1fr",
              borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
              background: isLast ? "var(--qc-section)" : "var(--qc-card)",
            }}
          >
            {/* Row label */}
            <div style={{
              padding: "14px 14px",
              borderRight: "1px solid var(--qc-hair)",
              display: "flex", alignItems: "flex-start", gap: 7,
            }}>
              <RowIcon size={13} color="var(--qc-ink-3)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.4 }}>
                {row.label}
              </p>
            </div>

            {/* Scenario cells */}
            {SCENARIO_ORDER.map((scenarioKey, i) => {
              const d = static_[scenarioKey];
              const metric = d[row.key as keyof typeof d] as { value: string; note?: string; subtitle?: string };
              const color = valueColor(scenarioKey, row.key, metric.value);
              const note = metric.note ?? metric.subtitle ?? "";

              return (
                <motion.div
                  key={scenarioKey}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: rowIdx * 0.05 }}
                  style={{
                    padding: "14px 14px",
                    borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined,
                    borderLeft: isLast ? `3px solid color-mix(in srgb, ${SCENARIO_META[scenarioKey].cssVar} 35%, transparent)` : undefined,
                  }}
                >
                  <p style={{ fontSize: isLast ? 17 : 14, fontWeight: 700, color, margin: "0 0 3px", lineHeight: 1 }}>
                    {metric.value}
                  </p>
                  {note && (
                    <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{note}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        );
      })}

      {/* Bottom scenario summaries */}
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 1fr", borderTop: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
        <div style={{ borderRight: "1px solid var(--qc-hair)", padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
          <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>ANALYST VIEW</p>
          <p style={{ fontSize: 8, color: "var(--qc-ink-3)", margin: 0, opacity: 0.7, lineHeight: 1.4 }}>Scenario assumptions & rationale</p>
        </div>
        {SCENARIO_ORDER.map((key, i) => (
          <div key={key} style={{ padding: "12px 14px", borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined }}>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: SCENARIO_META[key].cssVar }}>
                {key.charAt(0).toUpperCase() + key.slice(1)} case
              </span>{" "}
              {key === "bull" && `assumes AI-led demand and strong execution driving meaningful margin expansion, resulting in ${static_.bull.expectedEpsCagr.value} EPS CAGR.`}
              {key === "base" && `reflects management guidance with moderate recovery and stable margins, leading to ${static_.base.expectedEpsCagr.value} EPS CAGR.`}
              {key === "bear" && `reflects macro weakness and spend cuts pressuring growth and margins, leading to ${static_.bear.expectedEpsCagr.value} EPS CAGR.`}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "6px 14px", borderTop: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
        <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: 0 }}>ⓘ All figures are 3-year CAGR / Average</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailEps({ lens }: Props) {
  const km = lens.key_metrics;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ScenarioTable />
      <LensDrawerSummaryCard
        title="Greenfield-led EPS growth with double-digit revenue acceleration."
        body={lens.takeaway}
        metrics={[
          { label: "Base EPS CAGR", value: epsEngineData.scenarios.base.expectedEpsCagr.value, sub: "As per mgmt guidance" },
          { label: "GF Rev Growth", value: `+${km["Greenfield_Revenue_Growth_YoY_Q3"] ?? "18.8%"}`, sub: "Q3 YoY" },
          { label: "PAT Growth", value: km["Consolidated_PAT_Growth_YoY"] ?? "—", sub: "Consolidated YoY" },
        ]}
      />
    </div>
  );
}
