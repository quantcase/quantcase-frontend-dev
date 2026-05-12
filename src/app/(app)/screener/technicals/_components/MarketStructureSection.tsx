"use client";

import { SectionPanel } from "@/components/molecules/section-panel";
import { TechnicalsTrendRaw, TechnicalsPattern } from "@/types/technicals";
import { directionColor } from "./helpers";

interface MarketStructureSectionProps {
  trend: TechnicalsTrendRaw;
  patterns: TechnicalsPattern[];
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em]"
      style={{ color, background: color + "1A", border: `1px solid ${color}33` }}
    >
      {label}
    </span>
  );
}

export function MarketStructureSection({ trend, patterns }: MarketStructureSectionProps) {
  const trendStrengthColor =
    trend.strength === "STRONG" && trend.direction === "UPTREND"
      ? "var(--qc-up)"
      : trend.strength === "STRONG" && trend.direction === "DOWNTREND"
        ? "var(--qc-down)"
        : "var(--qc-warn)";

  const phaseColor =
    trend.phase === "MARK-DOWN" || trend.phase === "DISTRIBUTION"
      ? "var(--qc-down)"
      : "var(--qc-up)";

  return (
    <SectionPanel
      title="Market Structure"
      subtitle="Trend direction, Wyckoff phase & identified price pattern"
    >
      <div className="pb-4" style={{ borderColor: "var(--qc-hair-2)" }}>
        {[
          {
            title: "Trend",
            desc: "Medium-term price direction",
            right: <StatusBadge label={trend.direction} color={directionColor(trend.direction)} />,
          },
          {
            title: "Trend Strength",
            desc: `ADX ${trend.adx14.toFixed(1)}`,
            right: <StatusBadge label={trend.strength} color={trendStrengthColor} />,
          },
          {
            title: "Wyckoff Phase",
            desc: "Current market cycle phase",
            right: <StatusBadge label={trend.phase} color={phaseColor} />,
          },
          {
            title: "Price Pattern",
            desc: "Identified chart formation",
            right: (
              <span
                className="inline-flex items-center rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em]"
                style={{ color: "var(--qc-ink-2)", background: "var(--qc-section)", border: "1px solid var(--qc-hair-2)" }}
              >
                {patterns[0]?.name ?? "None"}
              </span>
            ),
          },
          {
            title: "Market Structure",
            desc: "Price action sequence",
            right: (
              <div className="flex flex-col gap-1 items-end">
                <span
                  className="font-mono text-[10px] font-semibold"
                  style={{ color: trend.structure.higherHighs ? "var(--qc-up)" : "var(--qc-down)" }}
                >
                  {trend.structure.higherHighs ? "Higher Highs" : "Lower Highs"}
                </span>
                <span
                  className="font-mono text-[10px] font-semibold"
                  style={{ color: trend.structure.higherLows ? "var(--qc-up)" : "var(--qc-down)" }}
                >
                  {trend.structure.higherLows ? "Higher Lows" : "Lower Lows"}
                </span>
              </div>
            ),
          },
        ].map(({ title, desc, right }, i) => (
          <div
            key={title}
            className="flex items-center justify-between py-2.5 px-2"
            style={i > 0 ? { borderTop: "1px solid var(--qc-hair-2)" } : undefined}
          >
            <div className="space-y-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink)" }}>{title}</p>
              <p className="text-[12px]" style={{ color: "var(--qc-ink)" }}>{desc}</p>
            </div>
            {right}
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
