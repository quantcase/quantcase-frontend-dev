"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList,
} from "recharts";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

const C_PRIMARY = "#1F7A4A";
const C_SECONDARY = "#B4731A";
const C_HAIR = "#E9E7E1";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

interface MetricRow {
  key: string;
  label: string;
  value: string;
  delta: string | null;
  deltaColor: string;
  borderColor: string;
}

function formatSigValue(s: TopSignal): string {
  const v = s.actual_value;
  if (v == null) return "—";
  const unit = s.unit ?? "";
  if (unit === "%") return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "bps") return `${v} bps`;
  if (unit === "₹") return `₹${v}`;
  if (unit === "x") return `${v}x`;
  return `${v}`;
}

function rowStatus(s: TopSignal): { color: string; borderColor: string } {
  const dir = (s.direction ?? "").toLowerCase();
  if (dir === "beat" || dir === "above") return { color: "var(--qc-up)", borderColor: "var(--qc-up)" };
  if (dir === "miss" || dir === "below") return { color: "var(--qc-down)", borderColor: "var(--qc-down)" };
  // Heuristic: positive growth metric → green
  if (s.actual_value != null && s.actual_value > 0 &&
      (s.metric.toLowerCase().includes("growth") || s.metric.toLowerCase().includes("roe") || s.metric.toLowerCase().includes("roa"))) {
    return { color: "var(--qc-up)", borderColor: "var(--qc-up)" };
  }
  return { color: "var(--qc-ink-3)", borderColor: "var(--qc-ink-3)" };
}

function buildMetricRows(topSignals: TopSignal[], km: Record<string, string>): MetricRow[] {
  // Prefer signals with actual values, ordered by impact
  const withValue = topSignals.filter((s) => s.actual_value != null);
  const highImpact = withValue.filter((s) => s.impact === "high");
  const pool = highImpact.length >= 4 ? highImpact : withValue;

  const rows: MetricRow[] = pool.slice(0, 6).map((s) => {
    const { color, borderColor } = rowStatus(s);
    const deltaStr =
      s.delta_pct != null ? `${s.delta_pct > 0 ? "+" : ""}${s.delta_pct.toFixed(1)}%`
      : s.guided_value != null ? `guided ${s.guided_value}${s.unit ? " " + s.unit : ""}`
      : null;
    return {
      key: s.signal_id,
      label: s.label,
      value: formatSigValue(s),
      delta: deltaStr,
      deltaColor: color,
      borderColor,
    };
  });

  // Pad from key_metrics if fewer than 3 rows
  const kmEntries = Object.entries(km);
  let ki = 0;
  while (rows.length < 3 && ki < kmEntries.length) {
    const [k, v] = kmEntries[ki++];
    rows.push({
      key: k,
      label: k.replace(/_/g, " "),
      value: v,
      delta: null,
      deltaColor: "var(--qc-ink-3)",
      borderColor: "var(--qc-ink-3)",
    });
  }

  return rows;
}

function quarterFromDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const m = d.getMonth();
  const q = m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4;
  const fy = m < 3 ? d.getFullYear() : d.getFullYear() + 1;
  return `Q${q} FY${String(fy).slice(2)}`;
}

export function LensDetailCapital({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];
  const km = lens.key_metrics;
  const rows = buildMetricRows(topSignals, km);

  const st = lens.status ?? "";
  const statusColor =
    st.toUpperCase() === "STRONG"
      ? "var(--qc-up)"
      : st.toUpperCase() === "WEAK"
        ? "var(--qc-down)"
        : "var(--qc-warn)";

  const quarterLabel = quarterFromDate(lens.computed_at);

  // Pick top 4 high-impact signals with actual values for KPI strip
  const kpiSignals = topSignals
    .filter((s) => s.actual_value != null && s.impact === "high")
    .slice(0, 4);
  // Fall back to any signals with values
  const kpiPool = kpiSignals.length >= 4
    ? kpiSignals
    : topSignals.filter((s) => s.actual_value != null).slice(0, 4);

  // Chart data: use top signals with actual values, up to 4
  // Group into "primary" (first 2) and "secondary" (next 2) for dual-bar chart
  const chartSigs = topSignals.filter((s) => s.actual_value != null && s.impact === "high").slice(0, 4);
  const chartData = chartSigs.length >= 2
    ? chartSigs.map((s) => ({
        name: s.label.slice(0, 18),
        actual: s.actual_value ?? 0,
        guided: s.guided_value ?? null,
        unit: s.unit ?? "",
      }))
    : null;

  // Quote: takeaway or first long statement
  const quoteSig = topSignals.find((s) => s.statement && s.statement.length > 80);
  const quoteText = quoteSig?.statement?.slice(0, 220) ?? lens.takeaway?.slice(0, 220) ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header strip */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            CAPITAL ALLOCATION
          </span>
          {quarterLabel && (
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
              color: "var(--qc-ink-3)", background: "var(--qc-section)",
              border: "1px solid var(--qc-hair)", borderRadius: 4, padding: "2px 7px",
            }}>
              {quarterLabel}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: statusColor, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            {st.charAt(0).toUpperCase() + st.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Subtitle from description */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0 }}>
            {lens.description}
          </p>
        </div>

        {/* KPI tiles — top 4 high-impact signals */}
        {kpiPool.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 0 }}>
            {kpiPool.map((s, i) => {
              const { color } = rowStatus(s);
              return (
                <div key={i} style={{
                  padding: "14px 14px", background: "var(--qc-card)",
                  borderRight: i < kpiPool.length - 1 ? "1px solid var(--qc-hair)" : undefined,
                  borderTop: "1px solid var(--qc-hair)",
                  display: "flex", flexDirection: "column", gap: 4,
                }}>
                  <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
                    {s.metric.replace(/_/g, " ").slice(0, 20)}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 600, color, margin: "2px 0", lineHeight: 1 }}>
                    {formatSigValue(s)}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.35 }}>
                    {s.label.slice(0, 32)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blockquote */}
      {quoteText && (
        <div style={{ borderLeft: "3px solid var(--qc-ink)", paddingLeft: 16, paddingTop: 4, paddingBottom: 4, margin: "0 2px" }}>
          <p style={{
            fontSize: 13, fontStyle: "italic", color: "var(--qc-ink)", margin: "0 0 6px",
            lineHeight: 1.65, fontFamily: "var(--qc-font-serif, Georgia, serif)",
          }}>
            {quoteText}
          </p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
            Quantcase capital analysis{quarterLabel ? ` · ${quarterLabel}` : ""}
          </p>
        </div>
      )}

      {/* Chart: actual vs guided for top signals */}
      {chartData && chartData.length >= 2 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{
            padding: "10px 16px", background: "var(--qc-section)",
            borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
              ACTUAL vs GUIDED · TOP SIGNALS
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--qc-ink-3)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: C_PRIMARY, display: "inline-block" }} /> Actual
              </span>
              {chartData.some((d) => d.guided != null) && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--qc-ink-3)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: C_SECONDARY, display: "inline-block" }} /> Guided
                </span>
              )}
            </div>
          </div>
          <div style={{ padding: "16px 8px 8px", background: "var(--qc-card)" }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData}
                barCategoryGap="30%"
                barGap={3}
                margin={{ top: 4, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={C_HAIR} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9A9A92" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#9A9A92" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  contentStyle={{ fontSize: 11, border: `1px solid ${C_HAIR}`, borderRadius: 6, background: "#fff" }}
                />
                <ReferenceLine y={0} stroke={C_HAIR} />
                <Bar dataKey="actual" fill={C_PRIMARY} radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="actual" position="top" style={{ fontSize: 9, fill: C_PRIMARY, fontWeight: 600 }} />
                </Bar>
                {chartData.some((d) => d.guided != null) && (
                  <Bar dataKey="guided" fill={C_SECONDARY} radius={[3, 3, 0, 0]}>
                    <LabelList dataKey="guided" position="top" style={{ fontSize: 9, fill: C_SECONDARY, fontWeight: 600 }} />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Signal table */}
      {rows.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{
            padding: "10px 16px", background: "var(--qc-section)",
            borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
              CAPITAL SIGNAL BREAKDOWN
            </span>
            <span style={{ fontSize: 9, color: "var(--qc-ink-3)", marginLeft: "auto" }}>
              {topSignals.length} signals
            </span>
          </div>
          {rows.map((row, i) => (
            <div key={row.key} style={{
              padding: "11px 16px",
              background: "var(--qc-card)",
              borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : undefined,
              borderLeft: `3px solid ${row.borderColor}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: 0 }}>
                  {row.label.slice(0, 40)}
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--qc-ink)", margin: "2px 0 0", lineHeight: 1 }}>
                  {row.value}
                </p>
              </div>
              {row.delta && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: row.deltaColor,
                  border: `1px solid ${row.deltaColor}40`, borderRadius: 4, padding: "3px 8px", whiteSpace: "nowrap",
                }}>
                  {row.delta}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway}
        metrics={rows.slice(0, 3).map((r) => ({ label: r.label.slice(0, 24), value: r.value, sub: r.delta ?? "" }))}
      />
    </div>
  );
}
