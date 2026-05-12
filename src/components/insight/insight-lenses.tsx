"use client";

import { motion } from "framer-motion";
import type { InsightLens } from "@/types/analysis";

interface InsightLensesProps {
  lenses: InsightLens[];
  heading?: string;
  onLensClick?: (slug: string) => void;
}

function lensStatusColor(pct: number) {
  if (pct >= 70) return { color: "var(--qc-up)", bg: "rgba(31,122,74,0.10)" };
  if (pct >= 40) return { color: "var(--qc-warn)", bg: "rgba(180,115,26,0.10)" };
  return { color: "var(--qc-down)", bg: "rgba(220,38,38,0.10)" };
}

function lensAccentColor(pct: number): string {
  if (pct >= 70) return "var(--qc-up)";
  if (pct >= 40) return "var(--qc-warn)";
  return "var(--qc-down)";
}

function lensStatusEmoji(pct: number, status: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "STRONG" || pct >= 70) return "✅";
  return "🟡";
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InsightLenses({ lenses, heading, onLensClick }: InsightLensesProps) {
  if (!lenses.length) return null;

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 28, fontWeight: 400, color: "var(--qc-ink)", margin: 0, fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>
          {heading}
        </h3>
      </div>

      {/* 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {lenses.map((lens, i) => {
          const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
          const { color: statusColor, bg: statusBg } = lensStatusColor(pct);
          const accentColor = lensAccentColor(pct);
          const statusLabel = (lens.status || (pct >= 70 ? "STRONG" : pct >= 40 ? "MODERATE" : "NEUTRAL")).toUpperCase();
          const statusIcon = lensStatusEmoji(pct, lens.status);
          const isClickable = !!onLensClick;

          return (
            <motion.div
              key={lens.slug}
              id={`lens-${lens.slug}`}
              onClick={() => onLensClick?.(lens.slug)}
              initial="rest"
              whileHover={isClickable ? "hover" : undefined}
              animate="rest"
              variants={isClickable ? {
                rest: { y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)" },
                hover: { y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.09)" },
              } : undefined}
              transition={{ duration: 0.15 }}
              style={{
                background: "var(--qc-card)",
                border: "1px solid var(--qc-hair)",
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: 10,
                padding: "20px 20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                position: "relative",
                overflow: "hidden",
                cursor: isClickable ? "pointer" : "default",
              }}
            >
              {/* Number badge + status pill */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{
                  fontSize: 11, fontWeight: 500, color: "var(--qc-ink-3)",
                  background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                  borderRadius: 6, padding: "2px 8px", fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.04em",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                  color: statusColor, background: statusBg,
                  borderRadius: 4, padding: "3px 8px", textTransform: "uppercase",
                }}>
                  {statusIcon} {statusLabel}
                </span>
              </div>

              {/* Lens name */}
              <h4 style={{
                fontSize: 22, fontWeight: 400, lineHeight: 1.25, margin: "0 0 6px",
                color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif, Georgia, serif)",
              }}>
                {lens.name}
              </h4>

              {/* Subtitle (italic, accent color) */}
              {lens.subtitle && (
                <p style={{
                  fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.10em", color: accentColor,
                  margin: "0 0 12px",
                }}>
                  {lens.subtitle}
                </p>
              )}

              {/* Divider */}
              <div style={{ margin: "0 0 12px", borderStyle: "dashed", borderWidth: "1px 0 0", borderColor: "var(--qc-hair)" }} />

              {/* Description */}
              <p style={{ fontSize: 13, color: "var(--qc-ink-2)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                {lens.description}
              </p>

              {/* Hover expand icon — shown via CSS group-hover */}
              {isClickable && (
                <motion.div
                  variants={{ rest: { opacity: 0, scale: 0.75 }, hover: { opacity: 1, scale: 1 } }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", bottom: 14, right: 16,
                    color: "var(--qc-ink-3)",
                  }}
                >
                  <ExpandIcon />
                </motion.div>
              )}

              {/* Decorative blob */}
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: `${statusColor}14`,
                pointerEvents: "none",
              }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
