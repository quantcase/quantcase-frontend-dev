"use client";

import type React from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart2, Activity, Zap, TrendingDown, Minus } from "lucide-react";
import type { LensDetail } from "@/hooks/useLenses";
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

const SCENARIO_ICON: Record<ScenarioKey, React.ElementType> = {
  bull: TrendingUp,
  base: Minus,
  bear: TrendingDown,
};

// ─── Build scenarios from lens data ──────────────────────────────────────────

interface ScenarioRow {
  industryCagr: { value: string; note: string };
  revenueGrowth: { value: string; note: string };
  marginTrajectory: { value: string; note: string };
  expectedEpsCagr: { value: string; subtitle: string };
}

function buildScenariosFromLens(lens: LensDetail): Record<ScenarioKey, ScenarioRow> {
  const km = lens.key_metrics ?? {};
  const sig = lens.top_signals ?? [];

  // Try to find guidance signals for each metric
  const findActual = (metric: string) => sig.find((s) => s.metric === metric && s.actual_value != null);
  const findGuided = (metric: string) => sig.find((s) => s.metric === metric && s.guided_value != null);

  // Infer growth/guidance values from key_metrics with broad key matching
  const getKm = (...keys: string[]): string => {
    for (const k of keys) {
      const found = Object.entries(km).find(([key]) => key.toLowerCase().includes(k.toLowerCase()));
      if (found) return found[1];
    }
    return "—";
  };

  // Revenue / growth metric for base case
  const revGrowthActual = findActual("NET_PROFIT_GROWTH_YOY") ?? findActual("AUM_GROWTH") ?? findActual("DISBURSEMENT_GROWTH");
  const revGrowthGuided = findGuided("AUM_GROWTH_GUIDANCE") ?? findGuided("DISBURSEMENT_GROWTH_GUIDANCE");

  const baseRev = revGrowthActual?.actual_value != null
    ? `${revGrowthActual.actual_value}%`
    : getKm("growth", "cagr", "revenue");

  const guidedRev = revGrowthGuided?.guided_value != null
    ? `${revGrowthGuided.guided_value}%`
    : baseRev;

  // Margin / profitability metric
  const roaActual = findActual("ROA");
  const roeActual = findActual("ROE") ?? findActual("RETURN_ON_EQUITY_GROWTH_YOY");
  const marginBase = roaActual?.actual_value != null
    ? `${roaActual.actual_value}%`
    : roeActual?.actual_value != null
    ? `${roeActual.actual_value}%`
    : getKm("ROA", "ROE", "margin");

  // EPS / PAT as proxy for EPS CAGR
  const epsActual = findActual("EPS_DILUTED") ?? findActual("PAT");
  const patGrowth = findActual("NET_PROFIT_GROWTH_YOY");
  const baseEpsCagr = patGrowth?.actual_value != null
    ? `${patGrowth.actual_value}%`
    : epsActual?.actual_value != null
    ? `${epsActual.actual_value}`
    : getKm("pat_growth", "eps", "profit_growth");

  // Industry growth — look for any industry signal or derive from context
  const industryBase = getKm("industry", "sector_growth") !== "—"
    ? getKm("industry", "sector_growth")
    : "Moderate";

  // Parse numeric for scenario scaling
  const baseRevNum = parseFloat(baseRev) || 0;
  const guidedRevNum = parseFloat(guidedRev) || 0;
  const baseEpsNum = parseFloat(baseEpsCagr) || 0;

  const bullMult = 1.3;
  const bearMult = 0.6;

  const fmt = (n: number, suffix = "%") => `${n >= 0 ? "" : ""}${n.toFixed(1)}${suffix}`;
  const fmtBps = (bps: number) => bps >= 0 ? `+${bps}bps` : `${bps}bps`;

  return {
    bull: {
      industryCagr: { value: industryBase !== "—" ? industryBase : "Strong", note: "Sector tailwinds" },
      revenueGrowth: { value: fmt(baseRevNum * bullMult), note: "Beat guidance" },
      marginTrajectory: { value: fmtBps(150), note: "Operating leverage" },
      expectedEpsCagr: { value: fmt(baseEpsNum * bullMult), subtitle: "Accelerated growth" },
    },
    base: {
      industryCagr: { value: industryBase !== "—" ? industryBase : "Steady", note: "Steady growth" },
      revenueGrowth: { value: guidedRevNum ? fmt(guidedRevNum) : baseRev, note: "On-track execution" },
      marginTrajectory: { value: fmtBps(50), note: "Stable improvement" },
      expectedEpsCagr: { value: baseEpsCagr !== "—" ? (baseEpsCagr.includes("%") ? baseEpsCagr : `${baseEpsCagr}%`) : "—", subtitle: "Solid growth + margin tailwind" },
    },
    bear: {
      industryCagr: { value: industryBase !== "—" ? industryBase : "Slowing", note: "Sector headwinds" },
      revenueGrowth: { value: fmt(baseRevNum * bearMult), note: "Competitive pressure" },
      marginTrajectory: { value: fmtBps(-100), note: "Margin compression" },
      expectedEpsCagr: { value: fmt(baseEpsNum * bearMult), subtitle: "Below industry standard" },
    },
  };
}

// ─── MetricRow key type ───────────────────────────────────────────────────────

type MetricKey = "industryCagr" | "revenueGrowth" | "marginTrajectory" | "expectedEpsCagr";

const METRIC_ROWS: Array<{ key: MetricKey; label: string; icon: React.ElementType }> = [
  { key: "industryCagr",     label: "INDUSTRY GROWTH",   icon: TrendingUp },
  { key: "revenueGrowth",    label: "REVENUE CAGR",      icon: BarChart2 },
  { key: "marginTrajectory", label: "MARGIN TRAJECTORY", icon: Activity },
  { key: "expectedEpsCagr",  label: "EPS CAGR FORECAST", icon: Zap },
];

function valueColor(scenarioKey: ScenarioKey, rowKey: string, value: string): string {
  if (rowKey === "expectedEpsCagr") return SCENARIO_META[scenarioKey].cssVar;
  const num = parseFloat(value);
  if (!isNaN(num)) return num >= 0 ? "var(--qc-up)" : "var(--qc-down)";
  if (value.startsWith("+")) return "var(--qc-up)";
  if (value.startsWith("-")) return "var(--qc-down)";
  return "var(--qc-ink)";
}

// ─── Scenario table ───────────────────────────────────────────────────────────

function ScenarioTable({ scenarios }: { scenarios: Record<ScenarioKey, ScenarioRow> }) {
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
              const d = scenarios[scenarioKey];
              const metric = d[row.key];
              const displayValue = metric.value;
              const note = "subtitle" in metric ? metric.subtitle : "note" in metric ? metric.note : "";
              const color = valueColor(scenarioKey, row.key, displayValue);

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
                    {displayValue}
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
              {key === "bull" && `assumes strong execution and favourable sector tailwinds driving acceleration, resulting in ${scenarios.bull.expectedEpsCagr.value} EPS CAGR.`}
              {key === "base" && `reflects management guidance with steady execution and stable margins, leading to ${scenarios.base.expectedEpsCagr.value} EPS CAGR.`}
              {key === "bear" && `reflects macro weakness and margin pressure constraining growth, leading to ${scenarios.bear.expectedEpsCagr.value} EPS CAGR.`}
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

// ─── Summary metrics from key_metrics ────────────────────────────────────────

function buildSummaryMetrics(lens: LensDetail, scenarios: Record<ScenarioKey, ScenarioRow>) {
  const km = lens.key_metrics ?? {};
  const sig = lens.top_signals ?? [];

  // Revenue/growth label — pick the most meaningful available metric
  const revSignal = sig.find((s) => s.metric?.includes("GROWTH") && s.actual_value != null);
  const revLabel = revSignal ? revSignal.label.replace(/\(.*\)/, "").trim() : "Revenue Growth";
  const revValue = revSignal?.actual_value != null ? `${revSignal.actual_value}%` : "—";
  const revSub = revSignal?.actual_date ? revSignal.actual_date.slice(0, 7) : "YoY";

  // PAT/profit metric
  const patSignal = sig.find((s) => (s.metric === "PAT" || s.metric === "NET_PROFIT") && s.actual_value != null);
  const patLabel = patSignal ? patSignal.label.replace(/\(.*\)/, "").trim() : "PAT";
  const patValue = patSignal?.unit === "Cr"
    ? `₹${patSignal.actual_value} Cr`
    : patSignal?.actual_value != null
    ? `${patSignal.actual_value}%`
    : Object.entries(km).find(([k]) => k.toLowerCase().includes("pat"))?.[1] ?? "—";
  const patSub = patSignal?.actual_date ? patSignal.actual_date.slice(0, 7) : "Latest";

  return [
    { label: "Base EPS CAGR", value: scenarios.base.expectedEpsCagr.value, sub: "As per mgmt guidance" },
    { label: revLabel, value: revValue, sub: revSub },
    { label: patLabel, value: patValue, sub: patSub },
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailEps({ lens }: Props) {
  const scenarios = buildScenariosFromLens(lens);
  const summaryMetrics = buildSummaryMetrics(lens, scenarios);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ScenarioTable scenarios={scenarios} />
      <LensDrawerSummaryCard
        title={lens.takeaway?.split(".")[0] ?? "Earnings scenario analysis."}
        body={lens.takeaway ?? ""}
        metrics={summaryMetrics}
      />
    </div>
  );
}
