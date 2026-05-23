"use client";

import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { epsEngineData } from "@/components/deal/detailed-analysis-data";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

type ScenarioKey = "bull" | "base" | "bear";

const SCENARIO_ORDER: ScenarioKey[] = ["bull", "base", "bear"];

const SCENARIO_META: Record<ScenarioKey, { label: string; sub: string; cssVar: string }> = {
  bull: { label: "BULL CASE", sub: "Optimistic scenario", cssVar: "var(--qc-up)" },
  base: { label: "BASE CASE", sub: "As per mgmt guidance", cssVar: "var(--qc-blue)" },
  bear: { label: "BEAR CASE", sub: "Risk-heavy scenario", cssVar: "var(--qc-down)" },
};

const METRIC_ROWS: Array<{ key: keyof typeof epsEngineData.scenarios.bear; label: string }> = [
  { key: "industryCagr",     label: "INDUSTRY GROWTH" },
  { key: "revenueGrowth",    label: "REVENUE CAGR" },
  { key: "marginTrajectory", label: "MARGIN TRAJECTORY" },
  { key: "expectedEpsCagr",  label: "EPS CAGR FORECAST" },
];

function valueColor(scenarioKey: ScenarioKey, rowKey: string, value: string): string {
  if (rowKey === "expectedEpsCagr") return SCENARIO_META[scenarioKey].cssVar;
  const num = parseFloat(value);
  if (!isNaN(num)) return num >= 0 ? "var(--qc-up)" : "var(--qc-down)";
  if (value.startsWith("+")) return "var(--qc-up)";
  if (value.startsWith("-")) return "var(--qc-down)";
  return "var(--qc-ink)";
}

function formatMetricKey(k: string): string {
  return k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}

function impactColor(impact: string | null) {
  if (impact === "high") return "var(--qc-up)";
  if (impact === "medium") return "var(--qc-warn)";
  return "var(--qc-ink-3)";
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
        <div style={{ padding: "10px 14px", borderRight: "1px solid var(--qc-hair)" }} />
        {SCENARIO_ORDER.map((key, i) => (
          <div key={key} style={{
            padding: "10px 14px",
            borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: SCENARIO_META[key].cssVar, margin: "0 0 1px", textTransform: "uppercase" }}>
              {SCENARIO_META[key].label}
            </p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{SCENARIO_META[key].sub}</p>
          </div>
        ))}
      </div>

      {/* Metric rows */}
      {METRIC_ROWS.map((row, rowIdx) => {
        const isLast = rowIdx === METRIC_ROWS.length - 1;
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
              display: "flex", alignItems: "center",
            }}>
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
        <div style={{ borderRight: "1px solid var(--qc-hair)" }} />
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

// ─── Key metrics grid ─────────────────────────────────────────────────────────

function KeyMetricsGrid({ lens }: { lens: LensDetail }) {
  const entries = Object.entries(lens.key_metrics);
  if (!entries.length) return null;

  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          KEY METRICS · CURRENT QUARTER
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--qc-hair)" }}>
        {entries.map(([k, v]) => {
          const isPositive = v.startsWith("+") || (!v.startsWith("-") && !v.startsWith("₹") && parseFloat(v) > 0);
          const isNegative = v.startsWith("-");
          const color = isPositive ? "var(--qc-up)" : isNegative ? "var(--qc-down)" : "var(--qc-ink)";
          return (
            <div key={k} style={{ padding: "12px 14px", background: "var(--qc-card)" }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>
                {formatMetricKey(k)}
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{v}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Top signals table ────────────────────────────────────────────────────────

function TopSignalsTable({ lens }: { lens: LensDetail }) {
  const signals = lens.top_signals;
  if (!signals?.length) return null;

  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          EARNINGS SIGNALS · {signals.length} tracked
        </p>
      </div>

      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 80px 60px 60px",
        padding: "6px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)",
        gap: 8,
      }}>
        {["SIGNAL", "VALUE", "IMPACT", "DATE"].map((h) => (
          <p key={h} style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {signals.map((sig, i) => {
          const isLast = i === signals.length - 1;
          const color = impactColor(sig.impact ?? null);
          const displayVal = sig.actual_value !== null
            ? `${sig.actual_value}${sig.unit === "%" ? "%" : sig.unit === "Cr" ? " Cr" : ""}`
            : "—";
          const date = sig.actual_date ? new Date(sig.actual_date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }) : "—";

          return (
            <motion.div
              key={sig.signal_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              style={{
                display: "grid", gridTemplateColumns: "1fr 80px 60px 60px",
                padding: "10px 14px", gap: 8, alignItems: "start",
                borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                background: "var(--qc-card)",
              }}
            >
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>{sig.label}</p>
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{sig.statement}</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{displayVal}</p>
              <span style={{
                display: "inline-block",
                fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                color, padding: "2px 6px",
                background: `color-mix(in srgb, ${color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                borderRadius: 4, whiteSpace: "nowrap", width: "fit-content",
              }}>
                {sig.impact ?? "—"}
              </span>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{date}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── EPS Drivers + Risks ──────────────────────────────────────────────────────

function DriversAndRisks({ lens }: { lens: LensDetail }) {
  if (!lens.highlights.length && !lens.risks.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {lens.highlights.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid rgba(31,122,74,0.20)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(31,122,74,0.06)", borderBottom: "1px solid rgba(31,122,74,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-up)", margin: 0 }}>
              EPS DRIVERS
            </p>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {lens.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: "var(--qc-up)" }} />
                <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {lens.risks.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid rgba(180,115,26,0.20)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(180,115,26,0.06)", borderBottom: "1px solid rgba(180,115,26,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-warn)", margin: 0 }}>
              EARNINGS RISKS
            </p>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {lens.risks.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: "var(--qc-warn)" }} />
                <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailEps({ lens, signals: _signals }: Props) {
  const km = lens.key_metrics;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ScenarioTable />
      <KeyMetricsGrid lens={lens} />
      <TopSignalsTable lens={lens} />
      <DriversAndRisks lens={lens} />
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
