"use client";

import Link from "next/link";
import { BarChart2 } from "lucide-react";
import { MonoLabel, LimeCountPip } from "@/components/ds";
import { useIndustryBaskets } from "@/hooks/useIndustryBaskets";
import type { IndustryBasket } from "@/hooks/useIndustryBaskets";

export type SignalRating = "BUY" | "WAIT" | "AVOID";

// Keep the static type for backward-compat if any page still imports it
export interface IndustrySignal {
  id: string;
  rating: SignalRating;
  sector: string;
  etfLabel: string;
  etfTicker: string;
  href: string;
}

interface IndustrySignalsGridProps {
  count?: number;
  signals?: IndustrySignal[];
}

const ratingStyle: Record<SignalRating, { bg: string; border: string; labelColor: string; sectorColor: string; etfColor: string }> = {
  BUY:   { bg: "#f0faf0", border: "#c3e6c3", labelColor: "#3a6b3a", sectorColor: "#1a3a1a", etfColor: "#3a6b3a" },
  WAIT:  { bg: "#fdf8ed", border: "#f0d89a", labelColor: "#8a5e1a", sectorColor: "#3a2800", etfColor: "#8a5e1a" },
  AVOID: { bg: "#fdf0f0", border: "#f0c4c4", labelColor: "#8a2020", sectorColor: "#3a0000", etfColor: "#8a2020" },
};

function BasketCard({ basket }: { basket: IndustryBasket }) {
  const rs = ratingStyle[basket.signal];
  return (
    <Link
      href={`/screener/basket?id=${basket.id}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        background: rs.bg,
        border: `1px solid ${rs.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        textDecoration: "none",
      }}
    >
      <div style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-bold)", fontFamily: "var(--qc-font-sans)", color: rs.labelColor, letterSpacing: "var(--qc-track-eyebrow)", textTransform: "uppercase", marginBottom: 6 }}>
        {basket.signal}
      </div>
      <div style={{ fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-regular)", color: rs.sectorColor, marginBottom: 8, fontFamily: "var(--qc-font-serif)" }}>
        {basket.title}
      </div>
      <div style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: rs.etfColor, letterSpacing: "var(--qc-track-mono)", textTransform: "uppercase" }}>
        → {basket.etfTicker}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#f5f5f5",
        border: "1px solid #e2e2e2",
        borderRadius: 10,
        padding: "14px 16px",
        height: 88,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function IndustrySignalsGrid({ count: countProp }: IndustrySignalsGridProps) {
  const { data, loading } = useIndustryBaskets();

  const baskets = data?.baskets ?? [];
  const displayCount = data ? baskets.length : (countProp ?? 8);

  return (
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Header — matches WhoToCallToday */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Industry Signals</MonoLabel>
          <LimeCountPip count={displayCount} />
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: -8 }}>
        Aligned to your holdings · scored across 6 frameworks
      </div>

      {/* Inner white card with 2-column grid */}
      <div
        className="rounded-[10px]"
        style={{
          background: "var(--qc-card)",
          padding: "10px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {loading
          ? Array.from({ length: displayCount }).map((_, i) => <SkeletonCard key={i} />)
          : baskets.map((basket) => <BasketCard key={basket.id} basket={basket} />)
        }
      </div>
    </div>
  );
}
