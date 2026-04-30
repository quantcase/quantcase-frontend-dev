"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { TabularCard } from "@/components/molecules/tabular-card";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { IIIndustryRanking, IIIndustry, QLevel, Direction } from "@/types/industry-intelligence";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "Composite rank" | "Momentum" | "Breadth" | "Revisions";
type FilterKey = "All" | "Top quartile" | "Upper mid" | "Lower mid" | "Bottom";

// ── Chart colors — data-viz palette, 12 distinct hues ────────────────────────

const CHART_COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#06B6D4", "#F97316", "#EC4899",
  "#14B8A6", "#84CC16", "#3B82F6", "#A855F7",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function qStyle(q: QLevel) {
  switch (q) {
    case "Q1": return { background: "var(--qc-up-soft)",   color: "var(--qc-up)",   borderColor: "var(--qc-up)" };
    case "Q2": return { background: "var(--qc-warn-soft)", color: "var(--qc-warn)", borderColor: "var(--qc-warn)" };
    case "Q3": return { background: "var(--qc-warn-soft)", color: "var(--qc-warn)", borderColor: "var(--qc-warn)" };
    case "Q4": return { background: "var(--qc-down-soft)", color: "var(--qc-down)", borderColor: "var(--qc-down)" };
  }
}

function wowColor(v: string) {
  if (v.startsWith("+")) return "var(--qc-up)";
  if (v.startsWith("−") || v.startsWith("-")) return "var(--qc-down)";
  return "var(--qc-text-muted)";
}

function sortIndustries(industries: IIIndustry[], key: SortKey) {
  return [...industries].sort((a, b) => {
    switch (key) {
      case "Composite rank": return a.rank - b.rank;
      case "Momentum":       return b.momentum - a.momentum;
      case "Breadth":        return b.breadth_pct - a.breadth_pct;
      case "Revisions":      return b.revisions - a.revisions;
    }
  });
}

function filterRanks(filter: FilterKey): Set<number> {
  if (filter === "All")          return new Set(Array.from({ length: 24 }, (_, i) => i + 1));
  if (filter === "Top quartile") return new Set([1, 2, 3, 4, 5, 6]);
  if (filter === "Upper mid")    return new Set([7, 8, 9, 10, 11, 12]);
  if (filter === "Lower mid")    return new Set([13, 14, 15, 16, 17, 18]);
  return new Set([19, 20, 21, 22, 23, 24]);
}

// ── Small atoms ───────────────────────────────────────────────────────────────

function QBadge({ q }: { q: QLevel }) {
  return <Badge variant="outline" style={qStyle(q)}>{q}</Badge>;
}

function ScoreBar({ score, q }: { score: number; q: QLevel }) {
  const color = q === "Q1" || q === "Q2" ? "var(--qc-blue)" : "var(--qc-down)";
  return (
    <div className="flex items-center gap-2">
      <div className="relative rounded-full overflow-hidden shrink-0" style={{ width: 80, height: 3, background: "var(--qc-border-default)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--qc-text-heading)" }}>{score}</span>
    </div>
  );
}

function SentIcon({ dir }: { dir: Direction }) {
  if (dir === "up"   || dir === "positive") return <TrendingUp   className="h-3 w-3 shrink-0" style={{ color: "var(--qc-up)" }} />;
  if (dir === "down" || dir === "negative") return <TrendingDown className="h-3 w-3 shrink-0" style={{ color: "var(--qc-down)" }} />;
  return <Minus className="h-3 w-3 shrink-0" style={{ color: "var(--qc-warn)" }} />;
}

const TH = "text-[10px] font-semibold uppercase tracking-wider px-3 py-2.5 whitespace-nowrap";

// ── Table view ────────────────────────────────────────────────────────────────

function TableView({ sort, industries }: { sort: SortKey; industries: IIIndustry[] }) {
  const rows = useMemo(() => sortIndustries(industries, sort), [sort, industries]);

  return (
    <Table>
      <TableHeader>
        <TableRow style={{ borderColor: "var(--qc-border-inner)" }}>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 32 }}>#</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)" }}>Industry</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)" }}>Score</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 56 }}>WoW</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 52 }}>Mom</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 72 }}>Breadth</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 72 }}>Revisions</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 52 }}>Val</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 48 }}>Q</TableHead>
          <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 120 }}>News</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.rank} style={{ borderColor: "var(--qc-border-inner)" }}>
            <TableCell className="px-3 py-2.5">
              <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-text-muted)" }}>{row.rank}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[13px] font-medium" style={{ color: "var(--qc-text-heading)" }}>{row.name}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <ScoreBar score={row.composite_score} q={row.quartile} />
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] font-medium tabular-nums" style={{ color: wowColor(row.wow) }}>{row.wow}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.momentum}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.breadth_pct}%</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.revisions}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.valuation}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5"><QBadge q={row.quartile} /></TableCell>
            <TableCell className="px-3 py-2.5">
              {row.news_tag && row.news_direction ? (
                <span className="flex items-center gap-1 text-[12px] font-medium" style={{
                  color: row.news_direction === "up" ? "var(--qc-up)" : row.news_direction === "neutral" ? "var(--qc-warn)" : "var(--qc-down)",
                }}>
                  <SentIcon dir={row.news_direction} />
                  {row.news_tag}
                </span>
              ) : (
                <span style={{ color: "var(--qc-text-muted)" }}>—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Chart view ────────────────────────────────────────────────────────────────

const QUARTILE_FILTERS: FilterKey[] = ["All", "Top quartile", "Upper mid", "Lower mid", "Bottom"];
const Y_TICKS = [1, 6, 12, 18, 24];

function yTickLabel(v: number) {
  if (v === 1)  return "#1";
  if (v === 6)  return "#6";
  if (v === 12) return "Mid";
  if (v === 18) return "#18";
  if (v === 24) return "#24";
  return String(v);
}

function YAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) {
  if (!payload) return null;
  return (
    <text x={(x ?? 0) - 8} y={(y ?? 0) + 4} textAnchor="end" fontSize={11} fill="var(--qc-text-muted)">
      {yTickLabel(payload.value)}
    </text>
  );
}

function ChartView({
  industries,
  chartData,
  asOfDate,
}: {
  industries: IIIndustry[];
  chartData: Record<string, string | number>[];
  asOfDate: string;
}) {
  const [filter, setFilter] = useState<FilterKey>("All");
  const activeRanks = filterRanks(filter);

  return (
    <div>
      <div className="px-4 pt-1 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>
          All {industries.length} Industries · {asOfDate}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={520}>
        <LineChart data={chartData} margin={{ top: 4, right: 32, bottom: 8, left: 52 }}>
          <CartesianGrid strokeDasharray="3 4" stroke="var(--qc-border-default)" strokeOpacity={0.7} vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "var(--qc-text-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--qc-border-default)", strokeOpacity: 0.6 }}
            interval={0}
          />
          <YAxis
            reversed
            domain={[1, 24]}
            ticks={Y_TICKS}
            tick={<YAxisTick />}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Rank (lower = better)",
              angle: -90,
              position: "insideLeft",
              offset: -36,
              style: { fontSize: 10, fill: "var(--qc-text-muted)", textAnchor: "middle" },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--qc-surface-card)",
              border: "1px solid var(--qc-border-default)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--qc-text-heading)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              maxHeight: 260,
              overflowY: "auto",
            }}
            formatter={(value: number, name: string) => [`#${value}`, name]}
            labelStyle={{ color: "var(--qc-text-muted)", fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ padding: "1px 0" }}
          />
          <ReferenceLine y={6.5}  stroke="var(--qc-border-default)" strokeDasharray="5 4" strokeOpacity={0.9} />
          <ReferenceLine y={12.5} stroke="var(--qc-border-default)" strokeDasharray="5 4" strokeOpacity={0.9} />
          <ReferenceLine y={18.5} stroke="var(--qc-border-default)" strokeDasharray="5 4" strokeOpacity={0.9} />

          {industries.map((ind, i) => {
            const active = activeRanks.has(ind.rank);
            return (
              <Line
                key={ind.name}
                type="monotone"
                dataKey={ind.name}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={active ? 2 : 0.75}
                opacity={active ? 1 : 0.1}
                dot={false}
                activeDot={active ? { r: 4, strokeWidth: 0 } : false}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-2 px-4 pb-5 pt-3">
        {QUARTILE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-full transition-colors"
            style={
              filter === f
                ? { background: "var(--qc-text-heading)", color: "#ffffff" }
                : { background: "transparent", color: "var(--qc-text-muted)", border: "1px solid var(--qc-border-default)" }
            }
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Industry Ranking Tab ──────────────────────────────────────────────────────

export function IndustryRankingTab({ data }: { data: IIIndustryRanking }) {
  const [sort, setSort] = useState<SortKey>("Composite rank");
  const [view, setView] = useState<"Table" | "Chart">("Table");

  // Build Recharts data from rank_history arrays in each industry
  const chartData = useMemo(() => {
    const weekLabels = data.industries[0]?.rank_history.map((h) => h.week) ?? [];
    return weekLabels.map((week, wi) => {
      const row: Record<string, string | number> = { week };
      data.industries.forEach((ind) => {
        row[ind.name] = ind.rank_history[wi]?.rank ?? ind.rank;
      });
      return row;
    });
  }, [data.industries]);

  return (
    <div className="px-6 py-5">
      <TabularCard
        title="Industry Ranking"
        titleCase
        headerAction={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px]" style={{ color: "var(--qc-text-muted)" }}>Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-[8px] px-3 py-1.5 text-[12px] font-medium outline-none cursor-pointer pr-7"
                style={{
                  border: "1px solid var(--qc-border-default)",
                  background: "var(--qc-surface-base)",
                  color: "var(--qc-text-body)",
                }}
              >
                <option>Composite rank</option>
                <option>Momentum</option>
                <option>Breadth</option>
                <option>Revisions</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px]" style={{ color: "var(--qc-text-muted)" }}>View:</span>
              <TabToggle
                options={["Table", "Chart"]}
                value={view}
                onChange={(v) => setView(v as "Table" | "Chart")}
                variant="outline"
              />
            </div>
          </div>
        }
      >
        <div className="px-1 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>
            All {data.total_industries} Industries · {data.as_of_date}
          </span>
        </div>

        {view === "Table"
          ? <TableView sort={sort} industries={data.industries} />
          : <ChartView industries={data.industries} chartData={chartData} asOfDate={data.as_of_date} />
        }
      </TabularCard>
    </div>
  );
}
