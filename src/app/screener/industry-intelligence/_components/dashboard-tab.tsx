"use client";

import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MetricTile } from "@/components/molecules/metric-tile";
import { TabularCard } from "@/components/molecules/tabular-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// ── Types ─────────────────────────────────────────────────────────────────────

type QLevel = "Q1" | "Q2" | "Q3" | "Q4";
type Direction = "up" | "down" | "neutral";

// ── Static mock data ──────────────────────────────────────────────────────────

const TOP5 = [
  { rank: 1, name: "Info Technology", score: 88, wow: "+2", q: "Q1" as QLevel, newsTag: "Demand", newsDir: "up"      as Direction },
  { rank: 2, name: "Energy",          score: 83, wow: "+5", q: "Q1" as QLevel, newsTag: "Macro",  newsDir: "up"      as Direction },
  { rank: 3, name: "Financials",      score: 79, wow: "—",  q: "Q1" as QLevel, newsTag: "Macro",  newsDir: "neutral" as Direction },
  { rank: 4, name: "Industrials",     score: 76, wow: "+7", q: "Q1" as QLevel, newsTag: "Policy", newsDir: "up"      as Direction },
  { rank: 5, name: "Materials",       score: 72, wow: "+3", q: "Q2" as QLevel, newsTag: null,     newsDir: null },
];

const BOTTOM3 = [
  { rank: 22, name: "Real Estate",      score: 24, wow: "−4", q: "Q4" as QLevel, signal: "Rotation exit" },
  { rank: 23, name: "Comm. Services",   score: 19, wow: "−2", q: "Q4" as QLevel, signal: null },
  { rank: 24, name: "Consumer Staples", score: 14, wow: "—",  q: "Q4" as QLevel, signal: null },
];

const HOLDINGS = [
  { ticker: "TCS",       cluster: "IT Services",     rank: "#1",  q: "Q1" as QLevel, wow: "+2" },
  { ticker: "HDFCBANK",  cluster: "Bank - Private",  rank: "#3",  q: "Q1" as QLevel, wow: "—"  },
  { ticker: "RELIANCE",  cluster: "Oil & Gas - R&M", rank: "#2",  q: "Q1" as QLevel, wow: "+5" },
  { ticker: "DLF",       cluster: "Real Estate",     rank: "#22", q: "Q4" as QLevel, wow: "−4" },
  { ticker: "TATASTEEL", cluster: "Steel",           rank: "#16", q: "Q3" as QLevel, wow: "−4" },
];

const ROTATION_SIGNALS = [
  { type: "ROTATION ENTRY", name: "IT",          detail: "Rank +7 in 3w · Breadth 68% · Revisions +12", dir: "up"   as const },
  { type: "ROTATION ENTRY", name: "Energy",      detail: "Rank +5 in 4w · Commodity tailwinds",         dir: "up"   as const },
  { type: "ROTATION EXIT",  name: "Real Estate", detail: "Rank −4 · Breadth 21% · Revisions −8",        dir: "down" as const },
  { type: "TRAP ALERT",     name: "Utilities",   detail: "Price +6% but breadth only 28%",              dir: "warn" as const },
];

const NEWS = [
  {
    category: "POLICY",
    catDir: "blue"   as const,
    extra: null       as string | null,
    sentiment: "Positive",
    sentDir: "up"    as Direction,
    source: "PIB",
    tags: ["Aerospace & Defense", "Capital Goods"],
    body: "Ministry of Defence confirms 18% YoY capex increase. Direct benefit to BEL, HAL, L&T Defense. Confirms Industrials rotation entry.",
    cta: true,
  },
  {
    category: "RAW MATERIAL",
    catDir: "warn"   as const,
    extra: null       as string | null,
    sentiment: "Negative",
    sentDir: "down"  as Direction,
    source: "ET · Mon",
    tags: ["Paint", "Tyre", "Aviation"],
    body: null        as string | null,
    cta: false,
  },
  {
    category: "MACRO",
    catDir: "accent" as const,
    extra: "Regime flag" as string | null,
    sentiment: "Mixed",
    sentDir: "neutral" as Direction,
    source: "RBI",
    tags: ["Bank - Private", "Real Estate"],
    body: null        as string | null,
    cta: false,
  },
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

function signalStyle(dir: "up" | "down" | "warn") {
  switch (dir) {
    case "up":   return { bg: "var(--qc-up-soft)",   border: "var(--qc-up)",   title: "var(--qc-up)" };
    case "down": return { bg: "var(--qc-down-soft)", border: "var(--qc-down)", title: "var(--qc-down)" };
    case "warn": return { bg: "var(--qc-warn-soft)", border: "var(--qc-warn)", title: "var(--qc-warn)" };
  }
}

function catBadgeStyle(dir: "blue" | "warn" | "accent") {
  switch (dir) {
    case "blue":   return { background: "var(--qc-blue-soft)",      color: "var(--qc-blue)",              borderColor: "var(--qc-blue)" };
    case "warn":   return { background: "var(--qc-warn-soft)",      color: "var(--qc-warn)",              borderColor: "var(--qc-warn)" };
    case "accent": return { background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)", borderColor: "var(--qc-accent-primary)" };
  }
}

// ── Small atoms ───────────────────────────────────────────────────────────────

function QBadge({ q }: { q: QLevel }) {
  return <Badge variant="outline" style={qStyle(q)}>{q}</Badge>;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative rounded-full overflow-hidden shrink-0"
        style={{ width: 80, height: 3, background: "var(--qc-border-default)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--qc-text-heading)" }}>
        {score}
      </span>
    </div>
  );
}

function WoW({ v }: { v: string }) {
  return (
    <span className="text-[12px] font-medium tabular-nums" style={{ color: wowColor(v) }}>{v}</span>
  );
}

function SentIcon({ dir }: { dir: Direction }) {
  if (dir === "up")   return <TrendingUp  className="h-3 w-3 shrink-0" style={{ color: "var(--qc-up)" }} />;
  if (dir === "down") return <TrendingDown className="h-3 w-3 shrink-0" style={{ color: "var(--qc-down)" }} />;
  return <Minus className="h-3 w-3 shrink-0" style={{ color: "var(--qc-warn)" }} />;
}

// shared table head style
const TH_CLS = "text-[10px] font-semibold uppercase tracking-wider px-3 py-2.5 whitespace-nowrap";

// ── Dashboard Tab ─────────────────────────────────────────────────────────────

export function DashboardTab() {
  return (
    <div className="px-6 py-5 space-y-5">

      {/* ── 4 metric tiles ──────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricTile
          label="Market Regime"
          value="Risk-On"
          change="▲ from Neutral"
          sublabel="2 weeks ago"
        />
        <MetricTile
          label="Top Cluster"
          value="Info Tech"
          sublabel="Score 88 · Q1 · #1"
        />
        <MetricTile
          label="Biggest Mover"
          value="Industrials"
          change="+7 ranks this week"
        />
        <MetricTile
          label="News This Week"
          value="12"
          sublabel="5 clusters affected"
        />
      </div>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      <div className="flex gap-5 items-start">

        {/* Left — tables */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Top 5 Industries */}
          <TabularCard title="Top 5 Industries" titleCase>
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "var(--qc-border-inner)" }}>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 32 }}>#</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)" }}>Industry</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)" }}>Score</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 60 }}>WoW</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 48 }}>Q</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 120 }}>News</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP5.map((row) => (
                  <TableRow key={row.rank} style={{ borderColor: "var(--qc-border-inner)" }}>
                    <TableCell className="px-3 py-3">
                      <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-text-muted)" }}>{row.rank}</span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <span className="text-[13px] font-medium" style={{ color: "var(--qc-text-heading)" }}>{row.name}</span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <ScoreBar score={row.score} color="var(--qc-blue)" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <WoW v={row.wow} />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <QBadge q={row.q} />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      {row.newsTag && row.newsDir ? (
                        <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{
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
          </TabularCard>

          {/* Portfolio Overlay */}
          <TabularCard title="Portfolio Overlay — Your Holdings" titleCase>
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "var(--qc-border-inner)" }}>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)" }}>Stock</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)" }}>Industry Cluster</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 60 }}>Rank</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 48 }}>Q</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 60 }}>WoW</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HOLDINGS.map((h) => (
                  <TableRow key={h.ticker} style={{ borderColor: "var(--qc-border-inner)" }}>
                    <TableCell className="px-3 py-3">
                      <span className="text-[13px] font-semibold" style={{ color: "var(--qc-accent-primary)" }}>{h.ticker}</span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <span className="text-[12px]" style={{ color: "var(--qc-text-body)" }}>{h.cluster}</span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <span className="text-[12px] tabular-nums font-medium" style={{ color: "var(--qc-text-heading)" }}>{h.rank}</span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <QBadge q={h.q} />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <WoW v={h.wow} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-3 pt-3 pb-1">
              <Button variant="outline" size="sm" className="gap-1.5">
                Analyse DLF exposure
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TabularCard>

          {/* Bottom 3 Industries (moved into left column for better flow) */}
          <TabularCard title="Bottom 3 Industries" titleCase>
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "var(--qc-border-inner)" }}>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 32 }}>#</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)" }}>Industry</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)" }}>Score</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 60 }}>WoW</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 48 }}>Q</TableHead>
                  <TableHead className={TH_CLS} style={{ color: "var(--qc-text-muted)", width: 140 }}>Signal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BOTTOM3.map((row) => (
                  <TableRow key={row.rank} style={{ borderColor: "var(--qc-border-inner)" }}>
                    <TableCell className="px-3 py-3">
                      <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-text-muted)" }}>{row.rank}</span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <span className="text-[13px] font-medium" style={{ color: "var(--qc-text-heading)" }}>{row.name}</span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <ScoreBar score={row.score} color="var(--qc-down)" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <WoW v={row.wow} />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <QBadge q={row.q} />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      {row.signal ? (
                        <span className="text-[11px] font-medium" style={{ color: "var(--qc-down)" }}>{row.signal}</span>
                      ) : (
                        <span style={{ color: "var(--qc-text-muted)" }}>—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabularCard>
        </div>

        {/* Right — signals & news, sticky so they stay visible while tables scroll */}
        <div
          className="shrink-0 space-y-5 sticky top-[108px]"
          style={{ width: 340 }}
        >

          {/* Rotation Signals */}
          <TabularCard title="Rotation Signals & Alerts" titleCase>
            <div className="space-y-2">
              {ROTATION_SIGNALS.map((sig, i) => {
                const s = signalStyle(sig.dir);
                return (
                  <Card
                    key={i}
                    className="rounded-[8px] py-3 px-4 gap-1 border-l-[3px] shadow-none"
                    style={{ background: s.bg, borderLeftColor: s.border }}
                  >
                    <CardContent className="p-0 space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.title }}>{sig.type}</p>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{sig.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{sig.detail}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabularCard>

          {/* Top News */}
          <TabularCard title="Top News This Week" titleCase>
            <div className="space-y-2.5">
              {NEWS.map((item, i) => (
                <Card
                  key={i}
                  className="rounded-[8px] py-3 px-3 gap-2 shadow-none"
                  style={{ background: "var(--qc-surface-panel)" }}
                >
                  <CardContent className="p-0 space-y-1.5">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" style={catBadgeStyle(item.catDir)}>
                        {item.category}
                      </Badge>
                      {item.extra && (
                        <Badge variant="outline" style={{ background: "var(--qc-surface-hover)", color: "var(--qc-text-muted)", borderColor: "var(--qc-border-default)" }}>
                          {item.extra}
                        </Badge>
                      )}
                    </div>

                    {/* Sentiment + source */}
                    <div className="flex items-center gap-1.5">
                      <SentIcon dir={item.sentDir} />
                      <span className="text-[11px] font-medium" style={{
                        color: item.sentDir === "up" ? "var(--qc-up)" : item.sentDir === "down" ? "var(--qc-down)" : "var(--qc-warn)",
                      }}>
                        {item.sentiment}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{item.source}</span>
                    </div>

                    {/* Industry tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" style={{ background: "var(--qc-surface-card)", color: "var(--qc-text-body)", borderColor: "var(--qc-border-inner)" }}>
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Body */}
                    {item.body && (
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>
                        {item.body}
                      </p>
                    )}

                    {/* CTA */}
                    {item.cta && (
                      <Button variant="outline" size="sm" className="gap-1 mt-1">
                        Stock impact
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabularCard>

        </div>
      </div>
    </div>
  );
}
