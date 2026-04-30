"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { MetricTile } from "@/components/molecules/metric-tile";
import { TabularCard } from "@/components/molecules/tabular-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────────────

type SubTab = "Overview" | "Drivers" | "News" | "Risks & catalysts";
type Direction = "positive" | "negative";

// ── Static mock data ──────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Information Technology", "Energy", "Financials", "Industrials",
  "Healthcare", "Materials", "Auto", "FMCG", "Telecom",
];

const SCORES = [
  { label: "Fundamentals", score: 85 },
  { label: "Momentum",     score: 91 },
  { label: "Breadth",      score: 84 },
  { label: "Revisions",    score: 78 },
  { label: "Sentiment",    score: 76 },
  { label: "Valuation",    score: 62 },
];

const RANK_HISTORY = [
  { week: "W-7", rank: 3 },
  { week: "W-6", rank: 3 },
  { week: "W-5", rank: 2 },
  { week: "W-4", rank: 2 },
  { week: "W-3", rank: 2 },
  { week: "W-2", rank: 1 },
  { week: "W-1", rank: 1 },
  { week: "Now", rank: 1 },
];

const FACTOR_IMPACTS: { factor: string; tags: string[]; dir: Direction }[] = [
  { factor: "Growth",        tags: ["DEMAND", "CORPORATE"], dir: "positive" },
  { factor: "Profitability", tags: ["MACRO"],               dir: "positive" },
  { factor: "Sentiment",     tags: ["DEMAND", "CORPORATE"], dir: "positive" },
  { factor: "Valuation",     tags: ["NO NEWS"],             dir: "negative" },
];

const NEWS_ITEMS = [
  {
    category: "DEMAND SIGNAL",
    categoryColor: "var(--qc-blue)",
    bg: "var(--qc-blue-soft)",
    headline: "US hyperscaler capex raised $40Bn — IT deal pipeline expanding",
    dir: "positive" as Direction,
    source: "Bloomberg · Mon",
    factors: ["Growth", "Sentiment"],
  },
  {
    category: "MACRO",
    categoryColor: "var(--qc-accent-primary)",
    bg: "var(--qc-accent-lime-bg)",
    headline: "INR holds at 83.6 — export revenue visibility intact",
    dir: "positive" as Direction,
    source: "RBI · Fri",
    factors: ["Growth", "Profitability"],
  },
  {
    category: "CORPORATE",
    categoryColor: "var(--qc-up)",
    bg: "var(--qc-up-soft)",
    headline: "TCS wins $500M deal — largest in FY25",
    dir: "positive" as Direction,
    source: "TCS filing · Thu",
    factors: ["Growth", "Sentiment"],
  },
];

// ── Sub-tab navigation — local variant to support news count badge ─────────────

const SUB_TABS: SubTab[] = ["Overview", "Drivers", "News", "Risks & catalysts"];

function SubTabNav({ active, onChange }: { active: SubTab; onChange: (t: SubTab) => void }) {
  return (
    <div
      className="flex items-center overflow-x-auto scrollbar-none"
      style={{ borderBottom: "1px solid var(--qc-border-default)" }}
    >
      {SUB_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="relative flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors"
          style={{ color: active === tab ? "var(--qc-text-heading)" : "var(--qc-text-muted)" }}
        >
          {tab}
          {tab === "News" && (
            <span
              className="flex items-center justify-center w-[18px] h-[18px] rounded-full text-[9px] font-bold"
              style={{ background: "var(--qc-blue)", color: "#fff" }}
            >
              3
            </span>
          )}
          {active === tab && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: "var(--qc-accent-primary)" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Score mini-tile ───────────────────────────────────────────────────────────

function ScoreTile({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "var(--qc-up)" : score >= 70 ? "var(--qc-blue)" : "var(--qc-warn)";
  return (
    <Card
      className="rounded-[10px] shadow-none px-3 py-3 gap-1.5"
      style={{ borderColor: "var(--qc-border-default)" }}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-widest"
        style={{ color: "var(--qc-text-muted)" }}
      >
        {label}
      </span>
      <p className="text-[24px] font-bold leading-none" style={{ color: "var(--qc-text-heading)" }}>
        {score}
      </p>
      <div
        className="relative rounded-full overflow-hidden"
        style={{ height: 3, background: "var(--qc-border-default)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </Card>
  );
}

// ── Rank history bar ──────────────────────────────────────────────────────────

function RankBar({ week, rank }: { week: string; rank: number }) {
  const width = Math.max(18, ((24 - rank + 1) / 24) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] shrink-0 w-7" style={{ color: "var(--qc-text-muted)" }}>{week}</span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 7, background: "var(--qc-border-default)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, background: "var(--qc-blue)" }}
        />
      </div>
      <span
        className="text-[12px] font-bold w-6 text-right shrink-0"
        style={{ color: "var(--qc-text-heading)" }}
      >
        #{rank}
      </span>
    </div>
  );
}

// ── Factor impact row ─────────────────────────────────────────────────────────

function FactorImpactRow({ factor, tags, dir }: { factor: string; tags: string[]; dir: Direction }) {
  const isNoNews = tags.includes("NO NEWS");
  return (
    <div
      className="flex items-center gap-2 py-2.5"
      style={{ borderBottom: "1px solid var(--qc-border-inner)" }}
    >
      <span
        className="text-[13px] font-semibold shrink-0 w-24"
        style={{ color: "var(--qc-text-heading)" }}
      >
        {factor}
      </span>
      <div className="flex items-center gap-1 flex-1 flex-wrap">
        {tags.map((tag) =>
          isNoNews ? (
            <Badge
              key={tag}
              variant="outline"
              className="text-[9px] font-bold px-1.5 py-0.5"
              style={{
                background: "var(--qc-down-soft)",
                color: "var(--qc-down)",
                borderColor: "var(--qc-down)",
              }}
            >
              {tag}
            </Badge>
          ) : (
            <Badge key={tag} className="text-[9px] font-bold px-1.5 py-0.5 tracking-wide">
              {tag}
            </Badge>
          )
        )}
      </div>
      <span
        className="flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap"
        style={{ color: dir === "positive" ? "var(--qc-up)" : "var(--qc-down)" }}
      >
        {dir === "positive" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {dir === "positive" ? "Positive" : "Negative"}
      </span>
    </div>
  );
}

// ── News card ─────────────────────────────────────────────────────────────────

function NewsCard({
  category, categoryColor, bg, headline, dir, source, factors,
}: typeof NEWS_ITEMS[number]) {
  return (
    <Card
      className="rounded-[10px] shadow-none px-4 py-3 gap-2"
      style={{ background: bg, borderColor: "transparent" }}
    >
      <Badge
        className="self-start text-[9px] font-bold tracking-widest px-2 py-0.5"
        style={{ background: categoryColor, color: "#fff", borderColor: "transparent" }}
      >
        {category}
      </Badge>
      <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--qc-text-heading)" }}>
        {headline}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: dir === "positive" ? "var(--qc-up)" : "var(--qc-down)" }}
        >
          {dir === "positive" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {dir === "positive" ? "Positive" : "Negative"}
        </span>
        <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{source}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {factors.map((f) => (
          <Badge key={f} className="text-[10px] px-2 py-0.5">{f}</Badge>
        ))}
      </div>
    </Card>
  );
}

// ── Sub-tab content panels ────────────────────────────────────────────────────

function OverviewContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[14px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>
        Information Technology holds the #1 rank for the third consecutive week. The sector benefits
        from strong AI-driven order flows, robust export earnings with a stable rupee, and broad-based
        earnings upgrades. Breadth is at a multi-month high with 84% of constituent stocks above
        their 20-week moving average.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {SCORES.map((s) => <ScoreTile key={s.label} {...s} />)}
      </div>
    </div>
  );
}

const DRIVERS = [
  {
    label: "AI capex cycle",
    text: "Hyperscaler spending upgrades driving large deal wins. TCS and Infosys EPS revised up 4–7% this week.",
  },
  {
    label: "Rupee stability",
    text: "USD/INR at 83–84 supporting revenue realisation.",
  },
  {
    label: "Breadth expansion",
    text: "Mid-cap IT — HCL, Mphasis, Persistent — all above key moving averages.",
  },
];

function DriversContent() {
  return (
    <div className="flex flex-col gap-4">
      {DRIVERS.map(({ label, text }) => (
        <p key={label} className="text-[14px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>
          <strong style={{ color: "var(--qc-text-heading)" }}>{label}:</strong>{" "}{text}
        </p>
      ))}
    </div>
  );
}

function NewsContent() {
  return (
    <div className="flex flex-col gap-3">
      <span
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "var(--qc-text-muted)" }}
      >
        News linked to this cluster
      </span>
      {NEWS_ITEMS.map((item) => <NewsCard key={item.headline} {...item} />)}
    </div>
  );
}

const RISKS_CATALYSTS = [
  {
    label: "Risks",
    text: "28x forward P/E at top decile historically. US macro slowdown could compress multiples. INR appreciation risk.",
  },
  {
    label: "Catalysts",
    text: "Q1 FY26 earnings (Jul), large deal announcements, US tech spend data.",
  },
];

function RisksContent() {
  return (
    <div className="flex flex-col gap-4">
      {RISKS_CATALYSTS.map(({ label, text }) => (
        <p key={label} className="text-[14px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>
          <strong style={{ color: "var(--qc-text-heading)" }}>{label}:</strong>{" "}{text}
        </p>
      ))}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function DeepDiveTab() {
  const [subTab, setSubTab] = useState<SubTab>("Overview");
  const [industry, setIndustry] = useState("Information Technology");

  const breadcrumb = ["Industry ranking", "Financial Services", "Banking", industry];

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[12px]">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1">
            {i < breadcrumb.length - 1 ? (
              <>
                <span
                  className="cursor-pointer hover:underline"
                  style={{ color: "var(--qc-blue)" }}
                >
                  {crumb}
                </span>
                <span style={{ color: "var(--qc-text-muted)" }}>›</span>
              </>
            ) : (
              <span className="font-semibold" style={{ color: "var(--qc-text-heading)" }}>
                {crumb}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Industry selector */}
      <div className="relative">
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full appearance-none rounded-[10px] px-4 py-3 text-[16px] font-semibold outline-none cursor-pointer pr-10"
          style={{
            border: "1px solid var(--qc-border-default)",
            background: "var(--qc-surface-card)",
            color: "var(--qc-text-heading)",
          }}
        >
          {INDUSTRIES.map((ind) => <option key={ind}>{ind}</option>)}
        </select>
        <ChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
          style={{ color: "var(--qc-text-muted)" }}
        />
      </div>

      {/* 4 metric tiles */}
      <div className="grid grid-cols-4 gap-3">
        <MetricTile label="Cluster rank"    value="#1"                  change="→ Stable · 0 WoW" />
        <MetricTile label="Composite score" value="88"                  change="+2 this week" />
        <MetricTile label="Breadth"         value="84%"                 change="▲ 84% above 20w MA" />
        <MetricTile label="Economic model"  value="Capex + Consumption" sublabel="Core overweight" />
      </div>

      {/* 2-column content — 60 / 40 split */}
      <div className="grid grid-cols-5 gap-4 items-start">

        {/* Left: sub-tab panel */}
        <div className="col-span-3">
          <Card
            className="rounded-[10px] shadow-none p-0 gap-0"
            style={{ borderColor: "var(--qc-border-default)" }}
          >
            <SubTabNav active={subTab} onChange={setSubTab} />
            <div className="p-4">
              {subTab === "Overview"          && <OverviewContent />}
              {subTab === "Drivers"           && <DriversContent />}
              {subTab === "News"              && <NewsContent />}
              {subTab === "Risks & catalysts" && <RisksContent />}
            </div>
          </Card>
        </div>

        {/* Right: rank history + news impact */}
        <div className="col-span-2 flex flex-col gap-4">

          <TabularCard title="Rank History — 8 Weeks">
            <div className="flex flex-col gap-2.5 px-1 py-1">
              {RANK_HISTORY.map((r) => <RankBar key={r.week} {...r} />)}
            </div>
          </TabularCard>

          <TabularCard title="News Impact on Factors">
            <div className="flex flex-col px-1">
              {FACTOR_IMPACTS.map((f) => <FactorImpactRow key={f.factor} {...f} />)}
            </div>
          </TabularCard>

        </div>
      </div>

    </div>
  );
}
