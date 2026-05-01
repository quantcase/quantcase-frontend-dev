"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { TabularCard } from "@/components/molecules/tabular-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table";
import type {
  IIStockRanking, IIClusterSignal, IIClusterNews,
  RevisionDirection, ValuationLabel, ClusterSignalVariant,
} from "@/types/industry-intelligence";

// ── Cell helpers ──────────────────────────────────────────────────────────────

const TH = "text-[10px] font-semibold uppercase tracking-wider px-3 py-2.5 whitespace-nowrap";

function RSCell({ rs }: { rs: string }) {
  const color = rs.startsWith("+") ? "var(--qc-up)" : rs.startsWith("-") ? "var(--qc-down)" : "var(--qc-text-muted)";
  return <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{rs}</span>;
}

function RevisionCell({ label, dir }: { label: string; dir: RevisionDirection }) {
  const color =
    label === "Strong"    ? "var(--qc-up)"   :
    label === "Improving" ? "var(--qc-blue)"  :
    label === "Declining" ? "var(--qc-down)"  :
    "var(--qc-text-muted)";
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : ArrowRight;
  return (
    <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color }}>
      {label} <Icon className="h-3 w-3" />
    </span>
  );
}

function ValCell({ val }: { val: ValuationLabel }) {
  const color = val === "Expensive" ? "var(--qc-warn)" : val === "Cheap" ? "var(--qc-up)" : "var(--qc-text-muted)";
  return <span className="text-[12px]" style={{ color }}>{val}</span>;
}

// ── Cluster signal card ───────────────────────────────────────────────────────

const SIGNAL_STYLES: Record<ClusterSignalVariant, { bg: string; color: string; border: string }> = {
  hold:     { bg: "var(--qc-blue-soft)", color: "var(--qc-blue)", border: "var(--qc-blue)" },
  watch:    { bg: "var(--qc-warn-soft)", color: "var(--qc-warn)", border: "var(--qc-warn)" },
  exit:     { bg: "var(--qc-down-soft)", color: "var(--qc-down)", border: "var(--qc-down)" },
  emerging: { bg: "var(--qc-up-soft)",   color: "var(--qc-up)",   border: "var(--qc-up)" },
};

function ClusterSignalCard({ variant, title, subtitle, detail }: IIClusterSignal) {
  const s = SIGNAL_STYLES[variant];
  return (
    <Card className="rounded-[10px] shadow-none px-4 py-3 gap-1.5" style={{ background: s.bg, borderColor: s.border }}>
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{title}</span>
      {subtitle && <p className="text-[12px] font-medium" style={{ color: s.color, opacity: 0.55 }}>{subtitle}</p>}
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{detail}</p>
    </Card>
  );
}

// ── Cluster news card ─────────────────────────────────────────────────────────

function ClusterNewsCard({ item }: { item: IIClusterNews }) {
  const sentColor =
    item.sentiment_direction === "positive" ? "var(--qc-up)"   :
    item.sentiment_direction === "negative" ? "var(--qc-down)" :
    "var(--qc-warn)";
  const sentSymbol = item.sentiment_direction === "mixed" ? "◆" : "";

  return (
    <Card className="rounded-[10px] shadow-none px-4 py-3 gap-2" style={{ background: "var(--qc-accent-lime-bg)", borderColor: "transparent" }}>
      <Badge className="self-start text-[9px] font-bold tracking-widest px-2 py-0.5"
        style={{ background: "var(--qc-accent-primary)", color: "#fff", borderColor: "transparent" }}
      >
        {item.category}
      </Badge>
      <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--qc-text-heading)" }}>{item.headline}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold" style={{ color: sentColor }}>
          {sentSymbol} {item.sentiment}
        </span>
        <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{item.source} · {item.published_day}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {item.factor_tags.map((t) => <Badge key={t} className="text-[10px] px-2 py-0.5">{t}</Badge>)}
      </div>
    </Card>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center gap-1 text-[12px]">
      {items.map((crumb, i) => (
        <span key={crumb} className="flex items-center gap-1">
          {i < items.length - 1 ? (
            <>
              <span className="cursor-pointer hover:underline" style={{ color: "var(--qc-blue)" }}>{crumb}</span>
              <span style={{ color: "var(--qc-text-muted)" }}>›</span>
            </>
          ) : (
            <span className="font-semibold" style={{ color: "var(--qc-text-heading)" }}>{crumb}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function StockRankingTab({ data }: { data: IIStockRanking }) {
  const [cluster, setCluster] = useState(data.selected_cluster?.name ?? data.available_clusters[0] ?? "");
  const sel = data.selected_cluster;

  if (!sel) {
    return (
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="relative">
          <select
            value={cluster}
            onChange={(e) => setCluster(e.target.value)}
            className="appearance-none rounded-[10px] px-4 py-3 text-[16px] font-semibold outline-none cursor-pointer pr-10 w-full max-w-sm"
            style={{
              border: "1px solid var(--qc-border-default)",
              background: "var(--qc-surface-card)",
              color: "var(--qc-text-heading)",
            }}
          >
            {data.available_clusters.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: "var(--qc-text-muted)" }} />
        </div>
        <div className="flex items-center justify-center py-16">
          <span className="text-[13px]" style={{ color: "var(--qc-text-muted)" }}>
            Select a cluster above to view its stock rankings.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      <Breadcrumb items={sel.breadcrumb} />

      <div className="grid grid-cols-5 gap-4 items-start">

        {/* Left: stock table */}
        <div className="col-span-3">
          <TabularCard
            title="Stocks within"
            headerAction={
              <div className="relative">
                <select
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  className="appearance-none rounded-[8px] px-3 py-1.5 text-[13px] font-semibold outline-none cursor-pointer pr-8"
                  style={{
                    border: "1px solid var(--qc-border-default)",
                    background: "var(--qc-surface-base)",
                    color: "var(--qc-text-heading)",
                    minWidth: 168,
                  }}
                >
                  {data.available_clusters.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--qc-text-muted)" }} />
              </div>
            }
          >
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "var(--qc-border-inner)" }}>
                  <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 36 }}>#</TableHead>
                  <TableHead className={TH} style={{ color: "var(--qc-text-muted)" }}>Stock</TableHead>
                  <TableHead className={TH} style={{ color: "var(--qc-text-muted)" }}>RS vs cluster</TableHead>
                  <TableHead className={TH} style={{ color: "var(--qc-text-muted)" }}>Revisions</TableHead>
                  <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 72 }}>Quality</TableHead>
                  <TableHead className={TH} style={{ color: "var(--qc-text-muted)", width: 80 }}>Val</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sel.stocks.map((stock) => (
                  <TableRow key={stock.symbol} style={{ borderColor: "var(--qc-border-inner)" }}>
                    <TableCell className="px-3 py-2.5">
                      <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-text-muted)" }}>{stock.rank}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold" style={{ color: "var(--qc-accent-primary)" }}>{stock.symbol}</span>
                        <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{stock.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5"><RSCell rs={stock.rs_vs_cluster_pct} /></TableCell>
                    <TableCell className="px-3 py-2.5"><RevisionCell label={stock.revision_label} dir={stock.revision_direction} /></TableCell>
                    <TableCell className="px-3 py-2.5">
                      <span className="text-[13px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>{stock.quality_score}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5"><ValCell val={stock.valuation_label} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabularCard>
        </div>

        {/* Right: cluster signals + news */}
        <div className="col-span-2 flex flex-col gap-4">

          <TabularCard title="Cluster Signal">
            <div className="flex flex-col gap-3 p-1">
              {sel.cluster_signals.map((sig) => (
                <ClusterSignalCard key={sig.title} {...sig} />
              ))}
            </div>
          </TabularCard>

          <TabularCard title="Cluster News This Week">
            <div className="flex flex-col gap-2 p-1">
              {sel.cluster_news.map((item) => (
                <ClusterNewsCard key={item.headline} item={item} />
              ))}
            </div>
          </TabularCard>

        </div>
      </div>
    </div>
  );
}
