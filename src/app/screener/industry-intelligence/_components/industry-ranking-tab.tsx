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

// ── Types ─────────────────────────────────────────────────────────────────────

type QLevel = "Q1" | "Q2" | "Q3" | "Q4";
type Direction = "up" | "down" | "neutral";
type SortKey = "Composite rank" | "Momentum" | "Breadth" | "Revisions";
type FilterKey = "All" | "Top quartile" | "Upper mid" | "Lower mid" | "Bottom";

// ── Chart line colors — data-viz palette, 12 distinct hues ───────────────────

const CHART_COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#06B6D4", "#F97316", "#EC4899",
  "#14B8A6", "#84CC16", "#3B82F6", "#A855F7",
];

// ── Deterministic rank-history generator (seeded per industry) ────────────────

function genHistory(currentRank: number, seed: number): number[] {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s / 0x7fffffff) * 2 - 1; // [-1, 1]
  };

  const weeks = 11;
  const history: number[] = [];

  // work backwards from now, build reversed, then flip
  let r = currentRank;
  history.push(r); // "Now"

  for (let i = 0; i < weeks; i++) {
    r = Math.round(r + rand() * 2.5);
    r = Math.max(1, Math.min(24, r));
    history.push(r);
  }

  return history.reverse(); // oldest first
}

const WEEK_LABELS = ["W-11","W-10","W-9","W-8","W-7","W-6","W-5","W-4","W-3","W-2","W-1","Now"];

// ── 24 Industry static data ───────────────────────────────────────────────────

const ALL_INDUSTRIES = [
  { rank: 1,  name: "Info Technology",   score: 88, wow: "+2",  mom: 91, breadth: 84, revisions: 78, val: 62, q: "Q1" as QLevel, newsTag: "Demand",  newsDir: "up"      as Direction },
  { rank: 2,  name: "Energy",            score: 83, wow: "+5",  mom: 79, breadth: 72, revisions: 81, val: 71, q: "Q1" as QLevel, newsTag: "Macro",   newsDir: "up"      as Direction },
  { rank: 3,  name: "Financials",        score: 79, wow: "—",   mom: 74, breadth: 71, revisions: 69, val: 77, q: "Q1" as QLevel, newsTag: "Macro",   newsDir: "neutral" as Direction },
  { rank: 4,  name: "Industrials",       score: 76, wow: "+7",  mom: 82, breadth: 68, revisions: 74, val: 58, q: "Q1" as QLevel, newsTag: "Policy",  newsDir: "up"      as Direction },
  { rank: 5,  name: "Materials",         score: 72, wow: "+3",  mom: 68, breadth: 65, revisions: 62, val: 64, q: "Q2" as QLevel, newsTag: null,      newsDir: null },
  { rank: 6,  name: "Healthcare",        score: 68, wow: "+1",  mom: 61, breadth: 63, revisions: 71, val: 59, q: "Q2" as QLevel, newsTag: "Macro",   newsDir: "up"      as Direction },
  { rank: 7,  name: "Consumer Disc.",    score: 64, wow: "-1",  mom: 58, breadth: 59, revisions: 55, val: 61, q: "Q2" as QLevel, newsTag: "Raw",     newsDir: "down"    as Direction },
  { rank: 8,  name: "Capital Goods",     score: 61, wow: "+2",  mom: 63, breadth: 56, revisions: 58, val: 55, q: "Q2" as QLevel, newsTag: "Policy",  newsDir: "up"      as Direction },
  { rank: 9,  name: "Chemicals",         score: 57, wow: "-2",  mom: 52, breadth: 54, revisions: 49, val: 62, q: "Q2" as QLevel, newsTag: "Geo",     newsDir: "down"    as Direction },
  { rank: 10, name: "Pharma",            score: 54, wow: "+1",  mom: 48, breadth: 51, revisions: 61, val: 50, q: "Q2" as QLevel, newsTag: null,      newsDir: null },
  { rank: 11, name: "Auto",              score: 51, wow: "-3",  mom: 49, breadth: 48, revisions: 44, val: 58, q: "Q3" as QLevel, newsTag: "Demand",  newsDir: "up"      as Direction },
  { rank: 12, name: "FMCG",             score: 47, wow: "—",   mom: 41, breadth: 46, revisions: 42, val: 55, q: "Q3" as QLevel, newsTag: null,      newsDir: null },
  { rank: 13, name: "Telecom",           score: 44, wow: "-2",  mom: 38, breadth: 44, revisions: 39, val: 49, q: "Q3" as QLevel, newsTag: null,      newsDir: null },
  { rank: 14, name: "Power",             score: 41, wow: "+1",  mom: 44, breadth: 38, revisions: 36, val: 47, q: "Q3" as QLevel, newsTag: null,      newsDir: null },
  { rank: 15, name: "Cement",            score: 38, wow: "-1",  mom: 36, breadth: 37, revisions: 33, val: 44, q: "Q3" as QLevel, newsTag: null,      newsDir: null },
  { rank: 16, name: "Metals",            score: 35, wow: "-4",  mom: 31, breadth: 34, revisions: 28, val: 42, q: "Q3" as QLevel, newsTag: "Raw",     newsDir: "down"    as Direction },
  { rank: 17, name: "Infrastructure",    score: 32, wow: "+2",  mom: 34, breadth: 30, revisions: 29, val: 38, q: "Q4" as QLevel, newsTag: null,      newsDir: null },
  { rank: 18, name: "Logistics",         score: 29, wow: "-1",  mom: 27, breadth: 28, revisions: 24, val: 35, q: "Q4" as QLevel, newsTag: "Geo",     newsDir: "down"    as Direction },
  { rank: 19, name: "Media",             score: 26, wow: "-2",  mom: 22, breadth: 25, revisions: 21, val: 31, q: "Q4" as QLevel, newsTag: null,      newsDir: null },
  { rank: 20, name: "Insurance",         score: 23, wow: "+1",  mom: 24, breadth: 22, revisions: 20, val: 28, q: "Q4" as QLevel, newsTag: null,      newsDir: null },
  { rank: 21, name: "Utilities",         score: 21, wow: "—",   mom: 18, breadth: 28, revisions: 16, val: 26, q: "Q4" as QLevel, newsTag: null,      newsDir: null },
  { rank: 22, name: "Real Estate",       score: 24, wow: "-4",  mom: 19, breadth: 21, revisions: 14, val: 23, q: "Q4" as QLevel, newsTag: "Macro",   newsDir: "down"    as Direction },
  { rank: 23, name: "Comm. Services",    score: 19, wow: "-2",  mom: 16, breadth: 18, revisions: 12, val: 22, q: "Q4" as QLevel, newsTag: null,      newsDir: null },
  { rank: 24, name: "Consumer Staples",  score: 14, wow: "—",   mom: 12, breadth: 16, revisions: 9,  val: 18, q: "Q4" as QLevel, newsTag: null,      newsDir: null },
];

// Pre-compute rank histories (deterministic)
const RANK_HISTORIES = ALL_INDUSTRIES.map((ind) => genHistory(ind.rank, ind.rank * 31));

// Build Recharts data array: [{ week, "Info Technology": rank, "Energy": rank, ... }]
const CHART_DATA = WEEK_LABELS.map((week, wi) => {
  const row: Record<string, string | number> = { week };
  ALL_INDUSTRIES.forEach((ind, ii) => {
    row[ind.name] = RANK_HISTORIES[ii][wi];
  });
  return row;
});

// ── Helper functions ──────────────────────────────────────────────────────────

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

function sortIndustries(industries: typeof ALL_INDUSTRIES, key: SortKey) {
  return [...industries].sort((a, b) => {
    switch (key) {
      case "Composite rank": return a.rank - b.rank;
      case "Momentum":       return b.mom - a.mom;
      case "Breadth":        return b.breadth - a.breadth;
      case "Revisions":      return b.revisions - a.revisions;
    }
  });
}

function filterRanks(filter: FilterKey): Set<number> {
  if (filter === "All")          return new Set(ALL_INDUSTRIES.map((i) => i.rank));
  if (filter === "Top quartile") return new Set([1,2,3,4,5,6]);
  if (filter === "Upper mid")    return new Set([7,8,9,10,11,12]);
  if (filter === "Lower mid")    return new Set([13,14,15,16,17,18]);
  return new Set([19,20,21,22,23,24]); // Bottom
}

// ── QBadge ────────────────────────────────────────────────────────────────────

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
  if (dir === "up")   return <TrendingUp   className="h-3 w-3 shrink-0" style={{ color: "var(--qc-up)" }} />;
  if (dir === "down") return <TrendingDown className="h-3 w-3 shrink-0" style={{ color: "var(--qc-down)" }} />;
  return <Minus className="h-3 w-3 shrink-0" style={{ color: "var(--qc-warn)" }} />;
}

// ── Table view ────────────────────────────────────────────────────────────────

const TH = "text-[10px] font-semibold uppercase tracking-wider px-3 py-2.5 whitespace-nowrap";

function TableView({ sort }: { sort: SortKey }) {
  const rows = useMemo(() => sortIndustries(ALL_INDUSTRIES, sort), [sort]);

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
              <ScoreBar score={row.score} q={row.q} />
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] font-medium tabular-nums" style={{ color: wowColor(row.wow) }}>{row.wow}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.mom}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.breadth}%</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.revisions}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{row.val}</span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <QBadge q={row.q} />
            </TableCell>
            <TableCell className="px-3 py-2.5">
              {row.newsTag && row.newsDir ? (
                <span className="flex items-center gap-1 text-[12px] font-medium" style={{
                  color: row.newsDir === "up" ? "var(--qc-up)" : row.newsDir === "neutral" ? "var(--qc-warn)" : "var(--qc-down)",
                }}>
                  <SentIcon dir={row.newsDir} />
                  {row.newsTag}
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

// Custom Y-axis tick — right-aligned text
function YAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) {
  if (!payload) return null;
  return (
    <text x={(x ?? 0) - 8} y={(y ?? 0) + 4} textAnchor="end" fontSize={11} fill="var(--qc-text-muted)">
      {yTickLabel(payload.value)}
    </text>
  );
}

function ChartView() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const activeRanks = filterRanks(filter);

  return (
    <div>
      {/* Chart header */}
      <div className="px-4 pt-1 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>
          All 24 Industries · 11 Apr 2025
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={520}>
        <LineChart data={CHART_DATA} margin={{ top: 4, right: 32, bottom: 8, left: 52 }}>
          <CartesianGrid
            strokeDasharray="3 4"
            stroke="var(--qc-border-default)"
            strokeOpacity={0.7}
            vertical={false}
          />
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
          {/* Quartile boundary reference lines */}
          <ReferenceLine y={6.5}  stroke="var(--qc-border-default)" strokeDasharray="5 4" strokeOpacity={0.9} />
          <ReferenceLine y={12.5} stroke="var(--qc-border-default)" strokeDasharray="5 4" strokeOpacity={0.9} />
          <ReferenceLine y={18.5} stroke="var(--qc-border-default)" strokeDasharray="5 4" strokeOpacity={0.9} />

          {ALL_INDUSTRIES.map((ind, i) => {
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

      {/* Quartile filter pills */}
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

export function IndustryRankingTab() {
  const [sort, setSort]   = useState<SortKey>("Composite rank");
  const [view, setView]   = useState<"Table" | "Chart">("Table");

  return (
    <div className="px-6 py-5">
      <TabularCard
        title="Industry Ranking"
        titleCase
        headerAction={
          <div className="flex items-center gap-3">
            {/* Sort */}
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

            {/* View toggle */}
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
        {/* Date label */}
        <div className="px-1 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>
            All 24 Industries · 11 Apr 2025
          </span>
        </div>

        {view === "Table" ? <TableView sort={sort} /> : <ChartView />}
      </TabularCard>
    </div>
  );
}
