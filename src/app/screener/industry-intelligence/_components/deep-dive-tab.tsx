"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { MetricTile } from "@/components/molecules/metric-tile";
import { TabularCard } from "@/components/molecules/tabular-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  IIDeepDive, IISelectedIndustry, IIFactorScores,
  IIDeepDiveDriver, IIDeepDiveNews, IIFactorNewsImpact, CategoryType,
} from "@/types/industry-intelligence";

// ── Types ─────────────────────────────────────────────────────────────────────

type SubTab = "Overview" | "Drivers" | "News" | "Risks & catalysts";

// ── Category type → CSS variables ─────────────────────────────────────────────

function categoryStyle(type: CategoryType): { color: string; bg: string } {
  switch (type) {
    case "demand":       return { color: "var(--qc-blue)",           bg: "var(--qc-blue-soft)" };
    case "macro":        return { color: "var(--qc-accent-primary)", bg: "var(--qc-accent-lime-bg)" };
    case "corporate":    return { color: "var(--qc-up)",             bg: "var(--qc-up-soft)" };
    case "policy":       return { color: "var(--qc-warn)",           bg: "var(--qc-warn-soft)" };
    default:             return { color: "var(--qc-text-muted)",     bg: "var(--qc-surface-panel)" };
  }
}

// ── Sub-tab navigation ────────────────────────────────────────────────────────

const SUB_TABS: SubTab[] = ["Overview", "Drivers", "News", "Risks & catalysts"];

function SubTabNav({ active, onChange, newsCount }: {
  active: SubTab;
  onChange: (t: SubTab) => void;
  newsCount: number;
}) {
  return (
    <div className="flex items-center overflow-x-auto scrollbar-none" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
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
              {newsCount}
            </span>
          )}
          {active === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--qc-accent-primary)" }} />
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
    <Card className="rounded-[10px] shadow-none px-3 py-3 gap-1.5" style={{ borderColor: "var(--qc-border-default)" }}>
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--qc-text-muted)" }}>{label}</span>
      <p className="text-[24px] font-bold leading-none" style={{ color: "var(--qc-text-heading)" }}>{score}</p>
      <div className="relative rounded-full overflow-hidden" style={{ height: 3, background: "var(--qc-border-default)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${score}%`, background: color }} />
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
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 7, background: "var(--qc-border-default)" }}>
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: "var(--qc-blue)" }} />
      </div>
      <span className="text-[12px] font-bold w-6 text-right shrink-0" style={{ color: "var(--qc-text-heading)" }}>#{rank}</span>
    </div>
  );
}

// ── Factor impact row ─────────────────────────────────────────────────────────

function FactorImpactRow({ factor, news_categories, direction }: IIFactorNewsImpact) {
  const isNoNews = news_categories.includes("NO NEWS");
  return (
    <div className="flex items-center gap-2 py-2.5" style={{ borderBottom: "1px solid var(--qc-border-inner)" }}>
      <span className="text-[13px] font-semibold shrink-0 w-24" style={{ color: "var(--qc-text-heading)" }}>{factor}</span>
      <div className="flex items-center gap-1 flex-1 flex-wrap">
        {news_categories.map((tag) =>
          isNoNews ? (
            <Badge key={tag} variant="outline" className="text-[9px] font-bold px-1.5 py-0.5"
              style={{ background: "var(--qc-down-soft)", color: "var(--qc-down)", borderColor: "var(--qc-down)" }}
            >
              {tag}
            </Badge>
          ) : (
            <Badge key={tag} className="text-[9px] font-bold px-1.5 py-0.5 tracking-wide">{tag}</Badge>
          )
        )}
      </div>
      <span className="flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap"
        style={{ color: direction === "positive" ? "var(--qc-up)" : "var(--qc-down)" }}
      >
        {direction === "positive" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {direction === "positive" ? "Positive" : "Negative"}
      </span>
    </div>
  );
}

// ── News card ─────────────────────────────────────────────────────────────────

function NewsCard({ item }: { item: IIDeepDiveNews }) {
  const { color, bg } = categoryStyle(item.category_type);
  return (
    <Card className="rounded-[10px] shadow-none px-4 py-3 gap-2" style={{ background: bg, borderColor: "transparent" }}>
      <Badge className="self-start text-[9px] font-bold tracking-widest px-2 py-0.5"
        style={{ background: color, color: "#fff", borderColor: "transparent" }}
      >
        {item.category}
      </Badge>
      <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--qc-text-heading)" }}>{item.headline}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: item.direction === "positive" ? "var(--qc-up)" : "var(--qc-down)" }}
        >
          {item.direction === "positive" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {item.direction === "positive" ? "Positive" : "Negative"}
        </span>
        <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{item.source} · {item.published_day}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {item.factor_tags.map((f) => <Badge key={f} className="text-[10px] px-2 py-0.5">{f}</Badge>)}
      </div>
    </Card>
  );
}

// ── Sub-tab content panels ────────────────────────────────────────────────────

function OverviewContent({ overviewText, factorScores }: { overviewText: string; factorScores: IIFactorScores }) {
  const scores = Object.entries(factorScores).map(([key, score]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    score: score as number,
  }));
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[14px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>{overviewText}</p>
      <div className="grid grid-cols-3 gap-3">
        {scores.map((s) => <ScoreTile key={s.label} {...s} />)}
      </div>
    </div>
  );
}

function DriversContent({ drivers }: { drivers: IIDeepDiveDriver[] }) {
  return (
    <div className="flex flex-col gap-4">
      {drivers.map(({ label, text }) => (
        <p key={label} className="text-[14px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>
          <strong style={{ color: "var(--qc-text-heading)" }}>{label}:</strong>{" "}{text}
        </p>
      ))}
    </div>
  );
}

function NewsContent({ news }: { news: IIDeepDiveNews[] }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--qc-text-muted)" }}>
        News linked to this cluster
      </span>
      {news.map((item) => <NewsCard key={item.headline} item={item} />)}
    </div>
  );
}

function RisksContent({ risks, catalysts }: { risks: string; catalysts: string }) {
  return (
    <div className="flex flex-col gap-4">
      {[{ label: "Risks", text: risks }, { label: "Catalysts", text: catalysts }].map(({ label, text }) => (
        <p key={label} className="text-[14px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>
          <strong style={{ color: "var(--qc-text-heading)" }}>{label}:</strong>{" "}{text}
        </p>
      ))}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function DeepDiveTab({ data }: { data: IIDeepDive }) {
  const [subTab, setSubTab] = useState<SubTab>("Overview");
  const [industry, setIndustry] = useState(data.selected_industry?.name ?? data.available_industries[0] ?? "");
  const sel: IISelectedIndustry | null = data.selected_industry;

  if (!sel) {
    return (
      <div className="px-6 py-5 flex flex-col gap-4">
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
            {data.available_industries.map((ind) => <option key={ind}>{ind}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-center py-16">
          <span className="text-[13px]" style={{ color: "var(--qc-text-muted)" }}>
            Select an industry above to view its deep-dive analysis.
          </span>
        </div>
      </div>
    );
  }

  const breadcrumb = sel.breadcrumb;

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[12px]">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1">
            {i < breadcrumb.length - 1 ? (
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
          {data.available_industries.map((ind) => <option key={ind}>{ind}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: "var(--qc-text-muted)" }} />
      </div>

      {/* 4 metric tiles */}
      <div className="grid grid-cols-4 gap-3">
        <MetricTile label="Cluster rank"    value={sel.metrics.rank_label}       change={sel.metrics.rank_change_label} />
        <MetricTile label="Composite score" value={String(sel.metrics.composite_score)} change={sel.metrics.score_change_label} />
        <MetricTile label="Breadth"         value={`${sel.metrics.breadth_pct}%`} change={`▲ ${sel.metrics.breadth_context}`} />
        <MetricTile label="Economic model"  value={sel.metrics.economic_model}   sublabel={sel.metrics.economic_model_detail} />
      </div>

      {/* 2-column content — 60 / 40 split */}
      <div className="grid grid-cols-5 gap-4 items-start">

        {/* Left: sub-tab panel */}
        <div className="col-span-3">
          <Card className="rounded-[10px] shadow-none p-0 gap-0" style={{ borderColor: "var(--qc-border-default)" }}>
            <SubTabNav active={subTab} onChange={setSubTab} newsCount={sel.news.length} />
            <div className="p-4">
              {subTab === "Overview"          && <OverviewContent overviewText={sel.overview_text} factorScores={sel.factor_scores} />}
              {subTab === "Drivers"           && <DriversContent drivers={sel.drivers} />}
              {subTab === "News"              && <NewsContent news={sel.news} />}
              {subTab === "Risks & catalysts" && <RisksContent risks={sel.risks} catalysts={sel.catalysts} />}
            </div>
          </Card>
        </div>

        {/* Right: rank history + news impact */}
        <div className="col-span-2 flex flex-col gap-4">

          <TabularCard title="Rank History — 8 Weeks">
            <div className="flex flex-col gap-2.5 px-1 py-1">
              {sel.rank_history.map((r) => <RankBar key={r.week} {...r} />)}
            </div>
          </TabularCard>

          <TabularCard title="News Impact on Factors">
            <div className="flex flex-col px-1">
              {sel.factor_news_impacts.map((f) => <FactorImpactRow key={f.factor} {...f} />)}
            </div>
          </TabularCard>

        </div>
      </div>
    </div>
  );
}
