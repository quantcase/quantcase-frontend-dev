"use client";

import type React from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart2, Activity, Zap, TrendingDown, Minus } from "lucide-react";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
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

// ─── Signal lookup helpers ─────────────────────────────────────────────────────

function findSignal(signals: TopSignal[], metric: string): TopSignal | undefined {
  return signals.find((s) => s.metric === metric);
}

function findSignalByMetricPrefix(signals: TopSignal[], prefix: string): TopSignal | undefined {
  return signals.find((s) => s.metric?.toLowerCase().startsWith(prefix.toLowerCase()));
}

// ─── Text parsing helpers (for highlights[] narrative) ─────────────────────────

function highlightForScenario(highlights: string[], prefix: "Bull" | "Base" | "Bear"): string {
  const re = new RegExp(`^${prefix}[:\\s]`, "i");
  const hit = highlights.find((h) => re.test(h));
  if (hit) return hit.replace(/^(Bull|Base|Bear)[:\s]+/i, "").trim();
  const idx = prefix === "Bull" ? 0 : prefix === "Base" ? 1 : 2;
  return highlights[idx] ?? "";
}

// Extract the first % CAGR figure from a narrative string
function extractCagr(text: string): string {
  const m = text.match(/(\d+(?:\.\d+)?)\s*%\s*(PAT|EPS|revenue|AUM|disbursement)?\s*CAGR/i);
  if (m) return `${m[1]}%`;
  const m2 = text.match(/(\d+(?:\.\d+)?)\s*%\s*(PAT|EPS|profit)\s/i);
  if (m2) return `${m2[1]}%`;
  return "";
}

// Extract revenue / growth CAGR range like "26–28%" or single "26%"
function extractRevenueCagr(text: string): string {
  const mRange = text.match(/(\d+(?:\.\d+)?)\s*[–\-]\s*(\d+(?:\.\d+)?)\s*%\s*(revenue|AUM|disbursement|loan|advance)?\s*(CAGR|growth)?/i);
  if (mRange) return `${mRange[1]}–${mRange[2]}%`;
  const m = text.match(/(\d+(?:\.\d+)?)\s*%\s*(revenue|AUM|disbursement|loan|advance)\s*(CAGR|growth)?/i);
  if (m) return `${m[1]}%`;
  return "";
}

// Extract YoY % growth mentioned in signal statement text like "up 20% YoY" or "grew 25.5% YoY"
function extractYoyFromStatement(statement: string): string {
  const m = statement.match(/(?:up|grew?|growth|increased?)\s+(\d+(?:\.\d+)?)\s*%\s*(?:YoY|y[- ]o[- ]y)/i);
  if (m) return `${m[1]}%`;
  // Also catch "up 20%" without explicit YoY
  const m2 = statement.match(/(?:up|grew?)\s+(\d+(?:\.\d+)?)\s*%/i);
  if (m2) return `${m2[1]}%`;
  return "";
}

// Extract margin movement — bps or % EBITDA/NIM
function extractMargin(text: string): string {
  const mBps = text.match(/([+-]?\d+(?:\.\d+)?)\s*bps\s*margin/i);
  if (mBps) return `${parseInt(mBps[1]) > 0 ? "+" : ""}${mBps[1]}bps`;
  const mPct = text.match(/(\d+(?:\.\d+)?)\s*%\s*(EBITDA|NIM|PBT|ROA|ROE)\s*margin/i);
  if (mPct) return `${mPct[1]}%`;
  const mStable = text.match(/flat|stable/i);
  if (mStable) return "Flat";
  return "";
}

// ─── Scenario data model ───────────────────────────────────────────────────────

interface ScenarioMetrics {
  industryGrowth: { value: string; note: string };
  revenueCagr:    { value: string; note: string };
  marginTraj:     { value: string; note: string };
  epsCagr:        { value: string; note: string };
  narrative:      string;
}

function buildScenarios(lens: LensDetail): Record<ScenarioKey, ScenarioMetrics> {
  const signals = lens.top_signals ?? [];
  const highlights = lens.highlights ?? [];

  // Industry growth — always keyed as "industry_growth"
  const industrySignal = findSignal(signals, "industry_growth");
  const industryValue = industrySignal?.actual_value != null
    ? `${industrySignal.actual_value > 0 ? "+" : ""}${industrySignal.actual_value}%`
    : "~8–10%";

  // Per-scenario narratives from highlights[]
  const bullText = highlightForScenario(highlights, "Bull");
  const baseText = highlightForScenario(highlights, "Base");
  const bearText = highlightForScenario(highlights, "Bear");

  // EPS/PAT CAGR per scenario — parse from narrative
  const bullEps = extractCagr(bullText);
  const baseEps = extractCagr(baseText);
  const bearEps = extractCagr(bearText);

  // Revenue CAGR — layered fallback chain:
  // 1. Named %-unit signal (revenue_growth_yoy, revenue_growth_9m_yoy, revenue_growth_*)
  // 2. Absolute revenue signal's statement text (e.g. "up 20% YoY" in ACC's revenue_quarterly)
  // 3. Narrative highlight text parsing (extractRevenueCagr)
  const namedRevSignal =
    findSignal(signals, "revenue_growth_yoy") ??
    findSignal(signals, "revenue_growth_9m_yoy") ??
    findSignalByMetricPrefix(signals, "revenue_growth");

  // Proxy: any revenue_quarterly / revenue_annual / total_income signal with a statement mentioning YoY %
  const revProxySignal = namedRevSignal == null
    ? signals.find((s) =>
        (s.metric?.includes("revenue") || s.metric === "total_income") &&
        s.statement != null &&
        extractYoyFromStatement(s.statement) !== ""
      )
    : undefined;

  const signalRevPct =
    (namedRevSignal?.unit === "%" && namedRevSignal.actual_value != null)
      ? `${namedRevSignal.actual_value}%`
      : revProxySignal?.statement
      ? extractYoyFromStatement(revProxySignal.statement)
      : "";

  const baseRevCagr = extractRevenueCagr(baseText) || signalRevPct;
  const basePct = parseFloat(baseRevCagr) || 0;

  const bullRevCagr = extractRevenueCagr(bullText) || (basePct > 0 ? `${(basePct * 1.35).toFixed(0)}%` : signalRevPct);
  const bearRevCagr = extractRevenueCagr(bearText) || (basePct > 0 ? `${(basePct * 0.5).toFixed(0)}%` : "");

  // Margin — parse from narrative
  const bullMargin = extractMargin(bullText);
  const baseMargin = extractMargin(baseText);
  const bearMargin = extractMargin(bearText);

  // Ebitda margin signal for base note
  const ebitdaMarginSignal = findSignal(signals, "ebitda_margin") ?? findSignal(signals, "ebitda_margin_reported");

  return {
    bull: {
      industryGrowth: { value: industryValue, note: industrySignal?.statement?.split(";")[0] ?? "Sector tailwinds drive outperformance" },
      revenueCagr:    { value: bullRevCagr || baseRevCagr, note: bullText.split(";")[0] || "Market share gains and AI-driven demand" },
      marginTraj:     { value: bullMargin || "+100–150bps", note: "Operating leverage + mix improvement" },
      epsCagr:        { value: bullEps || "", note: "Triple-compounding EPS engine" },
      narrative:      bullText,
    },
    base: {
      industryGrowth: { value: industryValue, note: "Sector growth in line with guidance" },
      revenueCagr:    { value: baseRevCagr, note: baseText.split(";")[0] || "Management guidance trajectory" },
      marginTraj:     {
        value: baseMargin || (ebitdaMarginSignal?.actual_value != null ? `${ebitdaMarginSignal.actual_value}%` : "Flat to +50bps"),
        note: "Stable improvement on operational leverage",
      },
      epsCagr:        { value: baseEps || "", note: "Revenue growth + stable margins + buybacks" },
      narrative:      baseText,
    },
    bear: {
      industryGrowth: { value: industryValue, note: "Macro headwinds weigh on sector" },
      revenueCagr:    { value: bearRevCagr, note: bearText.split(";")[0] || "Demand slowdown + competitive pressure" },
      marginTraj:     { value: bearMargin || "-100 to -150bps", note: "Input cost inflation + low utilisation" },
      epsCagr:        { value: bearEps || "", note: "Volume + margin compression" },
      narrative:      bearText,
    },
  };
}

// ─── Colour helper ─────────────────────────────────────────────────────────────

function valueColor(scenarioKey: ScenarioKey, isEps: boolean, value: string): string {
  if (isEps) return SCENARIO_META[scenarioKey].cssVar;
  if (value.startsWith("+") || /^\d+(\.\d+)?%$/.test(value)) {
    const num = parseFloat(value);
    if (!isNaN(num) && num < 0) return "var(--qc-down)";
    return scenarioKey === "bear" ? "var(--qc-down)" : scenarioKey === "bull" ? "var(--qc-up)" : "var(--qc-ink)";
  }
  if (value.startsWith("-")) return "var(--qc-down)";
  if (value === "Flat") return "var(--qc-ink-2)";
  return "var(--qc-ink)";
}

// ─── Metric row config ─────────────────────────────────────────────────────────

type MetricKey = keyof Omit<ScenarioMetrics, "narrative">;

const METRIC_ROWS: Array<{ key: MetricKey; label: string; icon: React.ElementType; isLarge?: boolean }> = [
  { key: "industryGrowth", label: "INDUSTRY GROWTH",   icon: TrendingUp },
  { key: "revenueCagr",    label: "REVENUE CAGR",      icon: BarChart2 },
  { key: "marginTraj",     label: "MARGIN TRAJECTORY", icon: Activity },
  { key: "epsCagr",        label: "EPS CAGR FORECAST", icon: Zap, isLarge: true },
];

// ─── Scenario table ────────────────────────────────────────────────────────────

function ScenarioTable({ lens, scenarios }: { lens: LensDetail; scenarios: Record<ScenarioKey, ScenarioMetrics> }) {
  // Derive forecast period from takeaway or computed_at
  const period = (() => {
    const t = lens.takeaway ?? "";
    const m = t.match(/FY\d{2,4}[–\-]FY\d{2,4}E?/i);
    if (m) return m[0].toUpperCase();
    if (lens.computed_at) {
      const yr = new Date(lens.computed_at).getFullYear();
      return `FY${String(yr).slice(2)}–FY${String(yr + 3).slice(2)}E`;
    }
    return "3-YR FORWARD";
  })();

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
          fontSize: 9, fontWeight: 600, padding: "2px 8px",
          background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
          borderRadius: 5, color: "var(--qc-ink-2)", letterSpacing: "0.04em",
        }}>
          {period}
        </span>
      </div>

      {/* Sub-legend */}
      <div style={{ padding: "5px 16px 6px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>
          Bull case — optimistic · Base case — as per mgmt guidance · Bear case — risk-heavy
        </p>
      </div>

      {/* Scroll wrapper for narrow viewports */}
      <div style={{ overflowX: "auto" }}>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr", minWidth: 500, background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <div style={{ padding: "10px 14px", borderRight: "1px solid var(--qc-hair)" }} />
          {SCENARIO_ORDER.map((key, i) => {
            const Icon = SCENARIO_ICON[key];
            return (
              <div key={key} style={{
                padding: "10px 14px",
                borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: `color-mix(in srgb, ${SCENARIO_META[key].cssVar} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${SCENARIO_META[key].cssVar} 30%, transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={10} color={SCENARIO_META[key].cssVar} strokeWidth={2.5} />
                  </div>
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
                gridTemplateColumns: "130px 1fr 1fr 1fr",
                minWidth: 500,
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
                <div style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: "var(--qc-section)",
                  border: "1px solid var(--qc-hair)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <RowIcon size={11} color="var(--qc-ink-3)" strokeWidth={2} />
                </div>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.4, paddingTop: 2 }}>
                  {row.label}
                </p>
              </div>

              {/* Scenario cells */}
              {SCENARIO_ORDER.map((scenarioKey, i) => {
                const metric = scenarios[scenarioKey][row.key] as { value: string; note: string };
                const color = valueColor(scenarioKey, row.key === "epsCagr", metric.value);
                return (
                  <motion.div
                    key={scenarioKey}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: rowIdx * 0.05 + i * 0.02 }}
                    style={{
                      padding: "14px 14px",
                      borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined,
                      borderLeft: isLast
                        ? `3px solid color-mix(in srgb, ${SCENARIO_META[scenarioKey].cssVar} 35%, transparent)`
                        : undefined,
                    }}
                  >
                    <p style={{
                      fontSize: isLast ? 17 : 14,
                      fontWeight: 700,
                      color,
                      margin: "0 0 4px",
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {metric.value || "—"}
                    </p>
                    {metric.note && (
                      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
                        {metric.note}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}

        {/* Bottom scenario narratives */}
        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr", minWidth: 500, borderTop: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
          <div style={{ borderRight: "1px solid var(--qc-hair)", padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
            <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>ANALYST VIEW</p>
            <p style={{ fontSize: 8, color: "var(--qc-ink-3)", margin: 0, opacity: 0.7, lineHeight: 1.4 }}>Scenario assumptions & rationale</p>
          </div>
          {SCENARIO_ORDER.map((key, i) => (
            <div key={key} style={{ padding: "12px 14px", borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined }}>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: SCENARIO_META[key].cssVar }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} case
                </span>{" "}
                {scenarios[key].narrative || (
                  key === "bull"
                    ? `assumes AI-led demand acceleration and strong execution driving market share gains, resulting in ${scenarios.bull.epsCagr.value} EPS CAGR over the forecast period.`
                    : key === "base"
                    ? `reflects management guidance with moderate revenue recovery and stable margins, leading to ${scenarios.base.epsCagr.value} EPS CAGR from a normalized base.`
                    : `reflects macro weakness and discretionary spend cuts, which pressure growth and margins, leading to ${scenarios.bear.epsCagr.value} EPS CAGR over the forecast period.`
                )}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: "6px 14px", borderTop: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
        <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: 0 }}>ⓘ All figures are 3-year CAGR / Average</p>
      </div>
    </div>
  );
}

// ─── Summary metrics from top_signals ─────────────────────────────────────────

function buildSummaryMetrics(lens: LensDetail, scenarios: Record<ScenarioKey, ScenarioMetrics>) {
  const signals = lens.top_signals ?? [];

  const industrySignal = findSignal(signals, "industry_growth");
  const revSignal =
    findSignal(signals, "revenue_growth_yoy") ??
    findSignal(signals, "revenue_growth_9m_yoy") ??
    findSignalByMetricPrefix(signals, "revenue_growth");

  const revValue = revSignal?.actual_value != null ? `${revSignal.actual_value}%` : scenarios.base.revenueCagr.value;
  const revLabel = revSignal?.label?.replace(/\(.*\)/, "").trim().slice(0, 22) ?? "Revenue Growth";

  return [
    { label: "Base EPS CAGR", value: scenarios.base.epsCagr.value || "—", sub: "As per mgmt guidance" },
    { label: revLabel, value: revValue || "—", sub: revSignal?.actual_date?.slice(0, 7) ?? "YoY" },
    {
      label: "Industry CAGR",
      value: industrySignal?.actual_value != null ? `${industrySignal.actual_value}%` : "—",
      sub: "Sector baseline",
    },
  ];
}

// ─── Main component ────────────────────────────────────────────────────────────

export function LensDetailEps({ lens }: Props) {
  const scenarios = buildScenarios(lens);
  const summaryMetrics = buildSummaryMetrics(lens, scenarios);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ScenarioTable lens={lens} scenarios={scenarios} />
      <LensDrawerSummaryCard
        title={lens.takeaway?.split(".")[0] ?? "Earnings scenario analysis."}
        body={lens.takeaway ?? ""}
        metrics={summaryMetrics}
      />
    </div>
  );
}
