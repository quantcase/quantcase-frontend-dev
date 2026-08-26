"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { InsightData } from "@/types/analysis";
import type { OverviewAnalysis, OverviewPillarPattern } from "@/types/overview";
import { SectionShell } from "./primitives";

interface IMScoreCardProps {
  management: InsightData | null;
  opportunity: InsightData | null;
  deal: InsightData | null;
  overviewData?: OverviewAnalysis | null;
}

const PILLAR_META = {
  management: { label: "Management", href: "/screener/management", color: "var(--qc-blue)" },
  opportunity: { label: "Opportunity", href: "/screener/opportunity", color: "var(--qc-up)" },
  deal: { label: "Deal", href: "/screener/deal", color: "var(--qc-golden-ink)" },
} as const;

type PillarKey = keyof typeof PILLAR_META;

// Turn *emphasis* markers from the L4 title into accented spans.
function EmphasisTitle({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
          <em key={i} style={{ fontStyle: "normal", color: "var(--qc-ink)", fontWeight: "var(--qc-w-medium)" }}>
            {p.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ── Score Donut ─────────────────────────────────────────────────────────────
function ScoreDonut({ score, color }: { score: number; color: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={44} height={44} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={22}
          cy={22}
          r={radius}
          fill="none"
          stroke="var(--qc-hair)"
          strokeWidth={3}
        />
        <circle
          cx={22}
          cy={22}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          position: "absolute",
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-11)",
          fontWeight: "var(--qc-w-semi)",
          color: "var(--qc-ink)",
        }}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}

// ── Pattern card ──────────────────────────────────────────────────────────────
function PatternCard({
  pattern,
  href,
  symbol,
  index,
  score,
}: {
  pattern: OverviewPillarPattern;
  href: string;
  symbol: string;
  index: number;
  score?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const dest = `${href}?symbol=${encodeURIComponent(symbol)}`;
  const meta = PILLAR_META[pattern.pillar];
  
  let bullets = pattern.snapshot
    .split(/(?:\.\s+|;|\*\*|\n|•)+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map(s => s.replace(/[*;]/g, '').trim())
    .filter(Boolean);
  const numStr = (index + 1).toString().padStart(2, "0");

  return (
    <Link
      href={dest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-row"
      style={{
        textDecoration: "none",
        background: "var(--qc-card)",
        border: `1px solid ${hovered ? "var(--qc-ink-2)" : "var(--qc-hair)"}`,
        borderRadius: 14,
        position: "relative",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: hovered ? "0 2px 14px rgba(0,0,0,0.06)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Number Column */}
      <div
        className="w-12 sm:w-16 shrink-0 flex items-center justify-center"
        style={{
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-12)",
          color: "var(--qc-ink-3)",
        }}
      >
        {numStr}
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0 flex flex-col py-4 pr-3 sm:py-6 sm:pr-0">
        <div style={{ display: "flex", flex: 1 }}>
          {/* Colored Line */}
          <div
            className="shrink-0 mr-4 sm:mr-6"
            style={{
              width: 4,
              backgroundColor: meta.color,
            }}
          />

          {/* Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
             {/* Eyebrow */}
             <div
               style={{
                 fontFamily: "var(--qc-font-mono)",
                 fontSize: "var(--qc-fz-10)",
                 letterSpacing: ".14em",
                 textTransform: "uppercase",
                 color: meta.color,
                 fontWeight: "var(--qc-w-semi)",
                 marginBottom: 8,
               }}
             >
               {meta.label}
             </div>
             
             {/* Title */}
             <div
               style={{
                 fontFamily: "var(--qc-font-sans)",
                 fontSize: "var(--qc-fz-18)",
                 fontWeight: "var(--qc-w-semi)",
                 color: "var(--qc-ink)",
                 letterSpacing: "-0.01em",
                 lineHeight: 1.25,
                 marginBottom: 16,
               }}
             >
               {pattern.name}
             </div>
             
             {/* Divider */}
             <div style={{ height: 1, background: "var(--qc-hair)", marginBottom: 16 }} />

             {/* Bullets */}
             <ul
               style={{
                 margin: 0,
                 paddingLeft: 20,
                 fontFamily: "var(--qc-font-sans)",
                 fontSize: "var(--qc-fz-14)",
                 color: "var(--qc-ink-2)",
                 lineHeight: 1.6,
                 display: "flex",
                 flexDirection: "column",
                 gap: 8,
               }}
             >
               {bullets.map((bullet, i) => (
                 <li key={i}>{bullet}</li>
               ))}
             </ul>
          </div>
        </div>
      </div>

      {/* Score Donut */}
      {score !== undefined && (
        <div className="flex items-center px-2 sm:px-4 shrink-0">
          <ScoreDonut score={score} color={meta.color} />
        </div>
      )}

      {/* Chevron affordance */}
      <div className="flex items-center pr-4 sm:pr-6 shrink-0">
        <ChevronRight
          size={15}
          strokeWidth={2}
          style={{
            color: "var(--qc-ink-3)",
            opacity: hovered ? 1 : 0.5,
            transform: hovered ? "translateX(2px)" : "none",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        />
      </div>
    </Link>
  );
}



// ── Empty fallback (no L4 pattern data) ───────────────────────────────────────
function NarrativeFallback({
  management,
  opportunity,
  deal,
}: {
  management: InsightData | null;
  opportunity: InsightData | null;
  deal: InsightData | null;
}) {
  const parts: { bold: string; rest: string }[] = [];
  if (management?.description) parts.push({ bold: "Management", rest: " — " + management.description.split(".")[0] + ". " });
  if (opportunity?.description) parts.push({ bold: "Opportunity", rest: " — " + opportunity.description.split(".")[0] + ". " });
  if (deal?.description) parts.push({ bold: "Deal", rest: " — " + deal.description.split(".")[0] + "." });
  if (parts.length === 0) return null;

  return (
    <p style={{ margin: 0, fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-ink)", lineHeight: 1.65 }}>
      {parts.map((p, i) => (
        <span key={i}>
          <strong style={{ fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>{p.bold}</strong>
          {p.rest}
        </span>
      ))}
    </p>
  );
}

export function IMScoreCard({ management, opportunity, deal, overviewData }: IMScoreCardProps) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

  const patterns = overviewData?.pillar_patterns ?? [];

  // No L4 pattern data → keep a lightweight narrative so the section never blanks.
  if (patterns.length === 0) {
    return (
      <SectionShell>
        <div
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-10)",
            letterSpacing: "var(--qc-track-eyebrow)",
            textTransform: "uppercase",
            color: "var(--qc-ink-2)",
            marginBottom: 8,
          }}
        >
          QC Insight
        </div>
        <NarrativeFallback management={management} opportunity={opportunity} deal={deal} />
      </SectionShell>
    );
  }

  // Order pattern cards by pillar score (impact), like Asian Paints "ranked by impact".
  const rankedPatterns = [...patterns].sort((a, b) => b.score - a.score);

  const title = overviewData?.headline ?? "";
  const subtitle = overviewData?.subtitle ?? "";

  return (
    <SectionShell>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-10)",
            letterSpacing: "var(--qc-track-eyebrow)",
            textTransform: "uppercase",
            color: "var(--qc-ink-3)",
            marginBottom: 10,
          }}
        >
          QC Intuition : Pattern Recognition
        </div>
        {title && (
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--qc-font-serif)",
              fontSize: "var(--qc-fz-26)",
              fontWeight: "var(--qc-w-regular)",
              lineHeight: 1.22,
              letterSpacing: "-0.01em",
              color: "var(--qc-ink)",
            }}
          >
            <EmphasisTitle text={title} />
          </h2>
        )}
        {subtitle && (
          <p
            style={{
              margin: "10px 0 0",
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-13)",
              color: "var(--qc-ink-2)",
              lineHeight: 1.55,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* ── What's moving the thesis ── */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--qc-font-mono)",
              fontSize: "var(--qc-fz-11)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--qc-ink)",
              fontWeight: "var(--qc-w-semi)",
            }}
          >
            What&apos;s moving the thesis
          </span>
          <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-3)" }}>
            ranked by impact · tap any card for the source statement
          </span>
        </div>

        <div className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rankedPatterns.map((p, index) => {
              let score: number | undefined;
              if (p.pillar === "management") score = management?.score;
              else if (p.pillar === "opportunity") score = opportunity?.score;
              else if (p.pillar === "deal") score = deal?.score;
              
              return (
                <PatternCard
                  key={p.pillar}
                  pattern={p}
                  href={PILLAR_META[p.pillar].href}
                  symbol={symbol}
                  index={index}
                  score={score}
                />
              );
            })}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
