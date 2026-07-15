"use client";

import { useState, useRef } from "react";
import { AlertCircle, ArrowRight, Scale, CloudLightning, TrendingUp, Sprout, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useBaskets } from "@/hooks/useBaskets";
import type { Basket } from "@/types/screener";

// ── Category icon map ─────────────────────────────────────────────────────────

interface CategoryMeta { icon: React.ReactNode; label: string }

const CATEGORY_META: Record<string, CategoryMeta> = {
  "VALUE INVESTING":                        { icon: <Scale className="size-3.5" />,          label: "Value Investing"    },
  "MARKET CONDITION — BEAR / FEAR":         { icon: <CloudLightning className="size-3.5" />, label: "Bear / Fear"        },
  "MARKET CONDITION — RECOVERY / REBOUND":  { icon: <TrendingUp className="size-3.5" />,    label: "Recovery / Rebound" },
  "GROWTH INVESTING":                       { icon: <Sprout className="size-3.5" />,         label: "Growth Investing"   },
  "SPECIAL SITUATIONS":                     { icon: <Zap className="size-3.5" />,            label: "Special Situations" },
};

function getCategoryMeta(category: string): CategoryMeta {
  const upper = category.toUpperCase();
  const key = Object.keys(CATEGORY_META).find((k) => upper === k);
  return key ? CATEGORY_META[key] : { icon: <Scale className="size-3.5" />, label: category };
}

// ── Basket row ────────────────────────────────────────────────────────────────

function BasketRow({ basket }: { basket: Basket }) {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLAnchorElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.bottom + 6, left: rect.left });
    }
  };

  return (
    <Link
      ref={rowRef}
      href={`/screener/basket?id=${encodeURIComponent(basket.id)}`}
      className="flex items-start px-4 py-3 transition-colors"
      style={{ background: hovered ? "var(--qc-section)" : "" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { setHovered(false); setTooltipPos(null); }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug truncate" style={{ color: "var(--qc-ink)" }}>
          {basket.title}
        </p>
        <p className="text-[11px] mt-0.5 line-clamp-1 leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
          {basket.description}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pt-0.5 ml-3">
        <motion.div animate={{ opacity: hovered ? 0.5 : 0, x: hovered ? 0 : -4 }} transition={{ duration: 0.15, ease: "easeOut" }}>
          <ArrowRight className="size-3" style={{ color: "var(--qc-ink)" }} />
        </motion.div>
        <span
          className="text-[10px] font-medium rounded-sm px-1.5 py-0.5 tabular-nums"
          style={{ background: "var(--qc-lime)", color: "var(--qc-ink)" }}
        >
          {basket.conditions.length}
        </span>
      </div>

      <AnimatePresence>
        {hovered && tooltipPos && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              zIndex: 50,
              maxWidth: 300,
              background: "var(--qc-card)",
              border: "1px solid var(--qc-hair)",
              borderRadius: 10,
              padding: "10px 14px",
              pointerEvents: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", lineHeight: 1.3, marginBottom: 5, color: "var(--qc-ink)" }}>{basket.title}</p>
            <p style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", lineHeight: 1.6, color: "var(--qc-ink-2)" }}>{basket.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}

// ── Stock Baskets Section ─────────────────────────────────────────────────────

export function StockBasketsSection() {
  const { data: basketsData, loading: basketsLoading, error: basketsError } = useBaskets();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
      {basketsError && (
        <div className="flex items-center gap-2 rounded-xl border border-down-soft bg-down-soft px-4 py-3 mb-6">
          <AlertCircle className="h-4 w-4 text-down flex-shrink-0" />
          <p className="text-sm text-down">{basketsError}</p>
        </div>
      )}

      {basketsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-[10px] border h-[320px] animate-pulse" style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }} />
          ))}
        </div>
      )}

      {!basketsLoading && !basketsError && basketsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {Object.entries(basketsData.grouped).map(([category, baskets]) => {
            const meta = getCategoryMeta(category);
            return (
              <div key={category} className="relative rounded-[10px] border overflow-hidden" style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}>
                <div className="px-4 py-4 border-b" style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 inline-flex items-center justify-center rounded-[6px]"
                      style={{ width: 30, height: 30, background: "var(--qc-card)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink-2)" }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold leading-tight" style={{ color: "var(--qc-ink)" }}>{meta.label}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--qc-ink-2)" }}>{baskets.length} basket{baskets.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-[var(--qc-hair-2)]">
                  {baskets.map((basket) => <BasketRow key={basket.id} basket={basket} />)}
                </div>
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10" style={{ background: "linear-gradient(180deg, transparent 0%, var(--qc-section) 100%)" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
