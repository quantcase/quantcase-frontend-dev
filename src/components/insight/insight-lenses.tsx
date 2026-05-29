"use client";

import { motion } from "framer-motion";
import {
  Target, Eye, TrendingUp, BarChart2,
  Factory, Swords, Shield, Users,
  Zap, RefreshCw, Award, DollarSign,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { InsightLens } from "@/types/analysis";
import { renderMd } from "@/lib/render-md";
import { MonoLabel, LimeCountPip } from "@/components/ds";

const LENS_ICON_CONFIG: Record<string, LucideIcon> = {
  "guidance-credibility": Target,
  "disclosure-honesty": Eye,
  "capital-allocation": TrendingUp,
  "promoter-activity": BarChart2,
  "industry-analysis": Factory,
  "competition": Swords,
  "financial-strength": Shield,
  "customer-distribution": Users,
  "eps-engine": Zap,
  "earnings-forecast": Zap,
  "pe-rerating-potential": RefreshCw,
  "earning-quality": Award,
  "target-price-matrix": DollarSign,
};

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
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", display: "flex", flexDirection: "column", flex: 1 }}
    >
      {/* Header */}
      <div className="px-2 pt-1 pb-3 flex items-center gap-2">
        <Layers className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
        <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">
          {heading ?? "Lenses"}
        </MonoLabel>
        <LimeCountPip count={lenses.length} />
      </div>

      {/* Single inner card — 2-col CSS grid, interior dividers only */}
      <div
        className="rounded-[10px] overflow-hidden grid grid-cols-1 sm:grid-cols-2"
        style={{
          background: "var(--qc-card)",
          flex: 1,
        }}
      >
        {lenses.map((lens, idx) => {
          const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
          const { color: statusColor, bg: statusBg } = lensStatusColor(pct);
          const accentColor = lensAccentColor(pct);
          const statusLabel = (lens.status || (pct >= 70 ? "STRONG" : pct >= 40 ? "MODERATE" : "NEUTRAL")).toUpperCase();
          const isClickable = !!onLensClick;
          const Icon = LENS_ICON_CONFIG[lens.slug];
          const isLeft = idx % 2 === 0;
          const rowCount = Math.ceil(lenses.length / 2);
          const isTop = idx < rowCount * 2 - 2;

          return (
            <motion.div
              key={lens.slug}
              id={`lens-${lens.slug}`}
              onClick={() => onLensClick?.(lens.slug)}
              initial="rest"
              whileHover={isClickable ? "hover" : undefined}
              animate="rest"
              variants={isClickable ? {
                rest: { backgroundColor: "#FFFFFF" },
                hover: { backgroundColor: "#F3F2EE" },
              } : undefined}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={isLeft ? "sm:border-r sm:border-r-[var(--qc-hair)]" : ""}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 16px",
                cursor: isClickable ? "pointer" : "default",
                position: "relative",
                borderBottom: isTop ? "1px solid var(--qc-hair)" : "none",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {Icon && (
                  <div style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: 8,
                    background: statusBg, border: `1px solid ${accentColor}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: accentColor,
                  }}>
                    <Icon size={16} strokeWidth={1.5} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-semi)", lineHeight: 1.2, margin: 0, color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>
                    {lens.name}
                  </h4>
                  {lens.subtitle && (
                    <p style={{ fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: accentColor, margin: "2px 0 0", fontFamily: "var(--qc-font-sans)" }}>
                      {lens.subtitle}
                    </p>
                  )}
                </div>
                <span style={{
                  flexShrink: 0,
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow)",
                  color: statusColor, background: statusBg,
                  borderRadius: 4, padding: "3px 7px", textTransform: "uppercase",
                  fontFamily: "var(--qc-font-sans)",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
                  {statusLabel}
                </span>
              </div>

              {/* Divider */}
              <div style={{ marginBottom: 18, borderTop: "1px dashed var(--qc-hair)" }} />

              {/* Description */}
              <p style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-2)", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "var(--qc-font-sans)" }}>
                {renderMd(lens.description)}
              </p>

              {/* Hover expand icon */}
              {isClickable && (
                <motion.div
                  variants={{ rest: { opacity: 0, scale: 0.75 }, hover: { opacity: 1, scale: 1 } }}
                  transition={{ duration: 0.12 }}
                  style={{ position: "absolute", bottom: 12, right: 14, color: "var(--qc-ink-3)" }}
                >
                  <ExpandIcon />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
