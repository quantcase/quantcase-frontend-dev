"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart2, Activity, Zap } from "lucide-react";
import type React from "react";
import { BACKEND_URL } from "@/lib/constants";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

// ─── API types ────────────────────────────────────────────────────────────────

interface EarningsForecastScenario {
  scenario: "bull" | "base" | "bear";
  industry_growth_pct: number;
  rev_cagr_low: number;
  rev_cagr_high: number;
  rev_cagr_label: string;
  margin_pct: number;
  eps_cagr_pct: number;
  analyst_view: string;
  target_low: number;
  target_high: number;
}

interface TimeseriesEntry {
  period: string;
  fiscal_year: string;
  quarter: string;
  value: number;
  abbrUsed: string;
}

interface EarningsForecastData {
  ticker: string;
  call_id: string;
  available: boolean;
  is_stale: boolean;
  computed_at: string | null;
  score: number;
  status: string;
  z_score: number;
  takeaway: string;
  risks: string[];
  holding_period_years: number;
  risk_reward: number;
  industry_growth: {
    pct: number;
    label: string;
    direction: string;
    statement: string;
  };
  scenarios: EarningsForecastScenario[];
  summary_bar: {
    base_eps_cagr_pct: number;
    base_rev_cagr_label: string;
    base_rev_cagr_pct: number;
    industry_cagr_pct: number;
    industry_cagr_label: string;
  };
  financial_context: {
    latest_rev_op: number;
    latest_pat: number;
    latest_eps: number;
    base_margin_pct: number | null;
    rev_cagr_actual: number;
    timeseries: {
      REV_OP: TimeseriesEntry[];
      PAT: TimeseriesEntry[];
      EBITDA_MARGIN: TimeseriesEntry[];
      EPS_BASIC: TimeseriesEntry[];
    };
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useEarningsForecast(ticker: string | undefined) {
  const [data, setData] = useState<EarningsForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker?.trim()) return;
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}/api/deal/earnings-forecast?ticker=${ticker}`)
      .then((r) => r.json())
      .then((res: { success: boolean; data: EarningsForecastData }) => {
        setData(res.data ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [ticker]);

  return { data, loading, error };
}

// ─── Scenario config ──────────────────────────────────────────────────────────

type ScenarioKey = "bull" | "base" | "bear";

const SCENARIO_META: Record<ScenarioKey, { label: string; sub: string; cssVar: string; Icon: React.ElementType }> = {
  bull: { label: "BULL CASE", sub: "Optimistic scenario",     cssVar: "var(--qc-up)",   Icon: TrendingUp  },
  base: { label: "BASE CASE", sub: "As per mgmt guidance",    cssVar: "var(--qc-blue)", Icon: Minus       },
  bear: { label: "BEAR CASE", sub: "Risk-heavy scenario",     cssVar: "var(--qc-down)", Icon: TrendingDown },
};

const SCENARIO_ORDER: ScenarioKey[] = ["bull", "base", "bear"];

// ─── Scenario table ────────────────────────────────────────────────────────────

function ScenarioTable({ data }: { data: EarningsForecastData }) {
  const byKey = Object.fromEntries(data.scenarios.map((s) => [s.scenario, s])) as Record<ScenarioKey, EarningsForecastScenario>;

  const period = (() => {
    const t = data.takeaway ?? "";
    const m = t.match(/FY\d{2,4}[–\-]FY\d{2,4}E?/i);
    if (m) return m[0].toUpperCase();
    if (data.computed_at) {
      const yr = new Date(data.computed_at).getFullYear();
      return `FY${String(yr).slice(2)}–FY${String(yr + 3).slice(2)}E`;
    }
    return `${data.holding_period_years ?? 3}-YR FORWARD`;
  })();

  type RowDef = {
    key: string;
    label: string;
    Icon: React.ElementType;
    getValue: (s: EarningsForecastScenario) => string;
    getNote: (s: EarningsForecastScenario) => string;
    isLarge?: boolean;
  };

  const rows: RowDef[] = [
    {
      key: "industry",
      label: "INDUSTRY GROWTH",
      Icon: TrendingUp,
      getValue: (s) => `~${s.industry_growth_pct}%`,
      getNote: (s) =>
        s.scenario === "bull" ? "Sector tailwinds drive outperformance"
        : s.scenario === "base" ? "Sector growth in line with guidance"
        : "Macro headwinds weigh on sector",
    },
    {
      key: "rev",
      label: "REVENUE CAGR",
      Icon: BarChart2,
      getValue: (s) => s.rev_cagr_label,
      getNote: (s) => s.analyst_view.split(";")[0].split(",")[0],
    },
    {
      key: "margin",
      label: "MARGIN TRAJECTORY",
      Icon: Activity,
      getValue: (s) => {
        if (s.scenario === "bull") return `+${s.margin_pct}%`;
        if (s.scenario === "bear") return `-100 to -150bps`;
        return `${s.margin_pct}%`;
      },
      getNote: (s) =>
        s.scenario === "bull" ? "Operating leverage + mix improvement"
        : s.scenario === "base" ? "Stable improvement on operational leverage"
        : "Input cost inflation + low utilisation",
    },
    {
      key: "eps",
      label: "EPS CAGR FORECAST",
      Icon: Zap,
      getValue: (s) => (s.eps_cagr_pct < 0 ? `${s.eps_cagr_pct}%` : `${s.eps_cagr_pct}%`),
      getNote: (s) =>
        s.scenario === "bull" ? "Triple-compounding EPS engine"
        : s.scenario === "base" ? "Revenue growth + stable margins + buybacks"
        : "Volume + margin compression",
      isLarge: true,
    },
  ];

  function cellColor(key: string, scenario: ScenarioKey, value: string): string {
    if (key === "eps") return SCENARIO_META[scenario].cssVar;
    const num = parseFloat(value.replace(/[^-\d.]/g, ""));
    if (!isNaN(num) && num < 0) return "var(--qc-down)";
    if (scenario === "bear") return "var(--qc-down)";
    if (scenario === "bull") return "var(--qc-up)";
    return "var(--qc-ink)";
  }

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

      <div style={{ overflowX: "auto" }}>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr", minWidth: 500, background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <div style={{ padding: "10px 14px", borderRight: "1px solid var(--qc-hair)" }} />
          {SCENARIO_ORDER.map((key, i) => {
            const meta = SCENARIO_META[key];
            const Icon = meta.Icon;
            return (
              <div key={key} style={{ padding: "10px 14px", borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: `color-mix(in srgb, ${meta.cssVar} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${meta.cssVar} 30%, transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={10} color={meta.cssVar} strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: meta.cssVar, margin: 0, textTransform: "uppercase" }}>
                    {meta.label}
                  </p>
                </div>
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{meta.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Metric rows */}
        {rows.map((row, rowIdx) => {
          const isLast = rowIdx === rows.length - 1;
          const RowIcon = row.Icon;
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
              <div style={{
                padding: "14px 14px",
                borderRight: "1px solid var(--qc-hair)",
                display: "flex", alignItems: "flex-start", gap: 7,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <RowIcon size={11} color="var(--qc-ink-3)" strokeWidth={2} />
                </div>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.4, paddingTop: 2 }}>
                  {row.label}
                </p>
              </div>

              {SCENARIO_ORDER.map((scenarioKey, i) => {
                const s = byKey[scenarioKey];
                const value = row.getValue(s);
                const note = row.getNote(s);
                const color = cellColor(row.key, scenarioKey, value);
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
                      fontSize: isLast ? 17 : 14, fontWeight: 700,
                      color, margin: "0 0 4px", lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {value || "—"}
                    </p>
                    {note && (
                      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
                        {note}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}

        {/* Analyst view row */}
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
                {byKey[key]?.analyst_view ?? ""}
              </p>
            </div>
          ))}
        </div>

      </div>

      <div style={{ padding: "6px 14px", borderTop: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
        <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: 0 }}>ⓘ All figures are {data.holding_period_years ?? 3}-year CAGR / Average</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  lens?: unknown;
  ticker?: string;
}

export function LensDetailEarningsForecast({ ticker }: Props) {
  const { data, loading, error } = useEarningsForecast(ticker);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 80, borderRadius: 10, background: "var(--qc-section)", border: "1px solid var(--qc-hair)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    );
  }

  if (error || !data?.available) {
    return (
      <div style={{ padding: "20px 16px", borderRadius: 10, background: "var(--qc-section)", border: "1px solid var(--qc-hair)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--qc-ink-3)", margin: 0 }}>
          {error ? "Failed to load earnings forecast data." : "Earnings forecast not available for this ticker."}
        </p>
      </div>
    );
  }

  const summaryMetrics = [
    {
      label: "Base EPS CAGR",
      value: `${data.summary_bar.base_eps_cagr_pct}%`,
      sub: "As per mgmt guid...",
    },
    {
      label: "Revenue Grow...",
      value: data.summary_bar.base_rev_cagr_label,
      sub: "YoY",
    },
    {
      label: "Industry CAGR",
      value: `${data.summary_bar.industry_cagr_pct}%`,
      sub: "Sector baseline",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ScenarioTable data={data} />
      <LensDrawerSummaryCard
        title={data.takeaway?.split(".")[0] ?? "Earnings scenario analysis."}
        body={data.takeaway ?? ""}
        metrics={summaryMetrics}
      />
    </div>
  );
}
