"use client";

import { Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  /** Label above the big score number */
  scoreLabel?: string;
}

function getLevelColor(level: string): string {
  const upper = String(level).toUpperCase();
  if (upper === "HIGH") return "var(--qc-up)";
  if (upper === "LOW") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function getLevelBg(level: string): string {
  const upper = String(level).toUpperCase();
  if (upper === "HIGH") return "var(--qc-up-soft)";
  if (upper === "LOW") return "var(--qc-down-soft)";
  return "var(--qc-warn-soft)";
}

function getRatingDisplay(rating: string): string {
  if (!rating || rating === "N/A") return "N/A";
  return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase();
}

function getFilledBlocks(value: number): number {
  if (value >= 85) return 5;
  if (value >= 65) return 4;
  if (value >= 45) return 3;
  if (value >= 25) return 2;
  if (value > 0) return 1;
  return 0;
}

function getBarLevel(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct <= 0.4) return "LOW";
  if (pct <= 0.7) return "MODERATE";
  return "HIGH";
}

function handleScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function ScreenerScorecard({
  title,
  overallLevel,
  items,
  score,
  maxScore,
  scoreLabel = "OVERALL SCORE",
}: ScreenerScorecardProps) {
  const barLevel = getBarLevel(score, maxScore);
  const barColor = getLevelColor(barLevel);
  const overallLevelColor = overallLevel ? getLevelColor(overallLevel) : undefined;

  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-panel)",
        padding: 8,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ paddingBottom: 8, paddingLeft: 8, paddingRight: 8 }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--qc-text-heading)",
            textTransform: "uppercase",
            letterSpacing: "0.01em",
          }}
        >
          {title}
          {overallLevel && (
            <>
              :{" "}
              <span style={{ color: overallLevelColor }}>
                {getRatingDisplay(overallLevel)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Inner white card */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid var(--qc-border-inner)",
          background: "var(--qc-surface-white)",
          padding: 8,
        }}
      >
        <div className="flex items-stretch gap-8">
          {/* Left: factor rows */}
          <div
            className="flex flex-col flex-1 min-w-0"
          >
            {items.map((item, idx) => {
              const Icon = item.icon ?? Star;
              const ratingColor = item.rating ? getLevelColor(item.rating) : "var(--qc-text-muted)";
              const ratingBg = item.rating ? getLevelBg(item.rating) : "transparent";
              const filledBlocks = item.barValue != null ? getFilledBlocks(item.barValue) : null;
              const isClickable = !!item.scrollToId;

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 py-2${isClickable ? " cursor-pointer rounded-md transition-colors" : ""}`}
                  style={{
                    paddingTop: idx === 0 ? 0 : 8,
                    paddingBottom: idx === items.length - 1 ? 0 : 8,
                    borderTop: idx > 0 ? "1px solid var(--qc-border-inner)" : "none",
                  }}
                  onClick={isClickable ? () => handleScrollTo(item.scrollToId!) : undefined}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleScrollTo(item.scrollToId!);
                          }
                        }
                      : undefined
                  }
                >
                  {/* Icon box */}
                  <div
                    style={{
                      display: "flex",
                      padding: 6,
                      borderRadius: 6,
                      border: "1px solid var(--qc-icon-box-border)",
                      background: "var(--qc-icon-box-bg)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ height: 14, width: 14, color: "var(--qc-text-muted)" }} />
                  </div>

                  {/* Label + descriptor */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="uppercase tracking-wider"
                      style={{ fontSize: 10, fontWeight: 500, color: "var(--qc-text-muted)", letterSpacing: "0.08em" }}
                    >
                      {item.label}
                    </p>
                    {item.descriptor && (
                      <p style={{ fontSize: 13, color: "var(--qc-text-body)" }}>{item.descriptor}</p>
                    )}
                  </div>

                  {/* Mini bar */}
                  <div style={{ width: 47, flexShrink: 0, display: "flex", gap: 3 }}>
                    {filledBlocks != null &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 18,
                            borderRadius: 2,
                            backgroundColor: i < filledBlocks ? ratingColor : "var(--qc-border-default)",
                          }}
                        />
                      ))}
                  </div>

                  {/* Rating pill */}
                  {item.rating && (
                    <div style={{ width: 72, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: ratingColor,
                          background: ratingBg,
                          border: `1px solid ${ratingColor}`,
                          borderRadius: 4,
                          padding: "2px 7px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                          opacity: 0.9,
                        }}
                      >
                        {getRatingDisplay(item.rating)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: overall score + segmented bar */}
          <div
            className="flex flex-col justify-end items-end flex-shrink-0 gap-1"
            style={{ width: 280, borderLeft: "1px solid var(--qc-border-default)", paddingLeft: 24 }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "var(--qc-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {scoreLabel}
            </p>

            {/* Big score */}
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontSize: 52, fontWeight: 500, color: "var(--qc-text-heading)" }}>{score}</span>
              <span style={{ fontSize: 24, fontWeight: 400, color: "var(--qc-text-dimmed)" }}>
                /{maxScore}
              </span>
            </div>

            {/* Segmented bar */}
            <div className="space-y-1 w-full" style={{ marginTop: 4 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: maxScore }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 14,
                      borderRadius: 2,
                      backgroundColor: i < score ? barColor : "var(--qc-border-default)",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Low</span>
                <span style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Moderate</span>
                <span style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
