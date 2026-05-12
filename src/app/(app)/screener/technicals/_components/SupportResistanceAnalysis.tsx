"use client";

import {
  AlertTriangle,
  Target,
  TrendingUp,
  TrendingDown,
  Scale,
  Crosshair,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { SRRangeBar } from "./SRRangeBar";
import { TechnicalsPriceRaw, TechnicalsSupportResistanceRaw, TechnicalsDerived } from "@/types/technicals";

interface SupportResistanceAnalysisProps {
  price: TechnicalsPriceRaw;
  supportResistance: TechnicalsSupportResistanceRaw;
  derived: TechnicalsDerived;
}

const FIB_LABELS = ["0%", "23.6%", "38.2%", "50%", "61.8%", "78.6%", "100%"];

export function SupportResistanceAnalysis({
  price,
  supportResistance,
  derived,
}: SupportResistanceAnalysisProps) {
  const riskRewardDisplay =
    derived.downsideToSupport === 0 ? "N/A" : `${derived.riskReward.toFixed(2)}x`;

  const row1Items = [
    {
      icon: AlertTriangle,
      label: "Support",
      value: `₹${derived.supportNum.toLocaleString("en-IN")}`,
      sub: "Key floor level",
      change: null as null | "positive" | "negative",
    },
    {
      icon: Target,
      label: "Resistance",
      value: `₹${derived.resistanceNum.toLocaleString("en-IN")}`,
      sub: "Key ceiling level",
      change: null as null | "positive" | "negative",
    },
    {
      icon: TrendingUp,
      label: "Upside to Resistance",
      value: `+${derived.upsideToResistance.toFixed(2)}%`,
      sub: null as string | null,
      change: "positive" as null | "positive" | "negative",
    },
    {
      icon: TrendingDown,
      label: "Downside to Support",
      value: `-${derived.downsideToSupport.toFixed(2)}%`,
      sub: null as string | null,
      change: "negative" as null | "positive" | "negative",
    },
  ];

  const row2Items = [
    {
      icon: Scale,
      label: "Risk / Reward",
      value: riskRewardDisplay,
      sub: "Upside ÷ Downside",
    },
    {
      icon: Crosshair,
      label: "Pivot Point",
      value: `₹${supportResistance.pivotPoints.pivot.toFixed(2)}`,
      sub: "Daily pivot level",
    },
    {
      icon: ArrowUpRight,
      label: "Resistance R1 / R2",
      value: `₹${supportResistance.pivotPoints.r1.toFixed(2)}`,
      sub: `R2: ₹${supportResistance.pivotPoints.r2.toFixed(2)}`,
    },
    {
      icon: ArrowDownRight,
      label: "Support S1 / S2",
      value: `₹${supportResistance.pivotPoints.s1.toFixed(2)}`,
      sub: `S2: ₹${supportResistance.pivotPoints.s2.toFixed(2)}`,
    },
  ];

  return (
    <SectionPanel
      title="Support & Resistance Analysis"
      subtitle="Price position within identified support/resistance band"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Left: SR bar + Fibonacci */}
        <div className="col-span-1 flex flex-col gap-4">
          <SRRangeBar
            support={derived.supportNum}
            resistance={derived.resistanceNum}
            cmp={price.cmp}
            positionInRange={derived.positionInRange}
          />
          {supportResistance.fibonacci.length > 0 && (
            <div className="pt-4" style={{ borderTop: "1px solid var(--qc-hair-2)" }}>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.14em] mb-3 block px-2"
                style={{ color: "var(--qc-ink-2)" }}
              >
                Fibonacci Retracement Levels
              </span>
              <div className="px-2 pb-2 space-y-2">
                {(() => {
                  const fibs = [...supportResistance.fibonacci].sort((a, b) => b - a);
                  const min = fibs[fibs.length - 1];
                  const max = fibs[0];
                  const range = max - min || 1;
                  return fibs.map((level, i) => {
                    const pct = ((level - min) / range) * 100;
                    const isCurrent =
                      price.cmp >= level - range * 0.05 && price.cmp <= level + range * 0.05;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className="font-mono text-[10px]"
                          style={{
                            color: "var(--qc-ink-2)",
                            width: 36,
                            textAlign: "right",
                            flexShrink: 0,
                          }}
                        >
                          {FIB_LABELS[i] ?? ""}
                        </span>
                        <div className="flex-1 relative h-5 flex items-center">
                          <div
                            className="absolute inset-0 rounded-[4px]"
                            style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair-2)" }}
                          />
                          <div
                            className="absolute left-0 top-0 h-full rounded-[4px]"
                            style={{
                              width: `${pct}%`,
                              background: isCurrent ? "var(--qc-ink)" : "rgba(14,14,12,0.12)",
                            }}
                          />
                          <span
                            className="relative z-10 pl-2 font-semibold"
                            style={{
                              fontSize: 11,
                              color: isCurrent ? "var(--qc-on-dark)" : "var(--qc-ink)",
                            }}
                          >
                            ₹{level.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Right: metrics grid */}
        <div className="col-span-2 pb-4">
          <div
            className="rounded-[10px] border overflow-hidden"
            style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
          >
            <div className="grid grid-cols-4">
              {row1Items.map(({ icon: Icon, label, value, sub, change }, i) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 px-4 py-3"
                  style={i > 0 ? { borderLeft: "1px dashed var(--qc-hair-2)" } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3" style={{ color: "var(--qc-ink-2)" }} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>
                      {label}
                    </span>
                  </div>
                  <span
                    className="text-lg font-semibold leading-tight"
                    style={{
                      color: change === "positive"
                        ? "var(--qc-up)"
                        : change === "negative"
                          ? "var(--qc-down)"
                          : "var(--qc-ink)"
                    }}
                  >
                    {value}
                  </span>
                  {sub && <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>{sub}</span>}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px dashed var(--qc-hair-2)" }} />
            <div className="grid grid-cols-4">
              {row2Items.map(({ icon: Icon, label, value, sub }, i) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 px-4 py-3"
                  style={i > 0 ? { borderLeft: "1px dashed var(--qc-hair-2)" } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3" style={{ color: "var(--qc-ink-2)" }} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>
                      {label}
                    </span>
                  </div>
                  <span className="text-lg font-semibold leading-tight" style={{ color: "var(--qc-ink)" }}>
                    {value}
                  </span>
                  {sub && <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>{sub}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
