"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { InsightData } from "@/types/analysis";
import type { OverviewAnalysis } from "@/types/overview";
import { SectionShell } from "./primitives";

// Render **bold** inline markdown
function InlineMd({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} style={{ color: "var(--qc-ink)", fontWeight: 600 }}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

interface IMScoreCardProps {
  management: InsightData | null;
  opportunity: InsightData | null;
  deal: InsightData | null;
  overviewData?: OverviewAnalysis | null;
}

const PILLAR_META = [
  { key: "management" as const, label: "Management", href: "/screener/management" },
  { key: "opportunity" as const, label: "Opportunity", href: "/screener/opportunity" },
  { key: "deal" as const, label: "Deal", href: "/screener/deal" },
];

function sentimentColor(s: "positive" | "negative" | "neutral"): string {
  if (s === "positive") return "var(--qc-up, #1F7A4A)";
  if (s === "negative") return "var(--qc-down, #B23A2F)";
  return "var(--qc-ink-2)";
}

function sentimentBg(s: "positive" | "negative" | "neutral"): string {
  if (s === "positive") return "var(--qc-up-soft, #EAF4EE)";
  if (s === "negative") return "var(--qc-down-soft, #FDECEA)";
  return "var(--qc-chip, #F2F1EC)";
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--qc-up, #1F7A4A)";
  if (score >= 50) return "var(--qc-warn, #B4731A)";
  return "var(--qc-down, #B23A2F)";
}

function PillarColumn({
  insight,
  label,
  href,
  symbol,
}: {
  insight: InsightData | null;
  label: string;
  href: string;
  symbol: string;
}) {
  const [hovered, setHovered] = useState(false);
  const score = insight?.score ?? null;
  const hasData = insight != null && insight.available;
  const dest = `${href}?symbol=${encodeURIComponent(symbol)}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--qc-card)",
        border: `1px solid ${hovered ? "var(--qc-ink-2)" : "var(--qc-hair)"}`,
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 0,
        position: "relative",
        transition: "border-color 0.15s ease",
        cursor: "default",
      }}
    >
      {/* Header: label + score */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: ".14em",
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Arrow link — visible on hover */}
          <Link
            href={dest}
            aria-label={`Go to ${label} page`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--qc-ink)",
              color: "var(--qc-card)",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1)" : "scale(0.7)",
              transition: "opacity 0.15s ease, transform 0.15s ease",
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </Link>

          {score !== null && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `2px solid ${scoreColor(score)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: sentimentBg(score >= 70 ? "positive" : score >= 50 ? "neutral" : "negative"),
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: scoreColor(score),
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {score}
              </span>
            </div>
          )}
          {!hasData && (
            <span style={{ fontSize: 11, color: "var(--qc-ink-2)", fontStyle: "italic" }}>
              N/A
            </span>
          )}
        </div>
      </div>

      {/* Lens rows */}
      {hasData && insight.lenses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {insight.lenses.map((lens) => {
            const pct = Math.round((lens.score / lens.max_score) * 100);
            const sentiment: "positive" | "negative" | "neutral" =
              pct >= 70 ? "positive" : pct >= 50 ? "neutral" : "negative";
            return (
              <div key={lens.slug} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--qc-ink-2)",
                  }}
                >
                  {lens.name}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: sentimentBg(sentiment),
                    color: sentimentColor(sentiment),
                  }}
                >
                  {lens.subtitle.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NarrativeBar({
  management,
  opportunity,
  deal,
  overviewNarrative,
}: {
  management: InsightData | null;
  opportunity: InsightData | null;
  deal: InsightData | null;
  overviewNarrative?: string | null;
}) {
  if (overviewNarrative) {
    return (
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "var(--qc-ink)",
            marginBottom: 8,
          }}
        >
          QC Insight
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--qc-ink)", lineHeight: 1.6 }}>
          <InlineMd text={overviewNarrative} />
        </p>
      </div>
    );
  }

  const parts: { bold: string; rest: string }[] = [];
  if (management?.description) {
    const first = management.description.split(".")[0];
    parts.push({ bold: "Management", rest: " " + first + "." });
  }
  if (opportunity?.description) {
    const first = opportunity.description.split(".")[0];
    parts.push({ bold: "Opportunity", rest: " " + first + "." });
  }
  if (deal?.description) {
    const first = deal.description.split(".")[0];
    parts.push({ bold: "Deal", rest: " " + first + "." });
  }
  if (parts.length === 0) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--qc-ink)",
          marginBottom: 8,
        }}
      >
        QC Insight
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "var(--qc-ink)", lineHeight: 1.6 }}>
        {parts.map((p, i) => (
          <span key={i}>
            <strong style={{ fontWeight: 600, color: "var(--qc-ink)" }}>{p.bold}</strong>
            {p.rest}
            {i < parts.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

export function IMScoreCard({ management, opportunity, deal, overviewData }: IMScoreCardProps) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

  // Build QC Insight narrative from overview dimensions when available
  const overviewNarrative = overviewData?.dimensions
    ? (() => {
        const parts: string[] = [];
        const dims = overviewData.dimensions.filter(d => d.headline && d.score != null && d.score > 0);
        for (const d of dims) {
          const label = d.type.charAt(0).toUpperCase() + d.type.slice(1);
          parts.push(`**${label}** — ${d.headline}`);
        }
        return parts.length > 0 ? parts.join("; ") + "." : null;
      })()
    : null;

  return (
    <div>
      <SectionShell>
        <NarrativeBar management={management} opportunity={opportunity} deal={deal} overviewNarrative={overviewNarrative} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {PILLAR_META.map(({ key, label, href }) => {
            const insight = key === "management" ? management : key === "opportunity" ? opportunity : deal;
            return <PillarColumn key={key} insight={insight} label={label} href={href} symbol={symbol} />;
          })}
        </div>
      </SectionShell>
    </div>
  );
}
