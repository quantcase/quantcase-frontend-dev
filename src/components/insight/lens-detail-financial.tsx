"use client";

import { useState } from "react";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { LensDetail, TopSignal, TimeseriesPoint } from "@/hooks/useLenses";
import { useFinancialStrength } from "@/hooks/useLenses";

interface Props {
  lens: LensDetail;
  ticker?: string;
  isBfsi?: boolean;
}

const CHART_UP = "#1F7A4A";
const CHART_WARN = "#B4731A";
const CHART_MUTED = "#9A9A92";

interface FinRow {
  key: string;
  category: string;
  metric: string;
  sub: string;
  current: string;
  vsPrior: string;
  vsPriorColor: string;
  status: string;
  statusColor: string;
  statusBg: string;
  signal?: TopSignal;
}

function dedup(signals: TopSignal[]): TopSignal[] {
  const seenId = new Set<string>();
  const seenMetric = new Set<string>();
  return signals.filter((s) => {
    if (seenMetric.has(s.metric)) return false;
    seenMetric.add(s.metric);
    if (s.signal_id) seenId.add(s.signal_id);
    return true;
  });
}

function formatVal(s: TopSignal): string {
  const v = s.actual_value;
  if (v == null) return "—";
  const unit = s.unit ?? "";
  const fmt = (n: number) => Math.abs(n) >= 100 ? Math.round(n).toLocaleString("en-IN") : parseFloat(n.toPrecision(4)).toString();
  if (unit === "%") return `${v.toFixed(1)}%`;
  if (unit === "Cr") return `₹${fmt(v)} Cr`;
  if (unit === "bps") return `${fmt(v)} bps`;
  if (unit === "₹") return `₹${fmt(v)}`;
  if (unit === "x") return `${v.toFixed(2)}x`;
  return `${fmt(v)}${unit ? ` ${unit}` : ""}`;
}

function formatSeriesVal(value: number, unit: string | null): string {
  const fmt = (n: number) => Math.abs(n) >= 100 ? Math.round(n).toLocaleString("en-IN") : parseFloat(n.toPrecision(4)).toString();
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "Cr") return `₹${fmt(value)} Cr`;
  if (unit === "x") return `${value.toFixed(2)}x`;
  if (unit === "₹") return `₹${fmt(value)}`;
  return fmt(value);
}

function rowStatus(s: TopSignal): { status: string; color: string; bg: string } {
  const dir = s.direction;
  if (dir === "beat" || dir === "above") return { status: "BEAT", color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  if (dir === "miss" || dir === "below") return { status: "MISS", color: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  if (dir === "tracking") return { status: "ON TRACK", color: "var(--qc-blue)", bg: "var(--qc-blue-soft)" };
  if (dir === "in_line") return { status: "IN LINE", color: "var(--qc-ink-3)", bg: "var(--qc-section)" };
  if (s.actual_value != null) {
    if (s.metric.toLowerCase().includes("npa") || s.metric.toLowerCase().includes("cost")) {
      return s.actual_value < 2 ? { status: "STRONG", color: "var(--qc-up)", bg: "var(--qc-up-soft)" } : { status: "WATCH", color: "var(--qc-warn)", bg: "var(--qc-warn-soft)" };
    }
    if (s.actual_value > 0) return { status: "POSITIVE", color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  }
  return { status: "NEUTRAL", color: "var(--qc-ink-3)", bg: "var(--qc-section)" };
}

const METRIC_CATEGORY: Record<string, string> = {
  REV_OP: "Revenue", EBITDA: "EBITDA", PAT: "Profit", PAT_MARGIN: "Margin",
  CFO: "Cash Flow", ROCE: "Returns", ROE: "Returns", DE: "Leverage",
  EPS_BASIC: "EPS", ASSET_PPE: "Assets", IC: "Coverage", CAPEX: "CapEx",
};

function computeYoY(s: TopSignal): { text: string; color: string } {
  // 1. Prefer guided vs actual delta
  if (s.guided_value != null && s.actual_value != null) {
    const diff = s.actual_value - s.guided_value;
    const pct = s.guided_value !== 0 ? (diff / Math.abs(s.guided_value)) * 100 : 0;
    const arrow = diff >= 0 ? "↑" : "↓";
    const color = diff >= 0 ? "var(--qc-up)" : "var(--qc-down)";
    return { text: `${arrow} ${Math.abs(pct).toFixed(1)}% vs guided`, color };
  }
  // 2. Use delta_pct if present
  if (s.delta_pct != null) {
    const arrow = s.delta_pct >= 0 ? "↑" : "↓";
    const color = s.delta_pct >= 0 ? "var(--qc-up)" : "var(--qc-down)";
    return { text: `${arrow} ${Math.abs(s.delta_pct).toFixed(1)}%`, color };
  }
  // 3. Compute from timeseries annual (last two points)
  const annual = s.timeseries?.annual ?? [];
  if (annual.length >= 2) {
    const prev = annual[annual.length - 2].value;
    const curr = annual[annual.length - 1].value;
    if (prev !== 0) {
      const pct = ((curr - prev) / Math.abs(prev)) * 100;
      const arrow = pct >= 0 ? "↑" : "↓";
      const color = pct >= 0 ? "var(--qc-up)" : "var(--qc-down)";
      return { text: `${arrow} ${Math.abs(pct).toFixed(1)}%`, color };
    }
  }
  return { text: "—", color: "var(--qc-ink-3)" };
}

function buildRows(topSignals: TopSignal[]): FinRow[] {
  const pool = [
    ...topSignals.filter((s) => s.impact === "high" && hasTimeseries(s)),
    ...topSignals.filter((s) => s.impact !== "high" && hasTimeseries(s)),
  ];

  return pool.map((s) => {
    const { status, color, bg } = rowStatus(s);
    const { text: vsPrior, color: vsPriorColor } = computeYoY(s);
    const category = METRIC_CATEGORY[s.metric] ?? s.label.split(" ")[0] ?? "Metric";

    return {
      key: s.signal_id ?? s.metric,
      category,
      metric: s.label,
      sub: s.statement ?? "",
      current: formatVal(s),
      vsPrior,
      vsPriorColor,
      status,
      statusColor: color,
      statusBg: bg,
      signal: s,
    };
  });
}

// ── KPI strip ─────────────────────────────────────────────────────────────────

function KpiStrip({ topSignals, km }: { topSignals: TopSignal[]; km: Record<string, string> }) {
  const withValue = topSignals.filter((s) => s.actual_value != null);
  const high = withValue.filter((s) => s.impact === "high");
  const pool = high.length >= 4 ? high : withValue;
  const tiles = pool.slice(0, 4);

  const kmEntries = Object.entries(km);
  let ki = 0;
  while (tiles.length < 4 && ki < kmEntries.length) {
    const [k, v] = kmEntries[ki++];
    tiles.push({
      signal_id: k, metric: k, label: k.replace(/_/g, " "),
      actual_value: null, guided_value: null, actual_date: null, guided_date: null,
      value_targeted: null, value_at_announcement: null, announcement_date: null, target_date: null,
      unit: null, delta: null, delta_pct: null, direction: null, impact: null, statement: v, original_statement: null,
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>
      {tiles.map((t, i) => {
        const isGrowth = t.actual_value != null && t.actual_value > 0;
        const color = t.direction === "beat" ? "var(--qc-up)" : t.direction === "miss" ? "var(--qc-down)" : isGrowth ? "var(--qc-up)" : "var(--qc-warn)";
        return (
          <div key={t.signal_id} style={{
            padding: "14px 16px", background: "var(--qc-section)",
            borderRight: i < 3 ? "1px solid var(--qc-hair)" : undefined,
          }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color, margin: "0 0 4px" }}>
              {t.label.slice(0, 24)}
            </p>
            <p style={{ fontSize: 22, fontWeight: 600, color, margin: "0 0 4px", lineHeight: 1.1 }}>
              {t.actual_value != null ? formatVal(t) : (t.statement?.slice(0, 14) ?? "—")}
            </p>
            {t.statement && t.actual_value != null && (
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                {t.statement.slice(0, 50)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Helpers for building chart series from timeseries data ────────────────────

function fmtFY(fiscal_year: string): string {
  // "FY2024" → "FY'24", handles "FY2020" correctly
  const year = fiscal_year.replace(/^FY/, "");
  return `FY'${year.slice(-2)}`;
}

function buildAnnualSeries(signal: TopSignal): { period: string; value: number }[] {
  const annual = signal.timeseries?.annual ?? [];
  const latest = signal.timeseries?.latest_quarter;

  const points = annual.map((p: TimeseriesPoint) => ({
    period: fmtFY(p.fiscal_year),
    value: p.value,
  }));

  if (latest) {
    points.push({ period: fmtFY(latest.fiscal_year) + "*", value: latest.value });
  }

  return points;
}

function hasTimeseries(signal: TopSignal): boolean {
  return (signal.timeseries?.annual?.length ?? 0) > 0 || signal.timeseries?.latest_quarter != null;
}

// ── Chart: timeseries area/bar for a single selected signal ──────────────────

function ChartSignalTimeseries({ row }: { row: FinRow }) {
  const s = row.signal;
  if (!s || !hasTimeseries(s)) return null;

  const isPositive = row.statusColor === "var(--qc-up)";
  const color = isPositive ? CHART_UP : CHART_WARN;
  const data = buildAnnualSeries(s);
  const isPct = s.unit === "%";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ChartHeader signal={s} color={color} />
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          {isPct ? (
            <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 8, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => formatSeriesVal(v, s.unit)} />
              <Tooltip
                contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [formatSeriesVal(v, s.unit), s.label]}
              />
              <Bar dataKey="value" fill={color} fillOpacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={`sigGrad-${s.metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 8, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => formatSeriesVal(v, s.unit)} />
              <Tooltip
                contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [formatSeriesVal(v, s.unit), s.label]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
                fill={`url(#sigGrad-${s.metric})`} dot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      {data.some((d) => d.period.endsWith("*")) && (
        <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: "4px 0 0", textAlign: "right" }}>* latest quarter (annualised)</p>
      )}
    </div>
  );
}

function ChartHeader({ signal: s, color }: { signal: TopSignal; color: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>{s.label}</p>
      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {s.unit ?? ""}{s.unit ? " · " : ""}Annual trend
      </p>
      <div style={{ display: "flex", gap: 20 }}>
        {s.actual_value != null && (
          <div>
            <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>Latest</p>
            <p style={{ fontSize: 18, fontWeight: 600, color, margin: 0 }}>{formatVal(s)}</p>
          </div>
        )}
        {s.guided_value != null && (
          <div>
            <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>Guided</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: CHART_MUTED, margin: 0 }}>{s.guided_value}{s.unit ?? ""}</p>
          </div>
        )}
        {s.direction && (
          <div>
            <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>Status</p>
            <p style={{ fontSize: 18, fontWeight: 600, color, margin: 0, textTransform: "uppercase" }}>{s.direction.replace("_", " ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chart: multi-signal overview using timeseries (primary / overview panel) ──

function ChartOverview({ topSignals }: { topSignals: TopSignal[] }) {
  // Pick up to 3 signals that have annual timeseries data, preferring high-impact
  const candidates = [
    ...topSignals.filter((s) => s.impact === "high" && hasTimeseries(s)),
    ...topSignals.filter((s) => s.impact !== "high" && hasTimeseries(s)),
  ].slice(0, 3);

  if (candidates.length === 0) return null;

  // Build a unified period-keyed dataset aligned across all selected signals
  const periodSet = new Set<string>();
  candidates.forEach((s) => {
    buildAnnualSeries(s).forEach((p) => periodSet.add(p.period));
  });
  const periods = Array.from(periodSet).sort();

  const data = periods.map((period) => {
    const row: Record<string, string | number | null> = { period };
    candidates.forEach((s) => {
      const pt = buildAnnualSeries(s).find((p) => p.period === period);
      row[s.metric] = pt?.value ?? null;
    });
    return row;
  });

  const colors = [CHART_UP, "#3A6BEF", CHART_WARN];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>Key Metrics Overview</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Annual trend
        </p>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              {candidates.map((s, i) => (
                <linearGradient key={s.metric} id={`ovGrad-${s.metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i]} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={colors[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 8, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => {
                const primary = candidates[0];
                return formatSeriesVal(v, primary?.unit ?? null);
              }} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number, name: string) => {
                const sig = candidates.find((s) => s.metric === name);
                return [formatSeriesVal(v, sig?.unit ?? null), sig?.label ?? name];
              }}
            />
            {candidates.map((s, i) => (
              <Area key={s.metric} type="monotone" dataKey={s.metric}
                stroke={colors[i]} strokeWidth={2}
                fill={`url(#ovGrad-${s.metric})`}
                dot={{ r: 2, fill: colors[i], strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
        {candidates.map((s, i) => (
          <div key={s.metric} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 16, height: 2, background: colors[i], borderRadius: 1 }} />
            <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {s.label.slice(0, 20)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartPanel({ activeKey, rows, topSignals }: { activeKey: string | null; rows: FinRow[]; topSignals: TopSignal[] }) {
  if (activeKey === null) {
    const overviewSignals = topSignals.filter(hasTimeseries);
    if (overviewSignals.length >= 2) return <ChartOverview topSignals={overviewSignals} />;
  }
  const row = rows.find((r) => r.key === activeKey);
  if (!row) return null;
  return <ChartSignalTimeseries row={row} />;
}

// ── Main export ──────────────────────────────────────────────────────────────

export function LensDetailFinancial({ lens, ticker }: Props) {
  const { data: fsData, loading } = useFinancialStrength(ticker ?? "");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Prefer timeseries-enriched signals from the dedicated endpoint; fall back to lens signals
  const rawSignals = fsData?.top_signals ?? lens.top_signals ?? [];
  const topSignals: TopSignal[] = dedup(rawSignals);

  const rows = buildRows(topSignals);
  const resolvedKey = activeKey ?? rows[0]?.key ?? null;
  const summaryMetrics = rows.slice(0, 3).map((r) => ({
    label: r.category,
    value: r.current,
    sub: r.vsPrior,
  }));

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* KPI strip skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ padding: "14px 16px", background: "var(--qc-section)", borderRight: i < 3 ? "1px solid var(--qc-hair)" : undefined }}>
              <div style={{ height: 8, width: 80, background: "var(--qc-hair)", borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 22, width: 100, background: "var(--qc-hair)", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 8, width: 120, background: "var(--qc-hair)", borderRadius: 4 }} />
            </div>
          ))}
        </div>
        {/* Table + chart skeleton */}
        <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ borderRight: "1px solid var(--qc-hair)" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: i < 5 ? "1px solid var(--qc-hair)" : undefined, background: "var(--qc-card)" }}>
                <div style={{ height: 10, width: 56, background: "var(--qc-hair)", borderRadius: 4 }} />
                <div style={{ flex: 1, height: 10, background: "var(--qc-hair)", borderRadius: 4 }} />
                <div style={{ height: 10, width: 60, background: "var(--qc-hair)", borderRadius: 4 }} />
                <div style={{ height: 10, width: 50, background: "var(--qc-hair)", borderRadius: 4 }} />
              </div>
            ))}
          </div>
          <div style={{ padding: "16px", background: "var(--qc-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", height: 220, background: "var(--qc-section)", borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <KpiStrip topSignals={topSignals} km={lens.key_metrics} />

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 1, border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>

        {/* Left — signal table */}
        <div style={{ borderRight: "1px solid var(--qc-hair)", overflowX: "auto" }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "72px 1fr 96px 88px",
            minWidth: 380,
            background: "var(--qc-section)",
            borderBottom: "1px solid var(--qc-hair)",
          }}>
            {[
              { label: "SIGNAL", align: "left" as const },
              { label: "METRIC", align: "left" as const },
              { label: "CURRENT", align: "right" as const },
              { label: "STATUS", align: "left" as const },
            ].map((h, ci) => (
              <p key={h.label} style={{
                fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em",
                color: "var(--qc-ink-3)", margin: 0,
                padding: "8px 12px",
                textAlign: h.align,
                borderRight: ci < 3 ? "1px solid var(--qc-hair)" : undefined,
              }}>{h.label}</p>
            ))}
          </div>

          {rows.length === 0 && (
            <div style={{ padding: "20px 14px" }}>
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>No signal data available for this company</p>
            </div>
          )}

          {rows.map((row, i) => {
            const isActive = row.key === resolvedKey;
            return (
              <div
                key={row.key}
                onClick={() => setActiveKey(row.key)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr 96px 88px",
                  minWidth: 380,
                  alignItems: "center",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : undefined,
                  background: isActive ? `${row.statusColor}10` : "var(--qc-card)",
                  borderLeft: isActive ? `3px solid ${row.statusColor}` : "3px solid transparent",
                  cursor: "pointer", transition: "background 0.15s",
                }}
              >
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, fontWeight: 500, lineHeight: 1.3, padding: "11px 12px", borderRight: "1px solid var(--qc-hair)", alignSelf: "stretch", display: "flex", alignItems: "center" }}>{row.category}</p>
                <div style={{ padding: "11px 12px", borderRight: "1px solid var(--qc-hair)", alignSelf: "stretch" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>
                    {row.metric}
                  </p>
                  {row.sub && <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.4 }}>{row.sub}</p>}
                </div>
                <div style={{ padding: "11px 12px", borderRight: "1px solid var(--qc-hair)", alignSelf: "stretch", textAlign: "right" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{row.current}</p>
                  {row.vsPrior !== "—" && (
                    <p style={{ fontSize: 10, fontWeight: 600, color: row.vsPriorColor, margin: "2px 0 0" }}>{row.vsPrior}</p>
                  )}
                </div>
                <div style={{ padding: "11px 12px", display: "flex", alignItems: "center" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
                    color: row.statusColor, background: row.statusBg,
                    padding: "4px 8px", borderRadius: 4, whiteSpace: "nowrap", lineHeight: 1,
                  }}>
                    {row.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — chart panel */}
        <div style={{ padding: "16px 16px 12px", background: "var(--qc-card)", display: "flex", flexDirection: "column", minHeight: 320 }}>
          <ChartPanel activeKey={resolvedKey} rows={rows} topSignals={topSignals} />
        </div>
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={fsData?.takeaway ?? lens.takeaway}
        metrics={summaryMetrics}
      />
    </div>
  );
}
