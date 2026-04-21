"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartGroup } from "@/types/financials";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MultiLineBarComboChartProps {
  chartGroups: ChartGroup[];
  /** Left y-axis label (for bar series) */
  leftAxisLabel?: string;
  /** Right y-axis label (for line series) */
  rightAxisLabel?: string;
  /** Height of the chart area in pixels — defaults to 300 */
  height?: number;
  className?: string;
  /** When provided, wraps the chart in a SectionPanel with this title */
  title?: string;
  /** Subtitle shown below the title in the SectionPanel header */
  subtitle?: string;
}

// ─── Default colors ───────────────────────────────────────────────────────────

const BAR_COLORS = ["#a5b4fc", "#93c5fd", "#6ee7b7", "#fcd34d"];
const LINE_COLORS = ["#0F172B", "#d97706", "#6b7280", "#7c3aed"];

// ─── Merge series data into flat recharts rows keyed by x ────────────────────

function mergeGroupData(group: ChartGroup): Record<string, string | number | null>[] {
  const map = new Map<string, Record<string, string | number | null>>();

  // Collect all x labels in order from the first series that has data
  const allSeries = [...group.barSeries, ...group.lineSeries];
  for (const s of allSeries) {
    for (const pt of s.data) {
      if (!map.has(pt.x)) map.set(pt.x, { x: pt.x });
      map.get(pt.x)![s.dataKey] = pt.y;
    }
  }

  return Array.from(map.values());
}

// ─── Custom legend checkbox item ──────────────────────────────────────────────

function LegendItem({
  color,
  name,
  visible,
  isBar,
  isDashed,
  onToggle,
}: {
  color: string;
  name: string;
  visible: boolean;
  isBar: boolean;
  isDashed?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 cursor-pointer select-none"
      style={{ opacity: visible ? 1 : 0.35 }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          borderRadius: 3,
          border: `2px solid ${color}`,
          background: visible ? color : "transparent",
          flexShrink: 0,
        }}
      >
        {visible && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {isBar ? (
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
      ) : (
        <svg width="16" height="8" style={{ flexShrink: 0 }}>
          <line
            x1="0" y1="4" x2="16" y2="4"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={isDashed ? "4 2" : undefined}
          />
        </svg>
      )}

      <span style={{ fontSize: 12, color: "#888888", whiteSpace: "nowrap" }}>{name}</span>
    </button>
  );
}

// ─── Group toggle button ───────────────────────────────────────────────────────

function GroupButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: 6,
        border: `1px solid ${active ? "#0F172B" : "#E2E2E2"}`,
        background: active ? "#0F172B" : "transparent",
        color: active ? "#ffffff" : "#888888",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ─── Y-axis tick formatter ────────────────────────────────────────────────────

function fmtTick(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return parseFloat(v.toFixed(2)).toString();
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function MultiLineBarComboChart({
  chartGroups,
  leftAxisLabel,
  rightAxisLabel,
  height = 300,
  className,
  title,
  subtitle,
}: MultiLineBarComboChartProps) {
  const groupNames = useMemo(() => chartGroups.map((g) => g.group), [chartGroups]);
  const [activeGroupName, setActiveGroupName] = useState<string>(groupNames[0] ?? "");
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const activeGroup = useMemo(
    () => chartGroups.find((g) => g.group === activeGroupName) ?? chartGroups[0],
    [chartGroups, activeGroupName]
  );

  const chartData = useMemo(() => mergeGroupData(activeGroup), [activeGroup]);

  function toggleKey(key: string) {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const hasLines = activeGroup.lineSeries.length > 0;
  // Derive axis labels: explicit prop/group field > first series name fallback
  const resolvedLeftLabel =
    activeGroup.leftAxisLabel ?? leftAxisLabel ?? activeGroup.barSeries[0]?.name;
  const resolvedRightLabel =
    activeGroup.rightAxisLabel ?? rightAxisLabel ?? (hasLines ? activeGroup.lineSeries[0]?.name : undefined);

  const groupToggles = groupNames.length > 1 ? (
    <div className="flex items-center gap-2">
      {groupNames.map((g) => (
        <GroupButton key={g} label={g} active={g === activeGroupName} onClick={() => setActiveGroupName(g)} />
      ))}
    </div>
  ) : null;

  const inner = (
    <div style={{ width: "100%" }}>
      {/* Group toggles — standalone top-right (no card header) */}
      {!title && groupToggles && (
        <div className="flex items-center justify-end gap-2 mb-3">
          {groupToggles}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />

          <XAxis
            dataKey="x"
            tick={{ fontSize: 11, fill: "#888888" }}
            axisLine={false}
            tickLine={false}
          />

          {/* Left Y-axis — bars */}
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 11, fill: "#888888" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtTick}
            width={resolvedLeftLabel ? 60 : 40}
            domain={([dataMin, dataMax]: [number, number]) => {
              const padding = (dataMax - dataMin) * 0.1 || Math.abs(dataMin) * 0.1 || 1;
              return [dataMin - padding, dataMax + padding];
            }}
            label={
              resolvedLeftLabel
                ? { value: resolvedLeftLabel, angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fill: "#888888", textAnchor: "middle" } }
                : undefined
            }
          />

          {/* Right Y-axis — lines */}
          {hasLines && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#888888" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtTick}
              width={resolvedRightLabel ? 60 : 40}
              domain={([dataMin, dataMax]: [number, number]) => {
                const padding = (dataMax - dataMin) * 0.1 || Math.abs(dataMin) * 0.1 || 1;
                return [dataMin - padding, dataMax + padding];
              }}
              label={
                resolvedRightLabel
                  ? { value: resolvedRightLabel, angle: 90, position: "insideRight", offset: -10, style: { fontSize: 11, fill: "#888888", textAnchor: "middle" } }
                  : undefined
              }
            />
          )}

          <Tooltip
            contentStyle={{
              fontSize: 12,
              border: "1px solid #E2E2E2",
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ fontWeight: 600, color: "#0F172B", marginBottom: 4 }}
            itemStyle={{ color: "#888888" }}
          />

          {activeGroup.barSeries.map((s, i) => (
            <Bar
              key={s.dataKey}
              yAxisId="left"
              dataKey={s.dataKey}
              name={s.name}
              fill={BAR_COLORS[i % BAR_COLORS.length]}
              hide={hiddenKeys.has(s.dataKey)}
              radius={[2, 2, 0, 0]}
              maxBarSize={24}
            />
          ))}

          {activeGroup.lineSeries.map((s, i) => (
            <Line
              key={s.dataKey}
              yAxisId="right"
              dataKey={s.dataKey}
              name={s.name}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              hide={hiddenKeys.has(s.dataKey)}
              type="monotone"
              connectNulls
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center flex-wrap gap-4 mt-4">
        {activeGroup.barSeries.map((s, i) => (
          <LegendItem
            key={s.dataKey}
            color={BAR_COLORS[i % BAR_COLORS.length]}
            name={s.name}
            visible={!hiddenKeys.has(s.dataKey)}
            isBar
            onToggle={() => toggleKey(s.dataKey)}
          />
        ))}
        {activeGroup.lineSeries.map((s, i) => (
          <LegendItem
            key={s.dataKey}
            color={LINE_COLORS[i % LINE_COLORS.length]}
            name={s.name}
            visible={!hiddenKeys.has(s.dataKey)}
            isBar={false}
            onToggle={() => toggleKey(s.dataKey)}
          />
        ))}
      </div>
    </div>
  );

  if (title) {
    return (
      <div className={className} style={{ borderRadius: 10, border: "1px solid #E2E2E2", background: "#F5F5F5", padding: 8 }}>
        {/* Card header */}
        <div className="flex items-center justify-between" style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}>
          <div>
            <h5>{title}</h5>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {groupToggles}
        </div>
        {/* Content box */}
        <div style={{ borderRadius: 10, border: "1px solid rgba(226,226,226,0.10)", background: "#FFF", padding: 16 }}>
          {inner}
        </div>
      </div>
    );
  }

  return <div className={className}>{inner}</div>;
}
