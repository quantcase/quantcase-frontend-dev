"use client";

import type { InsightData } from "@/types/analysis";
import { SectionShell } from "./primitives";

interface IMScoreCardProps {
  management: InsightData | null;
  opportunity: InsightData | null;
  deal: InsightData | null;
}

const PILLAR_META = [
  { key: "management" as const, label: "Management" },
  { key: "opportunity" as const, label: "Opportunity" },
  { key: "deal" as const, label: "Deal" },
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

function PillarColumn({ insight, label }: { insight: InsightData | null; label: string }) {
  const score = insight?.score ?? null;
  const hasData = insight != null && insight.available;

  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 0,
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

      {/* Lens rows: name label above, subtitle badge below */}
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
}: {
  management: InsightData | null;
  opportunity: InsightData | null;
  deal: InsightData | null;
}) {
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
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 12.5,
        lineHeight: 1.65,
        color: "var(--qc-ink)",
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--qc-ink-2)",
          marginRight: 10,
        }}
      >
        QC Insight
      </span>
      {parts.map((p, i) => (
        <span key={i}>
          <strong style={{ fontWeight: 600, color: "var(--qc-ink)" }}>{p.bold}</strong>
          {p.rest}
          {i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
}

export function IMScoreCard({ management, opportunity, deal }: IMScoreCardProps) {
  return (
    <div>
      <SectionShell>
        <NarrativeBar management={management} opportunity={opportunity} deal={deal} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {PILLAR_META.map(({ key, label }) => {
            const insight = key === "management" ? management : key === "opportunity" ? opportunity : deal;
            return <PillarColumn key={key} insight={insight} label={label} />;
          })}
        </div>
      </SectionShell>
    </div>
  );
}
