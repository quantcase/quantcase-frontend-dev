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

// ── trend → semantics ────────────────────────────────────────────────────────
// The pattern `trend` drives the mini-chart line color and the trend badge.
// rising = the thesis is improving (positive), falling = deteriorating (negative),
// steady = holding (neutral). Everything else falls back to neutral.
function trendSemantics(trend: string): {
  line: string;
  badge: { bg: string; text: string; label: string };
} {
  const t = (trend ?? "").toLowerCase();
  if (t.includes("ris") || t.includes("improv") || t.includes("up") || t.includes("accel")) {
    return { line: "var(--qc-up)", badge: { bg: "var(--qc-up-soft)", text: "var(--qc-up)", label: "Rising" } };
  }
  if (t.includes("fall") || t.includes("declin") || t.includes("down") || t.includes("soft") || t.includes("weak")) {
    return { line: "var(--qc-down)", badge: { bg: "var(--qc-down-soft)", text: "var(--qc-down)", label: "Softening" } };
  }
  return { line: "var(--qc-warn)", badge: { bg: "var(--qc-warn-soft)", text: "var(--qc-warn)", label: "Steady" } };
}

// rating word → semantic tone for the lens-grid rating pills.
function ratingTone(rating: string): "up" | "down" | "neutral" {
  const r = (rating ?? "").toLowerCase();
  if (
    r.includes("strong") || r.includes("excellent") || r.includes("disciplin") ||
    r.includes("achiev") || r.includes("clean") || r.includes("good") || r.includes("high")
  ) return "up";
  if (
    r.includes("weak") || r.includes("poor") || r.includes("soft") || r.includes("selective") ||
    r.includes("pressur") || r.includes("low") || r.includes("risk") || r.includes("capped")
  ) return "down";
  return "neutral";
}

function toneColor(tone: "up" | "down" | "neutral") {
  if (tone === "up") return { text: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  if (tone === "down") return { text: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  return { text: "var(--qc-ink-2)", bg: "var(--qc-chip, #F2F1EC)" };
}

// Turn *emphasis* markers from the L4 title into accented spans.
function EmphasisTitle({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
          <em key={i} style={{ fontStyle: "italic", color: "var(--qc-brand-chip)", fontWeight: "var(--qc-w-medium)" }}>
            {p.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ── MiniLineChart ─────────────────────────────────────────────────────────────
// Compact line chart from a `spark` series (values in any range), with a terminal
// dot and FY24 → FY26 baseline labels — the Asian-Paints pattern glyph.
function MiniLineChart({ values, color }: { values: number[]; color: string }) {
  const w = 132;
  const h = 56;
  const padY = 8;
  if (!values.length) {
    return <div style={{ width: w, height: h + 20 }} />;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const n = values.length;
  const pts = values.map((v, i) => {
    const x = n === 1 ? w / 2 : (i / (n - 1)) * w;
    const y = padY + (1 - (v - min) / range) * (h - padY * 2);
    return [x, y] as const;
  });
  const d = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: w, flexShrink: 0 }}>
      <svg width={w} height={h} style={{ display: "block", overflow: "visible" }} aria-hidden>
        <polyline
          points={d}
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={last[0]} cy={last[1]} r={3.5} fill={color} />
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-9)",
          letterSpacing: ".06em",
          color: "var(--qc-ink-3)",
        }}
      >
        <span>FY24</span>
        <span>FY26</span>
      </div>
    </div>
  );
}

// ── Routing chip ("Opportunity · Pricing power") ──────────────────────────────
function RouteChip({ pillar, lens }: { pillar: PillarKey; lens: string }) {
  // Deal routes read golden; management/opportunity read soft-green — matches the Asian Paints legend.
  const bg = pillar === "deal" ? "var(--qc-warn-soft)" : "var(--qc-up-soft)";
  const text = pillar === "deal" ? "var(--qc-golden-ink)" : "var(--qc-up)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 6,
        background: bg,
        color: text,
        fontFamily: "var(--qc-font-sans)",
        fontSize: "var(--qc-fz-11)",
        fontWeight: "var(--qc-w-medium)",
        letterSpacing: ".01em",
        whiteSpace: "nowrap",
      }}
    >
      {PILLAR_META[pillar].label} · {lens}
    </span>
  );
}

// ── Pattern card ──────────────────────────────────────────────────────────────
function PatternCard({
  pattern,
  href,
  symbol,
  isOverarching,
}: {
  pattern: OverviewPillarPattern;
  href: string;
  symbol: string;
  isOverarching: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const sem = trendSemantics(pattern.trend);
  const dest = `${href}?symbol=${encodeURIComponent(symbol)}`;

  // "Routes to" — the two strongest lenses of this pillar, as routing chips.
  const routes = [...pattern.lenses]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((l) => l.lens);

  return (
    <Link
      href={dest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        background: "var(--qc-card)",
        border: `1px solid ${hovered ? "var(--qc-ink-2)" : "var(--qc-hair)"}`,
        borderRadius: 14,
        padding: "18px 20px",
        position: "relative",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: hovered ? "0 2px 14px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* chevron affordance, top-right */}
      <ChevronRight
        size={15}
        strokeWidth={2}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          color: "var(--qc-ink-3)",
          opacity: hovered ? 1 : 0.5,
          transform: hovered ? "translateX(2px)" : "none",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      />

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* left rail: color dot + mini chart */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingTop: 2 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: sem.line,
              marginTop: 22,
              flexShrink: 0,
            }}
          />
          <MiniLineChart values={pattern.spark} color={sem.line} />
        </div>

        {/* right: title, badges, snapshot, routes */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "var(--qc-font-sans)",
                fontSize: "var(--qc-fz-16)",
                fontWeight: "var(--qc-w-semi)",
                color: "var(--qc-ink)",
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
              }}
            >
              {pattern.name}
            </span>
            <span
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-9)",
                fontWeight: "var(--qc-w-semi)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                padding: "2px 7px",
                borderRadius: 5,
                background: sem.badge.bg,
                color: sem.badge.text,
              }}
            >
              {sem.badge.label}
            </span>
            {isOverarching && (
              <span
                style={{
                  fontFamily: "var(--qc-font-mono)",
                  fontSize: "var(--qc-fz-9)",
                  fontWeight: "var(--qc-w-semi)",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  padding: "2px 7px",
                  borderRadius: 5,
                  background: "var(--qc-brand-accent-soft)",
                  color: "var(--qc-brand-accent)",
                }}
              >
                Overarching
              </span>
            )}
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-13)",
              color: "var(--qc-ink-2)",
              lineHeight: 1.6,
            }}
          >
            {pattern.snapshot}
          </p>

          {routes.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--qc-font-mono)",
                  fontSize: "var(--qc-fz-10)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--qc-ink-3)",
                  marginRight: 2,
                }}
              >
                Routes to
              </span>
              {routes.map((lens) => (
                <RouteChip key={lens} pillar={pattern.pillar} lens={lens} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Twelve-lenses grid ────────────────────────────────────────────────────────
function LensGridColumn({ pattern, symbol }: { pattern: OverviewPillarPattern; symbol: string }) {
  const meta = PILLAR_META[pattern.pillar];
  const dest = `${meta.href}?symbol=${encodeURIComponent(symbol)}`;

  return (
    <div style={{ minWidth: 0 }}>
      <Link
        href={dest}
        style={{
          display: "inline-block",
          textDecoration: "none",
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-11)",
          fontWeight: "var(--qc-w-semi)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: meta.color,
          marginBottom: 12,
        }}
      >
        {meta.label}
      </Link>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {pattern.lenses.map((lens, i) => {
          const tone = toneColor(ratingTone(lens.rating));
          return (
            <div
              key={lens.lens}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--qc-hair)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--qc-font-sans)",
                  fontSize: "var(--qc-fz-13)",
                  color: "var(--qc-ink)",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {lens.lens}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  fontFamily: "var(--qc-font-sans)",
                  fontSize: "var(--qc-fz-11)",
                  fontWeight: "var(--qc-w-semi)",
                  letterSpacing: ".01em",
                  padding: "2px 9px",
                  borderRadius: 6,
                  background: tone.bg,
                  color: tone.text,
                }}
              >
                {lens.rating || "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
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
  // A pattern is "overarching" when it touches ≥2 lenses (moves more than one sub-factor).
  const isOverarching = (p: OverviewPillarPattern) => p.lenses.length >= 2;

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
          QuantCase · Pattern Overview
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

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rankedPatterns.map((p) => (
            <PatternCard
              key={p.pillar}
              pattern={p}
              href={PILLAR_META[p.pillar].href}
              symbol={symbol}
              isOverarching={isOverarching(p)}
            />
          ))}
        </div>
      </div>

      {/* ── Go deeper · twelve lenses ── */}
      <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--qc-hair)" }}>
        <div
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-11)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--qc-ink-3)",
            marginBottom: 18,
          }}
        >
          Go deeper · twelve lenses
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 28 }}>
          {(["management", "opportunity", "deal"] as PillarKey[]).map((key) => {
            const p = patterns.find((x) => x.pillar === key);
            if (!p) return <div key={key} />;
            return <LensGridColumn key={key} pattern={p} symbol={symbol} />;
          })}
        </div>

        <p
          style={{
            margin: "22px 0 0",
            fontFamily: "var(--qc-font-sans)",
            fontSize: "var(--qc-fz-12)",
            color: "var(--qc-ink-3)",
            lineHeight: 1.6,
          }}
        >
          Patterns are detected across earnings calls, annual reports and decks, then routed by which lens
          sub-factors the underlying signals touch. A pattern moving two or more lenses is flagged{" "}
          <strong style={{ color: "var(--qc-ink-2)", fontWeight: "var(--qc-w-semi)" }}>overarching</strong> and
          surfaced above; single-lens patterns live inside their lens. Every card links to the pillar detail.
        </p>
      </div>
    </SectionShell>
  );
}
