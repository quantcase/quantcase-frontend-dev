"use client";

import { Activity, ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  time: string;
  description: string;
  company?: string;
  tag?: string;
  tagColor?: "neutral" | "alert" | "positive";
}

const TAG_STYLES: Record<string, { bg: string; text: string; dot: string; ring: string }> = {
  neutral:  { bg: "var(--qc-chip-bg)",      text: "var(--qc-text-muted)",  dot: "var(--qc-text-muted)",  ring: "var(--qc-border-default)" },
  alert:    { bg: "var(--qc-down-soft)",    text: "var(--qc-down)",        dot: "var(--qc-down)",        ring: "var(--qc-down-soft)" },
  positive: { bg: "var(--qc-up-soft)",      text: "var(--qc-up)",          dot: "var(--qc-up)",          ring: "var(--qc-up-soft)" },
};

// Resolved hex values for animation (CSS vars can't be used in framer-motion numeric props)
const TAG_COLORS_HEX: Record<string, { dot: string; ring: string }> = {
  neutral:  { dot: "#9A9A92", ring: "#E9E7E1" },
  alert:    { dot: "#B23A2F", ring: "#F7E6E3" },
  positive: { dot: "#1F7A4A", ring: "#E3F1E8" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

function TimelineDot({ colorKey, index }: { colorKey: string; index: number }) {
  const hex = TAG_COLORS_HEX[colorKey] ?? TAG_COLORS_HEX.neutral;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
      {/* Ripple pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{ background: hex.dot, opacity: 0.18 }}
        initial={{ width: 8, height: 8 }}
        animate={{ width: 20, height: 20, opacity: 0 }}
        transition={{ duration: 1.6, delay: index * 0.15 + 0.6, repeat: Infinity, repeatDelay: 3, ease: "easeOut" }}
      />
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 14, height: 14, border: `1.5px solid ${hex.ring}`, background: "var(--qc-surface-card)" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2, type: "spring", stiffness: 280 }}
      />
      {/* Inner solid dot */}
      <motion.div
        className="relative rounded-full"
        style={{ width: 7, height: 7, background: hex.dot }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, delay: index * 0.1 + 0.3, type: "spring", stiffness: 340 }}
      />
    </div>
  );
}

function TimelineItem({ item, index, isLast }: { item: ActivityItem; index: number; isLast: boolean }) {
  const colorKey = item.tagColor ?? "neutral";
  const tagStyle = TAG_STYLES[colorKey];
  const hex = TAG_COLORS_HEX[colorKey] ?? TAG_COLORS_HEX.neutral;

  return (
    <div className="flex gap-0 relative mb-3">
      {/* Left column: absolute vertical line + centered dot */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 28 }}>
        {!isLast && (
          <motion.div
            className="absolute"
            style={{ width: 1.5, top: "50%", bottom: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(to bottom, var(--qc-border-default) 70%, transparent)" }}
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.45, ease: "easeOut" }}
          />
        )}
        <TimelineDot colorKey={colorKey} index={index} />
      </div>

      {/* Card */}
      <motion.div
        className="flex-1 ml-2 rounded-xl overflow-hidden cursor-pointer group"
        style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)" }}
        initial={{ opacity: 0, x: -12, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.32, delay: index * 0.1 + 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -1, boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)", transition: { duration: 0.18 } }}
      >
        {/* Accent bar */}
        <div className="h-[3px] w-full" style={{ background: hex.dot, opacity: 0.7 }} />

        <div className="px-3 py-2">
          {/* Time + tag row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] tabular-nums font-medium" style={{ color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              {item.time}
            </span>
            {item.tag && (
              <motion.span
                className="text-[8px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 flex-shrink-0"
                style={{ background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${hex.ring}` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 + 0.35 }}
              >
                {item.tag}
              </motion.span>
            )}
          </div>

          {/* Company */}
          {item.company && (
            <p className="text-[12.5px] font-semibold leading-tight mb-0.5" style={{ color: "var(--qc-text-heading)" }}>
              {item.company}
            </p>
          )}

          {/* Description */}
          <p className="text-[11px] leading-snug" style={{ color: "var(--qc-text-body)" }}>
            {item.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className={cn("rounded-[10px] p-2 flex flex-col h-full", className)}
      style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            What Changed Today
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[10px] font-medium rounded-md px-2 py-1 transition-colors flex-shrink-0"
          style={{ color: "var(--qc-text-muted)", border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
        >
          See All <ArrowRight className="size-3 ml-0.5" />
        </button>
      </div>

      {/* Timeline */}
      <div
        className="rounded-[10px] px-3 pt-4 pb-1 flex-1"
        style={{ background: "var(--qc-surface-white)", border: "1px solid var(--qc-border-inner)" }}
      >
        {inView && items.map((item, i) => (
          <TimelineItem key={item.id} item={item} index={i} isLast={i === items.length - 1} />
        ))}
      </div>
    </div>
  );
}
