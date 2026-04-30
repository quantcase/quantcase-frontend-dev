"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { TabularCard } from "@/components/molecules/tabular-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table";

// ── Types & data ──────────────────────────────────────────────────────────────

type RevDir = "up" | "flat" | "down";
type ValLabel = "Fair" | "Expensive" | "Cheap";

interface Stock {
  rank: number;
  symbol: string;
  name: string;
  rs: string;
  revision: string;
  revDir: RevDir;
  quality: number;
  val: ValLabel;
}

const CLUSTERS = [
  "Bank - Private",
  "Bank - Public",
  "NBFC - Large",
  "Insurance",
  "Asset Management",
];

const STOCKS: Stock[] = [
  { rank: 1,  symbol: "ICICIBANK",  name: "ICICI Bank",            rs: "+9%", revision: "Strong",    revDir: "up",   quality: 91, val: "Fair" },
  { rank: 2,  symbol: "HDFCBANK",   name: "HDFC Bank",             rs: "+7%", revision: "Strong",    revDir: "up",   quality: 93, val: "Fair" },
  { rank: 3,  symbol: "AXISBANK",   name: "Axis Bank",             rs: "+5%", revision: "Improving", revDir: "up",   quality: 79, val: "Fair" },
  { rank: 4,  symbol: "KOTAKBANK",  name: "Kotak Mahindra Bank",   rs: "+3%", revision: "Stable",    revDir: "flat", quality: 86, val: "Expensive" },
  { rank: 5,  symbol: "FEDERALBNK", name: "Federal Bank",          rs: "+2%", revision: "Improving", revDir: "up",   quality: 74, val: "Fair" },
  { rank: 6,  symbol: "AUBANK",     name: "AU Small Finance Bank", rs: "+1%", revision: "Stable",    revDir: "flat", quality: 71, val: "Fair" },
  { rank: 7,  symbol: "IDFCFIRSTB", name: "IDFC FIRST Bank",       rs: "0%",  revision: "Stable",    revDir: "flat", quality: 66, val: "Fair" },
  { rank: 8,  symbol: "CUB",        name: "City Union Bank",       rs: "-1%", revision: "Stable",    revDir: "flat", quality: 63, val: "Fair" },
  { rank: 9,  symbol: "KTKBANK",    name: "Karnataka Bank",        rs: "-2%", revision: "Declining", revDir: "down", quality: 58, val: "Fair" },
  { rank: 10, symbol: "DCBBANK",    name: "DCB Bank",              rs: "-3%", revision: "Declining", revDir: "down", quality: 52, val: "Fair" },
];

// ── Table helpers ─────────────────────────────────────────────────────────────

const TH = "text-[10px] font-semibold uppercase tracking-wider px-3 py-2.5 whitespace-nowrap";

function RSCell({ rs }: { rs: string }) {
  const color = rs.startsWith("+") ? "var(--qc-up)" : rs.startsWith("-") ? "var(--qc-down)" : "var(--qc-text-muted)";
  return <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{rs}</span>;
}

function RevisionCell({ label, dir }: { label: string; dir: RevDir }) {
  const color =
    label === "Strong"    ? "var(--qc-up)"  :
    label === "Improving" ? "var(--qc-blue)" :
    label === "Declining" ? "var(--qc-down)" :
    "var(--qc-text-muted)";
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : ArrowRight;
  return (
    <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color }}>
      {label} <Icon className="h-3 w-3" />
    </span>
  );
}

function ValCell({ val }: { val: ValLabel }) {
  const color = val === "Expensive" ? "var(--qc-warn)" : val === "Cheap" ? "var(--qc-up)" : "var(--qc-text-muted)";
  return <span className="text-[12px]" style={{ color }}>{val}</span>;
}

// ── Cluster signal card ───────────────────────────────────────────────────────

type SignalVariant = "hold" | "watch";

const SIGNAL_STYLES: Record<SignalVariant, { bg: string; color: string; border: string }> = {
  hold:  { bg: "var(--qc-blue-soft)", color: "var(--qc-blue)", border: "var(--qc-blue)" },
  watch: { bg: "var(--qc-warn-soft)", color: "var(--qc-warn)", border: "var(--qc-warn)" },
};

function ClusterSignalCard({ variant, title, subtitle, detail }: {
  variant: SignalVariant;
  title: string;
  subtitle?: string;
  detail: string;
}) {
  const s = SIGNAL_STYLES[variant];
  return (
    <Card
      className="rounded-[10px] shadow-none px-4 py-3 gap-1.5"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: s.color }}>
        {title}
      </span>
      {subtitle && (
        <p className="text-[12px] font-medium" style={{ color: s.color, opacity: 0.55 }}>{subtitle}</p>
      )}
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{detail}</p>
    </Card>
  );
}

// ── Cluster news card ─────────────────────────────────────────────────────────

function ClusterNewsCard() {
  return (
    <Card
      className="rounded-[10px] shadow-none px-4 py-3 gap-2"
      style={{ background: "var(--qc-accent-lime-bg)", borderColor: "transparent" }}
    >
      <Badge
        className="self-start text-[9px] font-bold tracking-widest px-2 py-0.5"
        style={{ background: "var(--qc-accent-primary)", color: "#fff", borderColor: "transparent" }}
      >
        MACRO
      </Badge>
      <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--qc-text-heading)" }}>
        RBI holds rates — NIM outlook stable
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold" style={{ color: "var(--qc-warn)" }}>◆ Mixed</span>
        <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>RBI · Wed</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge className="text-[10px] px-2 py-0.5">NIM &amp; Spread</Badge>
        <Badge className="text-[10px] px-2 py-0.5">Valuation</Badge>
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

export function StockRankingTab() {
  const [cluster, setCluster] = useState("Bank - Private");

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* Breadcrumb */}
      <Breadcrumb items={["Industry ranking", "Financial Services", "Banking", cluster]} />

      {/* 60 / 40 two-column layout */}
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
                  {CLUSTERS.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: "var(--qc-text-muted)" }}
                />
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
                {STOCKS.map((stock) => (
                  <TableRow key={stock.symbol} style={{ borderColor: "var(--qc-border-inner)" }}>
                    <TableCell className="px-3 py-2.5">
                      <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-text-muted)" }}>
                        {stock.rank}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold" style={{ color: "var(--qc-accent-primary)" }}>
                          {stock.symbol}
                        </span>
                        <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
                          {stock.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <RSCell rs={stock.rs} />
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <RevisionCell label={stock.revision} dir={stock.revDir} />
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <span className="text-[13px] tabular-nums" style={{ color: "var(--qc-text-body)" }}>
                        {stock.quality}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <ValCell val={stock.val} />
                    </TableCell>
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
              <ClusterSignalCard
                variant="hold"
                title="Core Hold"
                subtitle="Bank - Private #3"
                detail="Rank stable at #3 for 7 of last 8 weeks. NIM resilience and credit growth confirm structural strength."
              />
              <ClusterSignalCard
                variant="watch"
                title="Watch — MFI Risk"
                detail="IndusInd and RBL showing MFI slippage. Monitor GNPA in Q4 results."
              />
            </div>
          </TabularCard>

          <TabularCard title="Cluster News This Week">
            <div className="p-1">
              <ClusterNewsCard />
            </div>
          </TabularCard>

        </div>
      </div>
    </div>
  );
}
