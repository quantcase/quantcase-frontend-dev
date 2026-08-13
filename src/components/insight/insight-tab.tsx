"use client";

import React, { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useLenses } from "@/hooks/useLenses";
import { useScreenerData } from "@/hooks/useScreenerData";
import type { ScreenerData } from "@/types/screener";

import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { AssetActionBar } from "@/components/molecules/asset-action-bar";
import { InsightScorecard } from "@/components/insight/insight-scorecard";
import { InsightLenses } from "@/components/insight/insight-lenses";
import { InsightSignalMap } from "@/components/insight/insight-signal-map";
import { InsightEmptyState } from "@/components/insight/insight-empty-state";
import { LensDrawer } from "@/components/insight/lens-drawer";

import type { InsightType, InsightLens } from "@/types/analysis";
import { QC } from "@/lib/chart-tokens";

// The Industry Analysis lens lives natively on the Opportunity page. Users expect
// to see it on the Deal page too, so we clone it onto Deal — frontend only, no
// backend change. The clone reuses the opportunity `industry-analysis` lens data
// (grid card) and its lens detail (drawer), both already fetched for the asset.
const INDUSTRY_LENS_SLUG = "industry-analysis";


// ─── Skeleton components ──────────────────────────────────────────────────────

function Shimmer({ style, rounded = 8 }: { style?: React.CSSProperties; rounded?: number }) {
  return <div className="skeleton-shimmer" style={{ borderRadius: rounded, ...style }} />;
}

function RadarDiamondSkeleton({ size = 220 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const rings = [0.25, 0.5, 0.75, 1];
  const n = 4;
  const axes = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return { x: cx + maxR * Math.sin(angle), y: cy - maxR * Math.cos(angle) };
  });
  const ringPoints = (ratio: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n;
      const r = maxR * ratio;
      return `${(cx + r * Math.sin(angle)).toFixed(1)},${(cy - r * Math.cos(angle)).toFixed(1)}`;
    }).join(" ");

  // Filled data polygon at ~60% fill to mimic a mid-score radar
  const dataR = maxR * 0.62;
  const dataPoints = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return `${(cx + dataR * Math.sin(angle)).toFixed(1)},${(cy - dataR * Math.cos(angle)).toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible", flexShrink: 0 }}>
      {/* Background rings */}
      {rings.map((r, i) => (
        <polygon key={i} points={ringPoints(r)} fill="none" stroke={QC.hair} strokeWidth={i === 2 ? 1.2 : 0.9} strokeDasharray={i === 2 ? "3 3" : undefined} />
      ))}
      {/* Axis spokes */}
      {axes.map((pt, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke={QC.hair} strokeWidth={0.9} />
      ))}
      {/* Shimmer data polygon — animated via CSS class */}
      <polygon points={dataPoints} className="skeleton-shimmer" style={{ fill: QC.section }} strokeWidth={0} />
      {/* Polygon stroke outline */}
      <polygon points={dataPoints} fill="none" stroke={QC.hair} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Center score placeholder */}
      <rect x={cx - 14} y={cy - 8} width={28} height={14} rx={3} fill={QC.section} />
    </svg>
  );
}

function InsightScorecardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
        {/* Dark verdict panel — mimic the dark navy gradient card */}
        <div style={{
          borderRadius: 14, overflow: "hidden", minHeight: 300, padding: "20px 16px",
          // Decorative dark hero ramp (mimics DarkGradientCard). Endpoint mapped to
          // the ink token; the mid navy stops have no clean 3-stop token, so kept.
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, var(--qc-ink) 100%)",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {/* "MANAGEMENT VERDICT" label + band pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shimmer style={{ height: 10, width: 130, background: "rgba(255,255,255,0.12)" }} rounded={4} />
            <Shimmer style={{ height: 20, width: 100, background: "rgba(255,255,255,0.10)" }} rounded={4} />
          </div>
          {/* Headline — two lines of large serif text */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Shimmer style={{ height: 26, width: "90%", background: "rgba(255,255,255,0.12)" }} rounded={5} />
            <Shimmer style={{ height: 26, width: "75%", background: "rgba(255,255,255,0.10)" }} rounded={5} />
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 7 }}>
              <Shimmer style={{ height: 13, width: "95%", background: "rgba(255,255,255,0.08)" }} rounded={4} />
              <Shimmer style={{ height: 13, width: "88%", background: "rgba(255,255,255,0.08)" }} rounded={4} />
              <Shimmer style={{ height: 13, width: "70%", background: "rgba(255,255,255,0.06)" }} rounded={4} />
            </div>
          </div>
          {/* Key signal pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[110, 140, 95, 125].map((w, i) => (
              <Shimmer key={i} style={{ height: 28, width: w, background: "rgba(255,255,255,0.09)" }} rounded={99} />
            ))}
          </div>
        </div>

        {/* Radar card — white bg, radar circle on left + text/legend on right, lens tiles below */}
        <div style={{ borderRadius: 14, background: "var(--qc-card)", border: "1px solid var(--qc-hair)", display: "flex", flexDirection: "column" }}>
          {/* Top section: radar + context */}
          <div className="flex flex-col sm:flex-row items-center" style={{ flex: 1, padding: "8px 0 0" }}>
            {/* Radar diamond skeleton */}
            <div style={{ flexShrink: 0, padding: "16px 0 16px 16px" }}>
              <RadarDiamondSkeleton size={220} />
            </div>
            {/* Right: band pill + subtitle + legend */}
            <div style={{ flex: 1, padding: "20px 20px 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <Shimmer style={{ height: 20, width: 100 }} rounded={4} />
              <Shimmer style={{ height: 16, width: "85%" }} rounded={5} />
              <Shimmer style={{ height: 16, width: "65%" }} rounded={5} />
              <Shimmer style={{ height: 11, width: "55%" }} rounded={4} />
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Shimmer style={{ width: 8, height: 8, flexShrink: 0 }} rounded={2} />
                    <Shimmer style={{ height: 10, width: 90 }} rounded={4} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Lens score tiles row */}
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderTop: "1px solid var(--qc-hair)" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                padding: "14px 16px 12px",
                borderRight: i < 3 ? "1px solid var(--qc-hair)" : undefined,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <Shimmer style={{ height: 9, width: "65%" }} rounded={4} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <Shimmer style={{ height: 22, width: 32 }} rounded={4} />
                  <Shimmer style={{ height: 13, width: 20 }} rounded={4} />
                  <Shimmer style={{ height: 9, width: 44 }} rounded={4} />
                </div>
                <Shimmer style={{ height: 3 }} rounded={99} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightLensesSkeleton() {
  return (
    <div className="rounded-[10px] p-2" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", display: "flex", flexDirection: "column", flex: 1 }}>
      {/* SectionPanel header: sans title + subtitle */}
      <div style={{ padding: "4px 8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <Shimmer style={{ height: 13, width: 200 }} rounded={4} />
        <Shimmer style={{ height: 11, width: 300 }} rounded={4} />
      </div>
      <div className="rounded-[10px] p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)", flex: 1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              padding: "20px 20px 20px 22px", borderRadius: 10,
              border: "1px solid var(--qc-hair)", borderLeft: "4px solid var(--qc-hair)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {/* Icon + name + status badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Shimmer style={{ width: 36, height: 36, flexShrink: 0 }} rounded={8} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <Shimmer style={{ height: 13, width: "70%" }} rounded={4} />
                  <Shimmer style={{ height: 9, width: "50%" }} rounded={4} />
                </div>
                <Shimmer style={{ height: 22, width: 72, flexShrink: 0 }} rounded={4} />
              </div>
              {/* Dashed divider */}
              <Shimmer style={{ height: 1, opacity: 0.4 }} rounded={0} />
              {/* Description lines */}
              <Shimmer style={{ height: 13, width: "95%" }} rounded={4} />
              <Shimmer style={{ height: 13, width: "78%" }} rounded={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightSignalMapSkeleton() {
  return (
    <div className="rounded-[10px] p-2" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", display: "flex", flexDirection: "column", flex: 1 }}>
      {/* SectionPanel header: sans title + subtitle */}
      <div style={{ padding: "4px 8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <Shimmer style={{ height: 13, width: 90 }} rounded={4} />
        <Shimmer style={{ height: 11, width: 220 }} rounded={4} />
      </div>
      <div className="rounded-[10px] p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)", flex: 1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            /* SignalTile: colored bg border + label + sentiment value */
            <div key={i} style={{
              borderRadius: 8, border: "1px solid var(--qc-hair)",
              padding: "10px 12px",
              display: "flex", flexDirection: "column", gap: 5,
              background: "var(--qc-section)",
            }}>
              <Shimmer style={{ height: 11, width: "70%" }} rounded={4} />
              <Shimmer style={{ height: 13, width: "55%" }} rounded={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightPageSkeleton() {
  return (
    <ScreenerPageShell>
      <div className="px-3 sm:px-6 pt-3 space-y-3">
        <InsightScorecardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.2fr]" style={{ gap: 12 }}>
          <InsightLensesSkeleton />
          <InsightSignalMapSkeleton />
        </div>
      </div>
    </ScreenerPageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<InsightType, string> = {
  management: "Management Factor",
  opportunity: "Opportunity Factor",
  deal: "Deal Factor",
};

const TYPE_VERDICT_LABELS: Record<InsightType, string> = {
  management: "MANAGEMENT VERDICT",
  opportunity: "OPPORTUNITY VERDICT",
  deal: "DEAL VERDICT",
};

// Card subtitles — the second line of the fundamentals-style card header. Kept
// short so they never wrap past one line in the card header.
const TYPE_LENS_SUBTITLES: Record<InsightType, string> = {
  management: "Scored assessment across each management lens",
  opportunity: "Scored assessment across each opportunity lens",
  deal: "Scored assessment across each deal lens",
};

// ─── Empty / error states ──────────────────────────────────────────────────────

function CenteredMessage({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
      <p style={{ fontSize: "var(--qc-fz-13)", color: error ? "var(--qc-down)" : "var(--qc-ink-3)" }}>{children}</p>
    </div>
  );
}

// ─── Dashboard layout ──────────────────────────────────────────────────────────

function FactorConvictionScore({ score, verdict }: { score: number | undefined; verdict: string | undefined }) {
  const v = (verdict ?? "").toLowerCase();
  let barColor = "var(--qc-warn)";
  if (v === "strong") barColor = "var(--qc-up)";
  else if (v === "moderate") barColor = "var(--qc-warn)";
  else if (v === "cautious") barColor = "var(--qc-warn)";
  else if (v === "weak") barColor = "var(--qc-down)";

  const barWidth = score != null ? `${Math.min(100, Math.max(0, score))}%` : "50%";
  
  // Format the text: STRONG — 85/100
  const scoreText = score != null ? `${(verdict || "UNKNOWN").toUpperCase()} — ${score}/100` : (verdict || "UNKNOWN").toUpperCase();

  return (
    <div className="rounded-[10px] px-4 py-3 flex flex-col gap-2" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Conviction</span>
        <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", color: barColor, fontFamily: "var(--qc-font-sans)" }}>{scoreText}</span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: barWidth, background: barColor, transition: "width .4s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {["Low", "Medium", "High"].map((l) => (
          <span key={l} style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function InsightDashboard({
  insight,
  type,
  ticker,
  screenerData,
  injectedLenses = [],
}: {
  insight: import("@/types/analysis").InsightData;
  type: InsightType;
  ticker: string;
  screenerData: ScreenerData | null;
  // Lenses cloned from another pillar (e.g. Industry Analysis onto Deal). Rendered
  // in the grid after the native lenses; the drawer resolves their detail below.
  injectedLenses?: InsightLens[];
}) {
  const [activeLensSlug, setActiveLensSlug] = useState<string | null>(null);
  const { lenses: lensDetails } = useLenses(ticker);
  const isBfsi = screenerData?.company?.isBfsi ?? false;

  const handleLensClick = useCallback((slug: string) => {
    setActiveLensSlug(slug);
  }, []);

  // Drawer detail lookup: prefer this pillar's details, but fall back to ANY
  // category so an injected/cloned lens (whose detail lives under another pillar)
  // still resolves its drawer content.
  // Add a slug alias map because L3 might return one slug while L2 API returns another.
  const SLUG_ALIASES: Record<string, string[]> = {
    "pe-rerating-potential": ["earning-quality", "earnings-quality", "earnings_quality"],
    "earning-quality": ["pe-rerating-potential", "earnings-quality", "earnings_quality"],
    "earnings-quality": ["pe-rerating-potential", "earning-quality", "earnings_quality"],
    "earnings_quality": ["pe-rerating-potential", "earning-quality", "earnings-quality"],
    "industry": ["industry-analysis"],
    "industry-analysis": ["industry"],
  };

  // Patch L3 lenses with real scores/status/description from L2 (lensDetails)
  // because L3 Deal API sometimes returns empty shell for earning-quality.
  const patchedNativeLenses = insight.lenses.map(lens => {
    let l2Match = lensDetails[type]?.find(l => l.slug === lens.slug || SLUG_ALIASES[lens.slug]?.includes(l.slug));
    if (!l2Match) {
      l2Match = Object.values(lensDetails).flat().find(l => l.slug === lens.slug || SLUG_ALIASES[lens.slug]?.includes(l.slug));
    }
    
    if (l2Match && l2Match.score != null && l2Match.score > 0 && l2Match.status) {
      return {
        ...lens,
        slug: l2Match.slug,
        score: l2Match.score,
        status: l2Match.status,
        // Only override description if L2 has a meaningful takeaway, otherwise keep L3 description.
        description: l2Match.takeaway || l2Match.description || lens.description,
      };
    }
    return lens;
  });

  const patchedInjectedLenses = injectedLenses.map(lens => {
    let l2Match = lensDetails["opportunity"]?.find(l => l.slug === lens.slug || SLUG_ALIASES[lens.slug]?.includes(l.slug));
    if (!l2Match) {
      l2Match = Object.values(lensDetails).flat().find(l => l.slug === lens.slug || SLUG_ALIASES[lens.slug]?.includes(l.slug));
    }
    if (l2Match && l2Match.score != null && l2Match.score > 0 && l2Match.status) {
      return {
        ...lens,
        slug: l2Match.slug,
        score: l2Match.score,
        status: l2Match.status,
        description: l2Match.takeaway || l2Match.description || lens.description,
      };
    }
    return lens;
  });

  // Scorecard lenses = native lenses plus any injected (cloned) ones — this drives
  // the radar axes + score-breakdown tiles so the cloned Industry lens still shows
  // there. The bottom "…lenses" section grid, however, lists native lenses ONLY
  // (see below), so the clone is intentionally absent from that card. Guard against
  // a duplicate slug in case the backend ever starts serving the injected lens too.
  const scorecardLenses = patchedInjectedLenses.length
    ? [...patchedNativeLenses, ...patchedInjectedLenses.filter((l) => !patchedNativeLenses.some((n) => n.slug === l.slug))]
    : patchedNativeLenses;

  const activeLens = activeLensSlug
    ? (lensDetails[type] ?? []).find((l) => l.slug === activeLensSlug || SLUG_ALIASES[activeLensSlug]?.includes(l.slug))
        ?? Object.values(lensDetails).flat().find((l) => l.slug === activeLensSlug || SLUG_ALIASES[activeLensSlug]?.includes(l.slug))
        ?? null
    : null;

  const lensHeading = `${TYPE_LABELS[type]} Lenses`;

  return (
    <>
      <div className="px-3 sm:px-6 pt-3 space-y-3">
        <div id="section-score">
          <InsightScorecard insight={insight} verdictLabel={TYPE_VERDICT_LABELS[type]} onLensClick={handleLensClick} lenses={scorecardLenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.2fr]" style={{ gap: 12, alignItems: "stretch" }}>
          {patchedNativeLenses.length > 0 && (
            <div id="section-lenses" style={{ display: "flex", flexDirection: "column" }}>
              {/* Native lenses only — the cloned Industry lens lives on the scorecard
                  radar/tiles above, not in this per-pillar lens grid. */}
              <InsightLenses lenses={patchedNativeLenses} heading={lensHeading} subtitle={TYPE_LENS_SUBTITLES[type]} onLensClick={handleLensClick} />
            </div>
          )}
          {insight.signal_map.length > 0 && (
            <div id="section-signal-map" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <InsightSignalMap signals={insight.signal_map} heading="Signals" subtitle="Positive and caution signals" />
              <FactorConvictionScore score={insight.score} verdict={insight.verdict} />
            </div>
          )}
        </div>
      </div>

      <LensDrawer lens={activeLens} onClose={() => setActiveLensSlug(null)} ticker={ticker} isBfsi={isBfsi} />
    </>
  );
}

// ─── Inner content (needs useSearchParams so must be wrapped in Suspense) ─────

function InsightTabContent({ type }: { type: InsightType }) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const { getInsight, loading: insightLoading, error: insightError } = useAnalysis(symbol);
  const { data: screenerData } = useScreenerData(symbol);
  let insight = getInsight(type);

  // Frontend-only clone: surface the Opportunity page's Industry Analysis lens on
  // the Deal page too. Pull it from the already-fetched opportunity insight so no
  // extra request is made and the card mirrors its source exactly.
  const opportunityInsight = getInsight("opportunity");
  const injectedLenses =
    type === "deal"
      ? (opportunityInsight?.lenses ?? []).filter((l) => l.slug === INDUSTRY_LENS_SLUG || l.slug === "industry")
      : [];

  const companyInfo = screenerData?.company
    ? { name: screenerData.company.name, exchange: screenerData.company.exchange, sector: screenerData.company.sector, industry: screenerData.company.industry }
    : null;

  if (!symbol) return <CenteredMessage error>No symbol provided</CenteredMessage>;
  if (insightLoading) return (
    <>
      <InsightPageSkeleton />
      <AssetActionBar ticker={symbol} />
    </>
  );

  // No completed analysis for this asset yet (endpoint returned no result for
  // this type, or a not-found/404). Show a clean "check back later" empty state
  // inside the normal shell so the company header + action bar stay consistent.
  if (!insight) {
    return (
      <>
        <ScreenerPageShell companyInfo={companyInfo}>
          <InsightEmptyState type={type} company={screenerData?.company?.name ?? symbol} />
        </ScreenerPageShell>
        <AssetActionBar ticker={symbol} />
      </>
    );
  }

  // Non-empty error that isn't just "no data" — surface it, but the empty state
  // above already covers the common no-analysis case.
  if (insightError && !insight) return <CenteredMessage error>Error: {insightError}</CenteredMessage>;

  // Underline sub-tabs so screener scaffolding matches Overview (audit: this page
  // dropped the secondary nav). Only include sections that actually render.
  const navItems = [
    { id: "section-score", label: `${TYPE_LABELS[type]} Score` },
    insight.lenses.length > 0 && { id: "section-lenses", label: `${TYPE_LABELS[type]} Lenses` },
    insight.signal_map.length > 0 && { id: "section-signal-map", label: "Signals" },
  ].filter((x): x is { id: string; label: string } => Boolean(x));

  return (
    <>
      <ScreenerPageShell companyInfo={companyInfo} navItems={navItems}>
        <InsightDashboard insight={insight} type={type} ticker={symbol} screenerData={screenerData} injectedLenses={injectedLenses} />
      </ScreenerPageShell>
      <AssetActionBar ticker={symbol} />
    </>
  );
}

// ─── Public component ──────────────────────────────────────────────────────────

export function InsightTab({ type }: { type: InsightType }) {
  return (
    <Suspense fallback={<CenteredMessage>Loading...</CenteredMessage>}>
      <InsightTabContent type={type} />
    </Suspense>
  );
}
