"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { renderMd } from "@/lib/render-md";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SignalSentiment = "positive" | "negative" | "neutral";

/**
 * A related metric rendered inside the tooltip as a name / value row with an
 * optional comment. Each metric is color-coded by its own assessment.
 */
export interface SignalMetric {
  name: string;
  value: string;
  comment?: string;
  assessment: "Positive" | "Negative" | "Neutral";
}

/**
 * Optional hover tooltip content, mirroring the Technicals page signal tiles.
 * When provided, the card shows a popover on hover with a title, an explanation
 * paragraph, and an optional "Watch:" line.
 */
export interface SignalTooltip {
  /** Tooltip heading. Defaults to the card's `label` when omitted. */
  title?: string;
  /** Body paragraph describing the signal. */
  description: string;
  /** Optional forward-looking "Watch:" note shown beneath the description. */
  watch?: string;
}

export interface SignalCardProps {
  /** Uppercase eyebrow label, e.g. "TREND QUALITY". */
  label: string;
  /** Color-coded value text, e.g. "Weak trend, gaining structure". */
  value: string;
  /**
   * Drives the card's background / border / value color. When omitted, the
   * sentiment is inferred from the `value` string.
   */
  sentiment?: SignalSentiment;
  /** When set, renders a hover-reveal arrow that navigates to this route. */
  href?: string;
  /** When set, the card shows a hover tooltip with a description + "Watch:" line. */
  tooltip?: SignalTooltip;
  /**
   * When set, the card shows a hover tooltip listing these related metrics.
   * Takes precedence over `tooltip` when both are provided.
   */
  metrics?: SignalMetric[];
  /** Where the tooltip is anchored relative to the card. Defaults to "top". */
  tooltipSide?: "top" | "bottom";
}

// ─── Sentiment tokens ─────────────────────────────────────────────────────────

function sentColor(s: SignalSentiment): string {
  if (s === "positive") return "var(--qc-up, #1F7A4A)";
  if (s === "negative") return "var(--qc-down, #B23A2F)";
  return "var(--qc-warn, #B4731A)";
}

function sentBg(s: SignalSentiment): string {
  if (s === "positive") return "var(--qc-up-soft, #EAF4EE)";
  if (s === "negative") return "var(--qc-down-soft, #FDECEA)";
  return "var(--qc-warn-soft, #FEF3E2)";
}

/** Best-effort sentiment inference from the value text (fundamentals-style). */
function inferSentiment(value: string): SignalSentiment {
  const v = value.toLowerCase();
  if (["strong", "good", "positive", "low risk", "stable", "excellent"].some((k) => v.includes(k))) return "positive";
  if (["weak", "expensive", "high risk", "negative", "poor", "declining"].some((k) => v.includes(k))) return "negative";
  return "neutral";
}

function metricAssessment(assessment: SignalMetric["assessment"]): string {
  if (assessment === "Positive") return "var(--qc-up, #1F7A4A)";
  if (assessment === "Negative") return "var(--qc-down, #B23A2F)";
  return "var(--qc-warn, #B4731A)";
}

// ─── SignalCard ────────────────────────────────────────────────────────────────
// Reusable color-coded signal card for the Decision Intelligence section.
// Supports an optional hover tooltip (Technicals-style) and an optional link arrow.

export function SignalCard({
  label,
  value,
  sentiment,
  href,
  tooltip,
  metrics,
  tooltipSide = "top",
}: SignalCardProps) {
  const [tip, setTip] = useState(false);
  const resolvedSentiment = sentiment ?? inferSentiment(value);
  const bg = sentBg(resolvedSentiment);
  const color = sentColor(resolvedSentiment);
  const hasMetrics = Boolean(metrics && metrics.length > 0);
  const interactive = hasMetrics || Boolean(tooltip);

  return (
    <div
      className={href ? "signal-card linkable-compact-card" : "signal-card"}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "7px 10px",
        background: bg,
        border: `1px solid ${color}30`,
        borderRadius: 8,
        cursor: interactive ? "default" : undefined,
        transition: "border-color 0.15s ease",
        ...(href ? { ["--lcc-border-hover" as string]: color } : {}),
      }}
      onMouseEnter={interactive ? () => setTip(true) : undefined}
      onMouseLeave={interactive ? () => setTip(false) : undefined}
    >
      <span
        style={{
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-9)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--qc-ink-2)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--qc-font-sans)",
          fontSize: "var(--qc-fz-12)",
          fontWeight: "var(--qc-w-semi)",
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>

      {href && (
        <Link
          href={href}
          aria-label={`Go to ${label} page`}
          className="lcc-arrow"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "var(--qc-ink)",
            color: "var(--qc-card)",
            opacity: 0,
            transform: "scale(0.6)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        >
          <ArrowUpRight size={10} strokeWidth={2.5} />
        </Link>
      )}

      {interactive && tip && (
        <div
          className="signal-card-tooltip"
          style={{
            position: "absolute",
            left: 0,
            [tooltipSide === "top" ? "bottom" : "top"]: "100%",
            [tooltipSide === "top" ? "marginBottom" : "marginTop"]: 6,
            zIndex: 50,
            width: hasMetrics ? 256 : 240,
            borderRadius: 10,
            border: "1px solid var(--qc-hair)",
            background: "var(--qc-card)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid var(--qc-hair)",
              background: bg,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--qc-fz-12)",
                fontWeight: "var(--qc-w-semi)",
                color: "var(--qc-ink)",
                fontFamily: "var(--qc-font-sans)",
              }}
            >
              {tooltip?.title ?? label}
            </p>
          </div>

          {hasMetrics ? (
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {metrics!.map((m) => (
                <div key={m.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span
                      style={{
                        fontSize: "var(--qc-fz-11)",
                        fontWeight: "var(--qc-w-semi)",
                        color: "var(--qc-ink)",
                        fontFamily: "var(--qc-font-sans)",
                      }}
                    >
                      {m.name}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--qc-fz-11)",
                        fontWeight: "var(--qc-w-semi)",
                        color: metricAssessment(m.assessment),
                        fontFamily: "var(--qc-font-sans)",
                      }}
                    >
                      {m.value}
                    </span>
                  </div>
                  {m.comment && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--qc-fz-11)",
                        color: "var(--qc-ink-2)",
                        lineHeight: 1.5,
                        fontFamily: "var(--qc-font-sans)",
                      }}
                    >
                      {renderMd(m.comment)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            tooltip && (
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--qc-fz-12)",
                    color: "var(--qc-ink)",
                    lineHeight: 1.55,
                    fontFamily: "var(--qc-font-sans)",
                  }}
                >
                  {renderMd(tooltip.description)}
                </p>
                {tooltip.watch && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--qc-fz-11)",
                      color: "var(--qc-ink-2)",
                      lineHeight: 1.45,
                      fontFamily: "var(--qc-font-sans)",
                    }}
                  >
                    <span style={{ fontWeight: "var(--qc-w-semi)" }}>Watch: </span>
                    {tooltip.watch}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
