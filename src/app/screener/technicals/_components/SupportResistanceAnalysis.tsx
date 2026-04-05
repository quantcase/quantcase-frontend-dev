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
      change: null,
    },
    {
      icon: Target,
      label: "Resistance",
      value: `₹${derived.resistanceNum.toLocaleString("en-IN")}`,
      sub: "Key ceiling level",
      change: null,
    },
    {
      icon: TrendingUp,
      label: "Upside to Resistance",
      value: `+${derived.upsideToResistance.toFixed(2)}%`,
      sub: null,
      change: "positive",
    },
    {
      icon: TrendingDown,
      label: "Downside to Support",
      value: `-${derived.downsideToSupport.toFixed(2)}%`,
      sub: null,
      change: "negative",
    },
  ] as const;

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
  ] as const;

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
            <div className="border-t border-zinc-100 pt-4">
              <h6 className="uppercase tracking-wider mb-3 px-2">
                Fibonacci Retracement Levels
              </h6>
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
                          style={{
                            fontSize: 10,
                            color: "#888888",
                            width: 36,
                            textAlign: "right",
                            flexShrink: 0,
                          }}
                        >
                          {FIB_LABELS[i] ?? ""}
                        </span>
                        <div className="flex-1 relative h-5 flex items-center">
                          <div className="absolute inset-0 rounded-sm bg-zinc-50 border border-zinc-100" />
                          <div
                            className="absolute left-0 top-0 h-full rounded-sm"
                            style={{
                              width: `${pct}%`,
                              background: isCurrent ? "#0F172B" : "rgba(15,23,43,0.12)",
                            }}
                          />
                          <span
                            className="relative z-10 pl-2"
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: isCurrent ? "#fff" : "#0F172B",
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
          <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
            <div className="grid grid-cols-4 divide-x divide-dashed divide-zinc-200">
              {row1Items.map(({ icon: Icon, label, value, sub, change }) => (
                <div key={label} className="flex flex-col gap-1 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                      {label}
                    </span>
                  </div>
                  <span
                    className={`text-lg font-semibold leading-tight ${
                      change === "positive"
                        ? "text-emerald-600"
                        : change === "negative"
                          ? "text-red-600"
                          : "text-[#0F172B]"
                    }`}
                  >
                    {value}
                  </span>
                  {sub && <span className="text-[11px] text-[#888888]">{sub}</span>}
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-zinc-200" />
            <div className="grid grid-cols-4 divide-x divide-dashed divide-zinc-200">
              {row2Items.map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex flex-col gap-1 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                      {label}
                    </span>
                  </div>
                  <span className="text-lg font-semibold leading-tight text-[#0F172B]">
                    {value}
                  </span>
                  {sub && <span className="text-[11px] text-[#888888]">{sub}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
