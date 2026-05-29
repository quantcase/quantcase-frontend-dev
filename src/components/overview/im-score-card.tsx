"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { InsightData, InsightLens } from "@/types/analysis";
import type { OverviewAnalysis } from "@/types/overview";
import { SectionShell, InlineMd } from "./primitives";

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

// Traffic light from score percentage only — API `status` field is not reliable
// (backend sets it to "STRONG" for all lenses regardless of relative quality)
function lensTrafficLight(lens: InsightLens): "positive" | "negative" | "neutral" {
  const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
  if (pct >= 75) return "positive";
  if (pct >= 55) return "neutral";
  return "negative";
}

function trafficColor(t: "positive" | "negative" | "neutral") {
  if (t === "positive") return { dot: "#16a34a", bg: "#f0fdf4", border: "rgba(22,163,74,0.20)", text: "#15803d" };
  if (t === "negative") return { dot: "#dc2626", bg: "#fef2f2", border: "rgba(220,38,38,0.20)", text: "#b91c1c" };
  return { dot: "#d97706", bg: "#fffbeb", border: "rgba(217,119,6,0.20)", text: "#b45309" };
}

// verdict_band drives the ring color — it's the contextual/relative rating the backend computes.
// `verdict` ("STRONG") is just a raw score threshold label and is not meaningful here.
function verdictBandColor(verdictBand: string) {
  const b = (verdictBand ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH") || b.includes("GOOD")) {
    return { color: "#16a34a", bg: "#f0fdf4", border: "#16a34a" };
  }
  if (b.includes("WEAK") || b.includes("LOW") || b.includes("POOR") || b.includes("SELL")) {
    return { color: "#dc2626", bg: "#fef2f2", border: "#dc2626" };
  }
  // MODERATE BAND, NEUTRAL, or unknown
  return { color: "#d97706", bg: "#fffbeb", border: "#d97706" };
}

// Capitalize each word
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function LensRow({ lens }: { lens: InsightLens }) {
  const traffic = lensTrafficLight(lens);
  const colors = trafficColor(traffic);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderLeft: `3px solid ${colors.dot}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-9)",
            letterSpacing: "var(--qc-track-eyebrow-l)",
            textTransform: "uppercase",
            color: "var(--qc-ink-2)",
            marginBottom: 3,
          }}
        >
          {lens.name}
        </div>
        {lens.subtitle ? (
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-11)",
              fontWeight: "var(--qc-w-semi)",
              padding: "2px 8px",
              borderRadius: 5,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              letterSpacing: ".01em",
            }}
          >
            {toTitleCase(lens.subtitle)}
          </span>
        ) : (
          <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-3)", fontStyle: "italic" }}>
            —
          </span>
        )}
      </div>
    </div>
  );
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
  const ring = hasData ? verdictBandColor(insight.verdict_band) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--qc-card)",
        border: `1px solid ${hovered ? "var(--qc-ink-2)" : "var(--qc-hair)"}`,
        borderRadius: 14,
        padding: "18px 18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minWidth: 0,
        position: "relative",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.07)" : "none",
      }}
    >
      {/* Header: label + verdict_band on left, score ring on right — tight row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingTop: 2 }}>
          <span
            style={{
              fontFamily: "var(--qc-font-mono)",
              fontSize: "var(--qc-fz-10)",
              letterSpacing: ".16em",
              color: "var(--qc-ink-2)",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
          {hasData && insight.verdict_band && (
            <span
              style={{
                fontFamily: "var(--qc-font-sans)",
                fontSize: "var(--qc-fz-12)",
                color: ring ? ring.color : "var(--qc-ink)",
                fontWeight: "var(--qc-w-semi)",
                lineHeight: 1.3,
                letterSpacing: ".01em",
              }}
            >
              {toTitleCase(insight.verdict_band)}
            </span>
          )}
        </div>

        {/* Score ring */}
        {ring !== null && score !== null && hasData && (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: `2.5px solid ${ring.border}`,
              background: ring.bg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-18)",
                fontWeight: "var(--qc-w-bold)",
                color: ring.color,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-9)",
                color: ring.color,
                opacity: 0.7,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginTop: 1,
              }}
            >
              /100
            </span>
          </div>
        )}
        {!hasData && (
          <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-2)", fontStyle: "italic" }}>N/A</span>
        )}
      </div>

      {/* Divider */}
      {hasData && insight.lenses.length > 0 && (
        <div style={{ height: 1, background: "var(--qc-hair)", marginBottom: 10 }} />
      )}

      {/* Lens rows */}
      {hasData && insight.lenses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {insight.lenses.map((lens) => (
            <LensRow key={lens.slug} lens={lens} />
          ))}
        </div>
      )}

      {/* Hover arrow — absolute bottom-right */}
      <Link
        href={dest}
        aria-label={`Go to ${label} page`}
        style={{
          position: "absolute",
          bottom: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "var(--qc-ink)",
          color: "var(--qc-card)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(0.6)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          pointerEvents: hovered ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ArrowUpRight size={13} strokeWidth={2.5} />
      </Link>
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
      <div style={{ marginBottom: 16 }}>
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
        <p style={{ margin: 0, fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-ink)", lineHeight: 1.65, fontWeight: "var(--qc-w-regular)" }}>
          <InlineMd text={overviewNarrative} />
        </p>
      </div>
    );
  }

  const parts: { bold: string; rest: string }[] = [];
  if (management?.description) {
    parts.push({ bold: "Management", rest: " — " + management.description.split(".")[0] + ". " });
  }
  if (opportunity?.description) {
    parts.push({ bold: "Opportunity", rest: " — " + opportunity.description.split(".")[0] + ". " });
  }
  if (deal?.description) {
    parts.push({ bold: "Deal", rest: " — " + deal.description.split(".")[0] + "." });
  }
  if (parts.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
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
      <p style={{ margin: 0, fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-ink)", lineHeight: 1.65 }}>
        {parts.map((p, i) => (
          <span key={i}>
            <strong style={{ fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>{p.bold}</strong>
            {p.rest}
          </span>
        ))}
      </p>
    </div>
  );
}

export function IMScoreCard({ management, opportunity, deal, overviewData }: IMScoreCardProps) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

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
        <NarrativeBar
          management={management}
          opportunity={opportunity}
          deal={deal}
          overviewNarrative={overviewNarrative}
        />
        <div
          className="grid grid-cols-1 sm:grid-cols-3"
          style={{ gap: 12 }}
        >
          {PILLAR_META.map(({ key, label, href }) => {
            const insight = key === "management" ? management : key === "opportunity" ? opportunity : deal;
            return (
              <PillarColumn key={key} insight={insight} label={label} href={href} symbol={symbol} />
            );
          })}
        </div>
      </SectionShell>
    </div>
  );
}
