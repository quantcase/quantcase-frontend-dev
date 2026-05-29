"use client";

import { motion } from "framer-motion";
import {
  Target, Eye, TrendingUp, BarChart2,
  Factory, Swords, Shield, Users,
  Zap, RefreshCw, Award, DollarSign,
  type LucideIcon,
} from "lucide-react";
import type { InsightLens } from "@/types/analysis";
import { renderMd } from "@/lib/render-md";
import { SectionHeader } from "@/components/ds";

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

function lensColors(status: string | undefined, pct: number) {
  const s = (status ?? "").toLowerCase();
  const isPositive = s === "strong" || s === "stable" || s === "disciplined" || (!s && pct >= 70);
  const isWarn = s === "moderate" || s === "mixed" || s === "reactive" || (!s && pct >= 40 && pct < 70);
  if (isPositive) return { color: "var(--qc-up)", bg: "rgba(31,122,74,0.10)" };
  if (isWarn) return { color: "var(--qc-warn)", bg: "rgba(180,115,26,0.10)" };
  return { color: "var(--qc-down)", bg: "rgba(220,38,38,0.10)" };
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
      <SectionHeader label={heading ?? "Lenses"} count={lenses.length} style={{ marginBottom: 0, padding: "10px 12px 16px" }} />

      {/* 2-col grid of individually color-coded cards */}
      <div className="rounded-[10px] p-3" style={{ background: "var(--qc-card)", flex: 1 }}>
      <div
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ gap: 10, height: "100%" }}
      >
        {lenses.map((lens) => {
          const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
          const { color: statusColor, bg: statusBg } = lensColors(lens.status, pct);
          const accentColor = statusColor;
          const statusLabel = (lens.status || (pct >= 70 ? "STRONG" : pct >= 40 ? "MODERATE" : "NEUTRAL")).toUpperCase();
          const isClickable = !!onLensClick;
          const Icon = LENS_ICON_CONFIG[lens.slug];
          return (
            <motion.div
              key={lens.slug}
              id={`lens-${lens.slug}`}
              onClick={() => onLensClick?.(lens.slug)}
              initial="rest"
              whileHover={isClickable ? "hover" : undefined}
              animate="rest"
              variants={isClickable ? {
                rest: { opacity: 1 },
                hover: { opacity: 0.88 },
              } : undefined}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px 20px 20px 22px",
                cursor: isClickable ? "pointer" : "default",
                position: "relative",
                background: "var(--qc-card)",
                borderRadius: 10,
                borderTop: "1px solid var(--qc-hair)",
                borderRight: "1px solid var(--qc-hair)",
                borderBottom: "1px solid var(--qc-hair)",
                borderLeft: `4px solid ${accentColor}`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {Icon && (
                  <div style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: 8,
                    background: "rgba(18,18,18,0.04)", border: "1px solid rgba(18,18,18,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--qc-ink-2)",
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
    </div>
  );
}
