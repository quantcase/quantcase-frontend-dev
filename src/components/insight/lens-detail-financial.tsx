"use client";

import { useState } from "react";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
  isBfsi?: boolean;
}

const CHART_UP = "#1F7A4A";
const CHART_WARN = "#B4731A";
const CHART_MUTED = "#9A9A92";

type RowKey = "primary" | "secondary" | "tertiary" | "fourth" | "fifth" | "sixth";

interface FinRow {
  key: RowKey;
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
  const seen = new Set<string>();
  return signals.filter((s) => {
    const key = s.signal_id ?? s.metric;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatVal(s: TopSignal): string {
  const v = s.actual_value;
  if (v == null) return "—";
  const unit = s.unit ?? "";
  if (unit === "%") return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "bps") return `${v} bps`;
  if (unit === "₹") return `₹${v}`;
  return `${v}${unit ? ` ${unit}` : ""}`;
}

function rowStatus(s: TopSignal): { status: string; color: string; bg: string } {
  const dir = s.direction;
  if (dir === "beat" || dir === "above") return { status: "BEAT", color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  if (dir === "miss" || dir === "below") return { status: "MISS", color: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  if (dir === "tracking") return { status: "ON TRACK", color: "var(--qc-blue)", bg: "var(--qc-blue-soft)" };
  // Infer from value
  if (s.actual_value != null) {
    if (s.metric.toLowerCase().includes("npa") || s.metric.toLowerCase().includes("cost")) {
      return s.actual_value < 2 ? { status: "STRONG", color: "var(--qc-up)", bg: "var(--qc-up-soft)" } : { status: "WATCH", color: "var(--qc-warn)", bg: "var(--qc-warn-soft)" };
    }
    if (s.actual_value > 0) return { status: "POSITIVE", color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  }
  return { status: "NEUTRAL", color: "var(--qc-ink-3)", bg: "var(--qc-section)" };
}

function buildRows(topSignals: TopSignal[]): FinRow[] {
  const keys: RowKey[] = ["primary", "secondary", "tertiary", "fourth", "fifth", "sixth"];
  // Prefer high-impact signals first
  const pool = [
    ...topSignals.filter((s) => s.impact === "high"),
    ...topSignals.filter((s) => s.impact !== "high"),
  ];
  const picked = pool.slice(0, 6);

  return picked.map((s, i) => {
    const { status, color, bg } = rowStatus(s);
    const hasGuided = s.guided_value != null;
    const vsPrior = hasGuided
      ? (s.direction === "beat" ? `↑ +${((s.actual_value ?? 0) - (s.guided_value ?? 0)).toFixed(1)}${s.unit ?? ""}` :
         s.direction === "miss" ? `↓ ${((s.actual_value ?? 0) - (s.guided_value ?? 0)).toFixed(1)}${s.unit ?? ""}` :
         `Guided: ${s.guided_value}${s.unit ?? ""}`)
      : (s.delta_pct != null ? `${s.delta_pct > 0 ? "↑" : "↓"} ${s.delta_pct.toFixed(1)}% YoY` : "—");

    return {
      key: keys[i] ?? "primary",
      category: s.label.split(" ")[0] ?? "Metric",
      metric: s.label,
      sub: s.statement?.slice(0, 50) ?? "",
      current: formatVal(s),
      vsPrior,
      vsPriorColor: s.direction === "beat" || (s.delta_pct ?? 0) > 0 ? "var(--qc-up)" : s.direction === "miss" ? "var(--qc-down)" : "var(--qc-warn)",
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

  // Pad with key_metrics if needed
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

// ── Chart: generic signal trend (uses actual_value as single point) ───────────

function ChartGeneric({ row }: { row: FinRow }) {
  const s = row.signal;
  if (!s || s.actual_value == null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--qc-ink-3)", fontSize: 12 }}>
        No chart data available
      </div>
    );
  }

  const isPositive = row.statusColor === "var(--qc-up)";
  const color = isPositive ? CHART_UP : CHART_WARN;
  const hasGuided = s.guided_value != null;
  const data = hasGuided
    ? [
        { label: "Guided", value: s.guided_value! },
        { label: "Actual", value: s.actual_value },
      ]
    : [{ label: s.label.slice(0, 12), value: s.actual_value }];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>{s.label}</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {s.unit ?? ""} · {s.actual_date ?? "Latest"}
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>Actual</p>
            <p style={{ fontSize: 18, fontWeight: 600, color, margin: 0 }}>{formatVal(s)}</p>
          </div>
          {s.guided_value != null && (
            <div>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>Guided</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: CHART_MUTED, margin: 0 }}>{s.guided_value}{s.unit ?? ""}</p>
            </div>
          )}
          {s.direction && (
            <div>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>Status</p>
              <p style={{ fontSize: 18, fontWeight: 600, color, margin: 0, textTransform: "uppercase" }}>{s.direction}</p>
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number) => [`${v}${s.unit ?? ""}`, row.metric]}
            />
            <Bar dataKey="value" fill={color} fillOpacity={0.75} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Chart: signals with guided vs actual as area/line ─────────────────────────

function ChartGrowthSignals({ topSignals }: { topSignals: TopSignal[] }) {
  const growthSigs = topSignals
    .filter((s) => s.actual_value != null && s.unit === "%")
    .slice(0, 6);

  if (growthSigs.length === 0) return null;

  const data = growthSigs.map((s) => ({
    name: s.label.slice(0, 14),
    actual: s.actual_value,
    guided: s.guided_value,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>Key Metrics Overview</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Actual vs Guided · %
        </p>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_UP} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_UP} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 8, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number, name: string) => [`${v}%`, name === "actual" ? "Actual" : "Guided"]}
            />
            <Area type="monotone" dataKey="actual" stroke={CHART_UP} strokeWidth={2} fill="url(#actGrad)" />
            <Line type="monotone" dataKey="guided" stroke={CHART_MUTED} strokeWidth={1.5} strokeDasharray="5 3"
              dot={(props: { cx: number; cy: number; index: number }) => (
                <circle key={`g-${props.index}`} cx={props.cx} cy={props.cy} r={2} fill={CHART_MUTED} />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 16, height: 2, background: CHART_UP, borderRadius: 1 }} />
          <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Actual</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke={CHART_MUTED} strokeWidth="1.5" strokeDasharray="5 3" /></svg>
          <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Guided</span>
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ activeKey, rows, topSignals }: { activeKey: RowKey; rows: FinRow[]; topSignals: TopSignal[] }) {
  if (activeKey === "primary") {
    const growthSigs = topSignals.filter((s) => s.actual_value != null && s.unit === "%");
    if (growthSigs.length >= 2) return <ChartGrowthSignals topSignals={topSignals} />;
  }
  const row = rows.find((r) => r.key === activeKey);
  if (!row) return null;
  return <ChartGeneric row={row} />;
}

// ── Main export ──────────────────────────────────────────────────────────────

export function LensDetailFinancial({ lens, signals: _signals, isBfsi }: Props) {
  const topSignals: TopSignal[] = dedup(lens.top_signals ?? []);
  const [activeKey, setActiveKey] = useState<RowKey>("primary");

  const rows = buildRows(topSignals);
  const activeRow = rows.find((r) => r.key === activeKey) ?? rows[0];

  const summaryMetrics = rows.slice(0, 3).map((r) => ({
    label: r.category,
    value: r.current,
    sub: r.vsPrior,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <KpiStrip topSignals={topSignals} km={lens.key_metrics} />

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 1, border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>

        {/* Left — signal table */}
        <div style={{ borderRight: "1px solid var(--qc-hair)", overflowX: "auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "70px 1fr 90px 110px 90px",
            minWidth: 460,
            gap: 8, padding: "8px 14px",
            background: "var(--qc-section)",
            borderBottom: "1px solid var(--qc-hair)",
          }}>
            {["SIGNAL", "METRIC", "CURRENT", isBfsi ? "YoY TREND" : "VS GUIDED", "STATUS"].map((h) => (
              <p key={h} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>{h}</p>
            ))}
          </div>

          {rows.length === 0 && (
            <div style={{ padding: "20px 14px" }}>
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>No signal data available for this company</p>
            </div>
          )}

          {rows.map((row, i) => {
            const isActive = row.key === activeKey;
            return (
              <div
                key={row.key}
                onClick={() => setActiveKey(row.key)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 90px 110px 90px",
                  minWidth: 460,
                  gap: 8, alignItems: "center", padding: "11px 14px",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : undefined,
                  background: isActive ? `${row.statusColor}10` : "var(--qc-card)",
                  borderLeft: isActive ? `3px solid ${row.statusColor}` : "3px solid transparent",
                  cursor: "pointer", transition: "background 0.15s",
                }}
              >
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, fontWeight: 500, lineHeight: 1.3 }}>{row.category.slice(0, 10)}</p>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{row.metric.slice(0, 30)}</p>
                  {row.sub && <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.3 }}>{row.sub}</p>}
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{row.current}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: row.vsPriorColor, margin: 0 }}>{row.vsPrior}</p>
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: row.statusColor, background: row.statusBg,
                  padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap",
                }}>
                  {row.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right — chart panel */}
        <div style={{ padding: "16px 16px 12px", background: "var(--qc-card)", display: "flex", flexDirection: "column", minHeight: 320 }}>
          <ChartPanel activeKey={activeKey} rows={rows} topSignals={topSignals} />
        </div>
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway}
        metrics={summaryMetrics}
      />
    </div>
  );
}
