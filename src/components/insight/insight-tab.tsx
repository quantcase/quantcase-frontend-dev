"use client";

import React, { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useAnalyzeTrigger } from "@/hooks/useAnalyzeTrigger";
import { useLenses } from "@/hooks/useLenses";
import { useScreenerData } from "@/hooks/useScreenerData";
import type { ScreenerData } from "@/types/screener";

import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { AssetActionBar } from "@/components/molecules/asset-action-bar";
import { InsightScorecard } from "@/components/insight/insight-scorecard";
import { InsightLenses } from "@/components/insight/insight-lenses";
import { InsightSignalMap } from "@/components/insight/insight-signal-map";
import { LensDrawer } from "@/components/insight/lens-drawer";

import type { InsightType } from "@/types/analysis";
import type { TranscriptCall } from "@/types/management";


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
        <polygon key={i} points={ringPoints(r)} fill="none" stroke="#CCCCCC" strokeWidth={i === 2 ? 1.2 : 0.9} strokeDasharray={i === 2 ? "3 3" : undefined} />
      ))}
      {/* Axis spokes */}
      {axes.map((pt, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#CCCCCC" strokeWidth={0.9} />
      ))}
      {/* Shimmer data polygon — animated via CSS class */}
      <polygon points={dataPoints} className="skeleton-shimmer" style={{ fill: "#E0E0E0" }} strokeWidth={0} />
      {/* Polygon stroke outline */}
      <polygon points={dataPoints} fill="none" stroke="#BBBBBB" strokeWidth={1.5} strokeLinejoin="round" />
      {/* Center score placeholder */}
      <rect x={cx - 14} y={cy - 8} width={28} height={14} rx={3} fill="#D5D5D5" />
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
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f172a 100%)",
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
      {/* SectionHeader: large 34px serif heading + count pip */}
      <div style={{ padding: "10px 12px 16px", display: "flex", alignItems: "flex-end", gap: 10 }}>
        <Shimmer style={{ height: 34, width: 260 }} rounded={5} />
        <Shimmer style={{ height: 22, width: 28, marginBottom: 3 }} rounded={4} />
      </div>
      <div className="rounded-[10px] p-3" style={{ background: "var(--qc-card)", flex: 1 }}>
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
      {/* SectionHeader: large serif heading + count pip */}
      <div style={{ padding: "10px 12px 16px", display: "flex", alignItems: "flex-end", gap: 10 }}>
        <Shimmer style={{ height: 34, width: 100 }} rounded={5} />
        <Shimmer style={{ height: 22, width: 28, marginBottom: 3 }} rounded={4} />
      </div>
      <div className="rounded-[10px] p-3" style={{ background: "var(--qc-card)", flex: 1 }}>
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

// ─── Analyze prompt ────────────────────────────────────────────────────────────

function AnalyzePromptCard({
  transcriptCall,
  type,
  isAnalyzing,
  aggregateStatus,
  progress,
  analyzeError,
  onAnalyze,
}: {
  transcriptCall: TranscriptCall;
  type: InsightType;
  isAnalyzing: boolean;
  aggregateStatus: string | null;
  progress: number;
  analyzeError: string | null;
  onAnalyze: () => void;
}) {
  const buttonLabel = isAnalyzing
    ? aggregateStatus === "pending" ? "Queued..."
    : aggregateStatus === "processing" ? "Processing..."
    : "Starting..."
    : "Analyze";

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--qc-bg)" }}>
      <div className="w-full max-w-lg space-y-4">
        {/* Call info card */}
        <div className="rounded-[10px] p-5" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)", marginBottom: 4 }}>
            {TYPE_LABELS[type]} Analysis
          </p>
          <h2 style={{ fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-regular)", color: "var(--qc-ink)", margin: "0 0 2px", fontFamily: "var(--qc-font-serif)" }}>{transcriptCall.company_name}</h2>
          {transcriptCall.basic_industry && (
            <p style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-3)" }}>{transcriptCall.basic_industry}</p>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--qc-hair)" }}>
            {transcriptCall.company && (
              <div>
                <p style={{ fontSize: "var(--qc-fz-10)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)" }}>Ticker</p>
                <p style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>{transcriptCall.company}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: "var(--qc-fz-10)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)" }}>Quarter</p>
              <p style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--qc-fz-10)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)" }}>Call Date</p>
              <p style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>{transcriptCall.call_date}</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--qc-fz-10)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)" }}>Call ID</p>
              <p style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-mono)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", letterSpacing: "var(--qc-track-mono)" }}>{transcriptCall.id}</p>
            </div>
          </div>
        </div>

        {/* Action card */}
        <div className="rounded-[10px] p-5 space-y-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
          {!isAnalyzing && !analyzeError && (
            <p style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-3)" }}>No {TYPE_LABELS[type].toLowerCase()} analysis available yet.</p>
          )}
          {analyzeError && (
            <p style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-down)" }}>{analyzeError}</p>
          )}
          {aggregateStatus === "processing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-blue)" }}>Analyzing transcripts...</p>
                <p style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-blue)" }}>{progress}%</p>
              </div>
              <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "var(--qc-blue-soft)" }}>
                <div className="h-full transition-all duration-300 ease-linear" style={{ width: `${progress}%`, background: "var(--qc-blue)" }} />
              </div>
            </div>
          )}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full font-semibold py-3 px-4 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--qc-ink)", color: "var(--qc-on-dark)", fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)" }}
          >
            {buttonLabel}
          </button>
          {transcriptCall.ppt_url && (
            <a
              href={transcriptCall.ppt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center hover:underline transition-colors"
              style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-3)" }}
            >
              View Presentation →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty / error states ──────────────────────────────────────────────────────

function CenteredMessage({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
      <p style={{ fontSize: "var(--qc-fz-13)", color: error ? "var(--qc-down)" : "var(--qc-ink-3)" }}>{children}</p>
    </div>
  );
}

// ─── Dashboard layout ──────────────────────────────────────────────────────────

function InsightDashboard({
  insight,
  type,
  ticker,
  screenerData,
}: {
  insight: import("@/types/analysis").InsightData;
  type: InsightType;
  ticker: string;
  screenerData: ScreenerData | null;
}) {
  const [activeLensSlug, setActiveLensSlug] = useState<string | null>(null);
  const { lenses: lensDetails } = useLenses(ticker);
  const isBfsi = screenerData?.company?.isBfsi ?? false;

  const handleLensClick = useCallback((slug: string) => {
    setActiveLensSlug(slug);
  }, []);

  const activeLens = activeLensSlug
    ? (lensDetails[type] ?? []).find((l) => l.slug === activeLensSlug) ?? null
    : null;

  const lensHeading = `${TYPE_LABELS[type]} lenses`;

  return (
    <>
      <div className="px-3 sm:px-6 pt-3 space-y-3">
        <div id="section-score">
          <InsightScorecard insight={insight} verdictLabel={TYPE_VERDICT_LABELS[type]} onLensClick={handleLensClick} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.2fr]" style={{ gap: 12, alignItems: "stretch" }}>
          {insight.lenses.length > 0 && (
            <div id="section-lenses" style={{ display: "flex", flexDirection: "column" }}>
              <InsightLenses lenses={insight.lenses} heading={lensHeading} onLensClick={handleLensClick} />
            </div>
          )}
          {insight.signal_map.length > 0 && (
            <div id="section-signal-map" style={{ display: "flex", flexDirection: "column" }}>
              <InsightSignalMap signals={insight.signal_map} heading="Signals" />
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

  const { data: transcriptCalls, loading: callsLoading, error: callsError } = useTranscriptCalls(symbol);
  const firstCallId = transcriptCalls[0]?.id ?? "";
  const { getInsight, loading: insightLoading } = useAnalysis(symbol);
  const { data: screenerData } = useScreenerData(symbol);
  const insight = getInsight(type);

  const { isAnalyzing, analyzeError, aggregateStatus, progress, trigger } = useAnalyzeTrigger({
    callId: firstCallId,
    types: [type],
    onComplete: () => window.location.reload(),
  });

  const companyInfo = screenerData?.company
    ? { name: screenerData.company.name, exchange: screenerData.company.exchange, sector: screenerData.company.sector, industry: screenerData.company.industry }
    : null;

  if (!symbol) return <CenteredMessage error>No symbol provided</CenteredMessage>;
  if (callsLoading || insightLoading) return (
    <>
      <InsightPageSkeleton />
      <AssetActionBar ticker={symbol} />
    </>
  );
  if (callsError) return <CenteredMessage error>Error: {callsError}</CenteredMessage>;
  if (transcriptCalls.length === 0) return <CenteredMessage>No transcript calls found for {symbol}</CenteredMessage>;

  if (!insight) {
    return (
      <AnalyzePromptCard
        transcriptCall={transcriptCalls[0]}
        type={type}
        isAnalyzing={isAnalyzing}
        aggregateStatus={aggregateStatus}
        progress={progress}
        analyzeError={analyzeError}
        onAnalyze={trigger}
      />
    );
  }

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
        <InsightDashboard insight={insight} type={type} ticker={symbol} screenerData={screenerData} />
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
