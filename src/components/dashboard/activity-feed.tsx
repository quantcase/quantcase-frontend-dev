"use client";

import { Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  time: string;
  description: string;
  company?: string;
  tag?: string;
  tagColor?: "neutral" | "alert" | "positive";
}

const TAG_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  neutral:  { bg: "#F5F5F5",  text: "#90A1B9", dot: "#90A1B9" },
  alert:    { bg: "#FEF3F2",  text: "#dc2626", dot: "#dc2626" },
  positive: { bg: "#F0FDF4",  text: "#059669", dot: "#059669" },
};

const ROW_H = 38; // px — fixed row height, used for both columns and SVG

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  const totalH = items.length * ROW_H;
  // Center of dot within a row (vertically centred)
  const dotCY = (i: number) => i * ROW_H + ROW_H / 2;

  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            What Changed Today
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
          style={{ color: "#888888" }}
        >
          See All <ArrowRight className="size-3 ml-0.5" />
        </button>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] px-4 py-2">
        <div className="flex gap-3">

          {/* ── Time column ── */}
          <div className="flex-shrink-0" style={{ width: 52 }}>
            {items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center justify-end"
                style={{ height: ROW_H }}
              >
                <span className="text-[10px] tabular-nums" style={{ color: "#888888" }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>

          {/* ── SVG spine + dots ── */}
          <div className="flex-shrink-0 relative" style={{ width: 16, height: totalH }}>
            <svg
              width="16"
              height={totalH}
              viewBox={`0 0 16 ${totalH}`}
              fill="none"
              className="absolute inset-0"
            >
              {/* Dashed line from first dot center to last dot center */}
              <motion.line
                x1="8" y1={dotCY(0)}
                x2="8" y2={dotCY(items.length - 1)}
                stroke="#D1D5DB"
                strokeWidth="1.5"
                strokeDasharray="3 4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              />

              {/* Dots */}
              {items.map((item, i) => {
                const tagStyle = item.tagColor ? TAG_STYLES[item.tagColor] : TAG_STYLES.neutral;
                return (
                  <motion.circle
                    key={item.id}
                    cx="8"
                    cy={dotCY(i)}
                    r="4"
                    fill={tagStyle.dot}
                    stroke="white"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ transformOrigin: `8px ${dotCY(i)}px` }}
                    transition={{ duration: 0.2, delay: i * 0.07 + 0.15, type: "spring", stiffness: 320 }}
                  />
                );
              })}
            </svg>
          </div>

          {/* ── Content column ── */}
          <div className="flex flex-col flex-1 min-w-0">
            {items.map((item, i) => {
              const tagStyle = item.tagColor ? TAG_STYLES[item.tagColor] : TAG_STYLES.neutral;
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#F5F5F5] rounded-md px-2 -mx-2 transition-colors"
                  style={{ height: ROW_H }}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.07, ease: "easeOut" }}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
                    {item.company && (
                      <>
                        <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: "#0F172B" }}>
                          {item.company}
                        </span>
                        <span className="text-[11px] flex-shrink-0" style={{ color: "#D0D0D0" }}>·</span>
                      </>
                    )}
                    <span className="text-[12px] truncate" style={{ color: "#888888" }}>
                      {item.description}
                    </span>
                  </div>

                  {item.tag && (
                    <span
                      className="flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
                      style={{ background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.text}33` }}
                    >
                      {item.tag}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
