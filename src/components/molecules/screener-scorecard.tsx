"use client";

import type { LucideIcon } from "lucide-react";
import { ActionButton, DarkGradientCard, MonoLabel } from "@/components/ds";

interface ScorecardLineItem {
  /** Display label (e.g. "Guidance Accuracy") */
  label: string;
  /** Descriptor text shown below label (e.g. "Inconsistent") */
  descriptor?: string | null;
  /** Rating label shown in the pill (e.g. "HIGH", "MODERATE", "LOW") */
  rating?: string;
  /** Numeric value 0-100 used to fill the mini bar (5 blocks) */
  barValue?: number | null;
  /** Icon to show — defaults to Star */
  icon?: LucideIcon;
  /** Section ID to scroll to on click (e.g. "section-guidance") */
  scrollToId?: string;
}

interface ScreenerScorecardProps {
  /** Title shown in the header (e.g. "MANAGEMENT CREDIBILITY") */
  title: string;
  /** Overall level label shown colored next to title (e.g. "HIGH") */
  overallLevel?: string;
  /** Line items (left side rows) */
  items: ScorecardLineItem[];
  /** Overall numeric score */
  score: number;
  /** Max possible score */
  maxScore: number;
  /** AI-generated verdict headline — first segment before the highlighted phrase */
  verdictBefore?: string;
  /** Highlighted italic phrase in the headline */
  verdictHighlight?: string;
  /** Rest of headline after the highlight */
  verdictAfter?: string;
  /** Subtitle/body text below the headline */
  verdictSubtitle?: string;
}

function getLevelColor(level: string): string {
  const upper = String(level).toUpperCase();
  if (upper === "HIGH") return "var(--qc-up)";
  if (upper === "LOW") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function getLevelBg(level: string): string {
  const upper = String(level).toUpperCase();
  if (upper === "HIGH") return "rgba(34,197,94,0.15)";
  if (upper === "LOW") return "rgba(239,68,68,0.15)";
  return "rgba(245,158,11,0.15)";
}

function getRatingDisplay(rating: string): string {
  if (!rating || rating === "N/A") return "N/A";
  return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase();
}

function handleScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function getChipPip(rating?: string): string {
  if (!rating) return "var(--qc-ink-2)";
  const upper = rating.toUpperCase();
  if (upper === "HIGH") return "var(--qc-up)";
  if (upper === "LOW") return "var(--qc-down)";
  return "var(--qc-warn)";
}

export function ScreenerScorecard({
  title,
  overallLevel,
  items,
  score,
  maxScore,
  verdictBefore,
  verdictHighlight,
  verdictAfter,
  verdictSubtitle,
}: ScreenerScorecardProps) {
  const bandLabel = overallLevel
    ? `${getRatingDisplay(overallLevel)} Band`.toUpperCase()
    : undefined;
  const levelColor = overallLevel ? getLevelColor(overallLevel) : "var(--qc-warn)";
  const levelBg = overallLevel ? getLevelBg(overallLevel) : "rgba(245,158,11,0.15)";

  // Fallback headline if no verdict props provided
  const hasFallbackHeadline = !verdictBefore && !verdictHighlight;
  const fallbackHighlight = overallLevel ? getRatingDisplay(overallLevel) : "Moderate";
  const fallbackAfter = " management credibility across all dimensions.";

  const headlineHighlight = verdictHighlight ?? fallbackHighlight;
  const headlineAfter = verdictAfter ?? (hasFallbackHeadline ? fallbackAfter : "");

  return (
    <DarkGradientCard
      style={{
        padding: "22px 26px 20px",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        minHeight: 260,
      }}
    >
      {/* Header row: VERDICT label + band badge + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, position: "relative" }}>
        <MonoLabel
          size={10}
          tracking="0.18em"
          color="rgba(255,255,255,0.5)"
        >
          {title}
        </MonoLabel>

        {bandLabel && (
          <span
            style={{
              fontSize: "var(--qc-fz-10)",
              fontWeight: "var(--qc-w-bold)",
              color: levelColor,
              background: levelBg,
              border: `1px solid ${levelColor}`,
              borderRadius: 4,
              padding: "2px 8px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            {bandLabel}
          </span>
        )}

      </div>

      {/* Verdict headline */}
      <h2
        style={{
          fontSize: "var(--qc-fz-22)",
          fontWeight: "var(--qc-w-regular)",
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
          margin: 0,
          maxWidth: "88%",
          position: "relative",
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-on-dark)",
        }}
      >
        {headlineAfter}
      </h2>

      {/* Subtitle */}
      {verdictSubtitle && (
        <p
          style={{
            marginTop: 12,
            fontSize: "var(--qc-fz-14)",
            fontWeight: "var(--qc-w-regular)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
            maxWidth: "80%",
            position: "relative",
          }}
        >
          {verdictSubtitle}
        </p>
      )}

      {/* Factor chips */}
      {items.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: "auto",
            paddingTop: 24,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {items.map((item) => {
            const pip = getChipPip(item.rating);
            const isClickable = !!item.scrollToId;
            return (
              <ActionButton
                key={item.label}
                size="sm"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.92)",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: isClickable ? "pointer" : "default",
                }}
                onClick={isClickable ? () => handleScrollTo(item.scrollToId!) : undefined}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: pip,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                {item.label}
                {item.descriptor && (
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)" }}>
                    — {item.descriptor}
                  </span>
                )}
              </ActionButton>
            );
          })}
        </div>
      )}
    </DarkGradientCard>
  );
}
