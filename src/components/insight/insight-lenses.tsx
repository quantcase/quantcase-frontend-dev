"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Target, Eye, TrendingUp, BarChart2,
  Factory, Swords, Shield, Users,
  Zap, RefreshCw, Award, DollarSign,
  type LucideIcon,
} from "lucide-react";
import type { InsightLens } from "@/types/analysis";
import { renderMd } from "@/lib/render-md";
import { StatusBadge, type StatusSentiment } from "@/components/ds";
import { SectionPanel } from "@/components/molecules/section-panel";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";

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
  "earnings-quality": Award,
  "earnings_quality": Award,
  "target-price-matrix": DollarSign,
};

interface InsightLensesProps {
  lenses: InsightLens[];
  heading?: string;
  subtitle?: string;
  onLensClick?: (slug: string) => void;
  ticker?: string;
}

export function lensSentiment(status: string | undefined, pct: number): StatusSentiment {
  const s = (status ?? "").toLowerCase();
  const isPositive = s === "strong" || s === "stable" || s === "disciplined" || (!s && pct >= 70);
  const isWarn = s === "moderate" || s === "mixed" || s === "reactive" || (!s && pct >= 40 && pct < 70);
  if (isPositive) return "positive";
  if (isWarn) return "caution";
  return "negative";
}

function sentimentColor(sentiment: StatusSentiment): string {
  if (sentiment === "positive") return "var(--qc-up)";
  if (sentiment === "caution") return "var(--qc-warn)";
  if (sentiment === "negative") return "var(--qc-down)";
  return "var(--qc-ink-3)";
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LensScenarios({ slug, ticker }: { slug: string; ticker: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    let apiSlug = slug === "pe-rerating-potential" || slug === "earnings-quality" || slug === "earnings_quality" ? "earning-quality" : slug;
    apiSlug = apiSlug.replace(/_/g, "-");
    
    const endpoint = `/api/html-incremental-skills/${apiSlug}/outputs/${ticker}`;
    
    authFetch(`${BACKEND_URL}${endpoint}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        if (!cancelled && json?.output?.extracted_json) {
          setData(json.output.extracted_json);
        } else if (!cancelled && json?.extracted_json) {
          setData(json.extracted_json); // Just in case it's flat
        }
      })
      .catch((err) => {
        console.error("Failed to fetch scenarios", err);
      });
      
    return () => { cancelled = true; };
  }, [slug, ticker]);

  const isEf = slug === 'earnings-forecast' || slug === 'earnings_forecast';
  
  const getVal = (c: string) => {
    if (!data) return { main: "-", sub: null };
    if (isEf) {
      const s = data.scenarios?.find((s: any) => s.case === c);
      return { main: s?.cagr ?? "-", sub: null };
    } else {
      const s = data.probability_fan?.segments?.find((s: any) => s.class === c);
      return { main: s?.['p/e'] ?? "-", sub: null };
    }
  };

  const bear = getVal('bear');
  const base = getVal('base');
  const bull = getVal('bull');

  const Box = ({ title, colorClass, main, sub, borderCol }: { title: string, colorClass: string, main: string, sub: string | null, borderCol: string }) => (
    <div className="flex flex-col p-2.5 rounded-lg bg-[var(--qc-bg)] border border-[var(--qc-hair)]" style={{ borderTop: `2px solid ${borderCol}` }}>
      <span className={`text-[9px] font-bold tracking-wider ${colorClass} mb-1`}>{title}</span>
      <span className="text-lg font-bold leading-none mb-1 text-[var(--qc-ink)]">{main}</span>
      {sub && <span className="text-[10px] text-[var(--qc-ink-2)] font-medium">{sub}</span>}
    </div>
  );

  return (
    <div className="mt-auto pt-4">
      <div className="text-[10px] text-[var(--qc-ink-2)] font-medium mb-2 uppercase tracking-wider">
        {isEf ? "3 year CAGR" : "3Y Forecast"}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Box title="BEAR" colorClass="text-[var(--qc-down)]" main={bear.main} sub={bear.sub} borderCol="var(--qc-down)" />
        <Box title="BASE" colorClass="text-[var(--qc-blue)]" main={base.main} sub={base.sub} borderCol="var(--qc-blue)" />
        <Box title="BULL" colorClass="text-[var(--qc-up)]" main={bull.main} sub={bull.sub} borderCol="var(--qc-up)" />
      </div>
    </div>
  );
}

// Lens description clamped to 2 lines. When the text is longer than the clamp,
// hovering reveals the full copy in a signal-box-style popover (mirrors the
// Signals tiles). Cards whose description fits show no tooltip.
function LensDescription({ text, name, accentColor, disableHover }: { text: string; name: string; accentColor: string; disableHover?: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight - el.clientHeight > 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={overflowing ? () => setHover(true) : undefined}
      onMouseLeave={overflowing ? () => setHover(false) : undefined}
    >
      <p
        ref={ref}
        style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-2)", lineHeight: 1.6, margin: 0, display: disableHover ? "block" : "-webkit-box", WebkitLineClamp: disableHover ? undefined : 2, WebkitBoxOrient: disableHover ? undefined : "vertical", overflow: disableHover ? "visible" : "hidden", fontFamily: "var(--qc-font-sans)" }}
      >
        {renderMd(text)}
      </p>

      {overflowing && hover && !disableHover && (
        <div
          style={{
            position: "absolute", left: 0, right: 0, bottom: "100%", marginBottom: 8,
            zIndex: 50, borderRadius: 10, border: "1px solid var(--qc-hair)",
            background: "var(--qc-card)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)", borderLeft: `3px solid ${accentColor}` }}>
            <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>
              {name}
            </p>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.55, fontFamily: "var(--qc-font-sans)" }}>
              {renderMd(text)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function InsightLenses({ lenses, heading, subtitle, onLensClick, ticker }: InsightLensesProps) {
  if (!lenses.length) return null;

  return (
    // Header matches the fundamentals page cards (SectionPanel: sans title +
    // subtitle), so every research card across the screener reads the same.
    <SectionPanel
      className="flex-1"
      title={subtitle ?? `Scored assessment across ${lenses.length} analytical ${lenses.length === 1 ? "lens" : "lenses"}`}
      contentClassName="min-w-0"
    >
      {/* Grid of individually color-coded cards. Exactly 3 lenses sit in a single
          row of 3; any other count uses 2 columns (so 4 → 2x2). Full class strings
          kept static so Tailwind's JIT doesn't purge them. */}
      <div
        className={`grid grid-cols-1 ${lenses.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
        style={{ gap: 10, height: "100%" }}
      >
        {lenses.map((lens) => {
          const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
          const sentiment = lensSentiment(lens.status, pct);
          const accentColor = sentimentColor(sentiment);
          const statusLabel = (lens.status || (pct >= 70 ? "STRONG" : pct >= 40 ? "MODERATE" : "NEUTRAL")).toUpperCase();
          const isClickable = !!onLensClick;
          const Icon = LENS_ICON_CONFIG[lens.slug];
          const isEarnings = lens.slug === 'earnings-forecast' || lens.slug === 'earnings-quality' || lens.slug === 'earnings_forecast' || lens.slug === 'earnings_quality';

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
                  {/* Consistent subtitle slot across every lens card — reserves the
                      row even when a lens has no subtitle, so cards align (audit). */}
                  <p style={{ fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: accentColor, margin: "2px 0 0", minHeight: 12, fontFamily: "var(--qc-font-sans)" }}>
                    {lens.subtitle ?? " "}
                  </p>
                </div>
                <StatusBadge label={statusLabel} sentiment={sentiment} hideGlyph className="shrink-0 self-start font-bold" />
              </div>

              {/* Divider */}
              <div style={{ marginBottom: 18, borderTop: "1px dashed var(--qc-hair)" }} />

              {/* Description — clamped to 2 lines, hover-expands when it overflows */}
              <LensDescription text={lens.description} name={lens.name} accentColor={accentColor} disableHover={isEarnings} />

              {isEarnings && ticker && (
                <LensScenarios slug={lens.slug} ticker={ticker} />
              )}

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
    </SectionPanel>
  );
}
