"use client";

import { MetricTile } from "@/components/molecules/metric-tile";
import { TabularCard } from "@/components/molecules/tabular-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table";
import type { IIDashboard, QLevel, IITopNewsItem, IIDashboardRotationSignal } from "@/types/industry-intelligence";

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

// ── Rotation signal card ──────────────────────────────────────────────────────

function RotationSignalCard({ sig }: { sig: IIDashboardRotationSignal }) {
  const dir = sig.direction;
  const bg    = dir === "up"   ? "var(--qc-up-soft)"   : dir === "down" ? "var(--qc-down-soft)"   : "var(--qc-warn-soft)";
  const color = dir === "up"   ? "var(--qc-up)"         : dir === "down" ? "var(--qc-down)"         : "var(--qc-warn)";
  const border = color;
  const Icon  = dir === "up"   ? TrendingUp             : dir === "down" ? TrendingDown             : Minus;
  return (
    <Card className="rounded-[10px] shadow-none px-4 py-3 flex flex-col gap-1.5 mb-2" style={{ background: bg, borderColor: border }}>
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest" style={{ color }}>
        <Icon className="h-3 w-3" />{sig.type}
      </span>
      <p className="text-[14px] font-semibold" style={{ color }}>{sig.industry_name}</p>
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{sig.detail}</p>
    </Card>
  );
}

// ── News item card ────────────────────────────────────────────────────────────

function NewsItemCard({ item }: { item: IITopNewsItem }) {
  const catBg =
    item.category_style === "blue"   ? "var(--qc-blue)"           :
    item.category_style === "warn"   ? "var(--qc-warn)"           :
    "var(--qc-accent-primary)";
  const sentDir = item.sentiment_direction;
  const sentColor =
    sentDir === "up" || sentDir === "positive" ? "var(--qc-up)"   :
    sentDir === "down" || sentDir === "negative" ? "var(--qc-down)" :
    "var(--qc-warn)";
  const SentIcon = sentDir === "up" || sentDir === "positive" ? TrendingUp : sentDir === "down" || sentDir === "negative" ? TrendingDown : Minus;

  return (
    <Card className="rounded-[10px] shadow-none px-4 py-3 flex flex-col gap-2 mb-2" style={{ borderColor: "var(--qc-border-default)" }}>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="text-[9px] font-bold tracking-widest px-2 py-0.5" style={{ background: catBg, color: "#fff", borderColor: "transparent" }}>
          {item.category}
        </Badge>
        {item.extra_badge && (
          <Badge variant="outline" className="text-[9px] px-2 py-0.5">{item.extra_badge}</Badge>
        )}
      </div>
      <p className="text-[13px] font-medium leading-snug" style={{ color: "var(--qc-text-heading)" }}>{item.headline}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: sentColor }}>
          <SentIcon className="h-3 w-3" />{item.sentiment}
        </span>
        <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{item.source}</span>
      </div>
      {item.industry_tags?.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.industry_tags.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0.5">{t}</Badge>
          ))}
        </div>
      )}
    </Card>
  );
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
            <div className="p-1">
              {rotation_signals?.length
                ? rotation_signals.map((sig, i) => <RotationSignalCard key={i} sig={sig} />)
                : <p className="text-[12px] py-2" style={{ color: "var(--qc-text-muted)" }}>No signals this week.</p>}
            </div>
          </TabularCard>

          <TabularCard title="Top News This Week" titleCase>
            <div className="p-1">
              {top_news?.length
                ? top_news.map((item, i) => <NewsItemCard key={i} item={item} />)
                : null}
            </div>
          </TabularCard>

        </div>
      </div>
    </div>
  );
}