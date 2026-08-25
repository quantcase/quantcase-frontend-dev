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

// ── Pattern card ──────────────────────────────────────────────────────────────
function PatternCard({
  pattern,
  href,
  symbol,
  index,
}: {
  pattern: OverviewPillarPattern;
  href: string;
  symbol: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const dest = `${href}?symbol=${encodeURIComponent(symbol)}`;
  const meta = PILLAR_META[pattern.pillar];
  
  const bullets = pattern.snapshot.split(';').map(s => s.replace(/\*\*/g, '').trim()).filter(Boolean);
  const numStr = (index + 1).toString().padStart(2, "0");

  return (
    <Link
      href={dest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
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
        style={{
          width: 64,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-12)",
          color: "var(--qc-ink-3)",
        }}
      >
        {numStr}
      </div>

      {/* Content Column */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          padding: "24px 24px 24px 0",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          {/* Colored Line */}
          <div
            style={{
              width: 4,
              backgroundColor: meta.color,
              flexShrink: 0,
              marginRight: 24,
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

      {/* Chevron affordance */}
      <div style={{ display: "flex", alignItems: "center", paddingRight: 20 }}>
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

        <div className="overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 480 }}>
            {rankedPatterns.map((p, index) => (
              <PatternCard
                key={p.pillar}
                pattern={p}
                href={PILLAR_META[p.pillar].href}
                symbol={symbol}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
