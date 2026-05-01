"use client";

import { MetricTile } from "@/components/molecules/metric-tile";
import { TabularCard } from "@/components/molecules/tabular-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table";
import type { IIDashboard, QLevel } from "@/types/industry-intelligence";

// ── Null safety helpers ───────────────────────────────────────────────────────

const NULL_STR = "NULL(STATIC)";
const NULL_NUM = 0;

const safeStr = (v?: string | null) => v ?? NULL_STR;
const safeNum = (v?: number | null) => v ?? NULL_NUM;

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
  if (v?.startsWith("+")) return "var(--qc-up)";
  if (v?.startsWith("−") || v?.startsWith("-")) return "var(--qc-down)";
  return "var(--qc-text-muted)";
}

// ── Small atoms ───────────────────────────────────────────────────────────────

function QBadge({ q }: { q: QLevel }) {
  return <Badge variant="outline" style={qStyle(q ?? "Q2")}>{q ?? "Q2"}</Badge>;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative rounded-full overflow-hidden shrink-0"
        style={{ width: 80, height: 3, background: "var(--qc-border-default)" }}
      >
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${safeNum(score)}%`, background: color }} />
      </div>
      <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--qc-text-heading)" }}>
        {safeNum(score)}
      </span>
    </div>
  );
}

function WoW({ v }: { v: string }) {
  const val = safeStr(v);
  return <span className="text-[12px] font-medium tabular-nums" style={{ color: wowColor(val) }}>{val}</span>;
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────

export function DashboardTab({ data }: { data: IIDashboard }) {
  const {
    summary_tiles: tiles,
    top_5_industries,
    bottom_3_industries,
    portfolio_holdings,
    rotation_signals,
    top_news
  } = data;

  return (
    <div className="px-6 py-5 space-y-5">

      {/* Metric tiles */}
      <div className="grid grid-cols-4 gap-4">
        <MetricTile
          label="Market Regime"
          value={safeStr(tiles?.market_regime?.value)}
          change={safeStr(tiles?.market_regime?.change)}
          sublabel={safeStr(tiles?.market_regime?.since_label)}
        />

        <MetricTile
          label="Top Cluster"
          value={safeStr(tiles?.top_cluster?.name)}
          sublabel={`Score ${safeNum(tiles?.top_cluster?.score)} · ${safeStr(tiles?.top_cluster?.quartile)} · #${safeNum(tiles?.top_cluster?.rank)}`}
        />

        <MetricTile
          label="Biggest Mover"
          value={safeStr(tiles?.biggest_mover?.name)}
          change={safeStr(tiles?.biggest_mover?.label)}
        />

        <MetricTile
          label="News This Week"
          value={String(safeNum(tiles?.news_this_week?.count))}
          sublabel={`${safeNum(tiles?.news_this_week?.clusters_affected)} clusters affected`}
        />
      </div>

      {/* Body */}
      <div className="flex gap-5 items-start">

        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Top industries */}
          <TabularCard title="Top 5 Industries" titleCase>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>WoW</TableHead>
                  <TableHead>Q</TableHead>
                  <TableHead>News</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top_5_industries?.map((row) => (
                  <TableRow key={row?.rank}>
                    <TableCell>{safeNum(row?.rank)}</TableCell>
                    <TableCell>{safeStr(row?.name)}</TableCell>
                    <TableCell><ScoreBar score={safeNum(row?.composite_score)} color="var(--qc-blue)" /></TableCell>
                    <TableCell><WoW v={row?.wow} /></TableCell>
                    <TableCell><QBadge q={row?.quartile ?? "Q2"} /></TableCell>
                    <TableCell>{safeStr(row?.news_tag)}</TableCell>
                  </TableRow>
                )) ?? null}
              </TableBody>
            </Table>
          </TabularCard>

          {/* Portfolio */}
          <TabularCard title="Portfolio Overlay — Your Holdings" titleCase>
            <Table>
              <TableBody>
                {portfolio_holdings?.map((h) => (
                  <TableRow key={h?.ticker}>
                    <TableCell>{safeStr(h?.ticker)}</TableCell>
                    <TableCell>{safeStr(h?.cluster)}</TableCell>
                    <TableCell>{safeStr(h?.cluster_rank)}</TableCell>
                    <TableCell><QBadge q={h?.quartile ?? "Q2"} /></TableCell>
                    <TableCell><WoW v={h?.wow} /></TableCell>
                  </TableRow>
                )) ?? null}
              </TableBody>
            </Table>
          </TabularCard>

          {/* Bottom */}
          <TabularCard title="Bottom 3 Industries" titleCase>
            <Table>
              <TableBody>
                {bottom_3_industries?.map((row) => (
                  <TableRow key={row?.rank}>
                    <TableCell>{safeNum(row?.rank)}</TableCell>
                    <TableCell>{safeStr(row?.name)}</TableCell>
                    <TableCell><ScoreBar score={safeNum(row?.composite_score)} color="var(--qc-down)" /></TableCell>
                    <TableCell><WoW v={row?.wow} /></TableCell>
                    <TableCell><QBadge q={row?.quartile ?? "Q2"} /></TableCell>
                    <TableCell>{safeStr(row?.signal)}</TableCell>
                  </TableRow>
                )) ?? null}
              </TableBody>
            </Table>
          </TabularCard>

        </div>

        {/* RIGHT */}
        <div style={{ width: 340 }}>

          <TabularCard title="Rotation Signals & Alerts" titleCase>
            {rotation_signals?.map((sig, i) => {
              return (
                <Card key={i}>
                  <CardContent>
                    <p>{safeStr(sig?.type)}</p>
                    <p>{safeStr(sig?.industry_name)}</p>
                    <p>{safeStr(sig?.detail)}</p>
                  </CardContent>
                </Card>
              );
            }) ?? null}
          </TabularCard>

          <TabularCard title="Top News This Week" titleCase>
            {top_news?.map((item, i) => (
              <Card key={i}>
                <CardContent>
                  <p>{safeStr(item?.category)}</p>
                  <p>{safeStr(item?.sentiment)}</p>
                  <p>{safeStr(item?.headline)}</p>
                </CardContent>
              </Card>
            )) ?? null}
          </TabularCard>

        </div>
      </div>
    </div>
  );
}