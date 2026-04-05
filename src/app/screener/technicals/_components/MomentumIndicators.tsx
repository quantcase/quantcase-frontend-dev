"use client";

import { Zap, Layers } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TechnicalsMomentumRaw } from "@/types/technicals";
import { rsiZoneColor } from "./helpers";

interface MomentumIndicatorsProps {
  momentum: TechnicalsMomentumRaw;
}

export function MomentumIndicators({ momentum }: MomentumIndicatorsProps) {
  const macdItems = [
    { label: "MACD Value", value: momentum.macd.value.toFixed(2), colored: false },
    { label: "Signal Line", value: momentum.macd.signal.toFixed(2), colored: false },
    { label: "Histogram", value: momentum.macd.histogram.toFixed(2), colored: true },
  ];

  return (
    <SectionPanel
      title="Momentum Indicators"
      subtitle="RSI, MACD, and Stochastic oscillator readings"
    >
      <div className="pb-4">
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          {/* RSI Row */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-dashed border-zinc-200">
            <div className="flex items-center gap-2 w-36 shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                RSI (14)
              </span>
            </div>
            <div className="flex-1">
              <div className="relative h-1.5 rounded-full bg-zinc-100">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-zinc-900"
                  style={{ width: `${Math.min(momentum.rsi.value, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-zinc-400">0</span>
                <span className="text-[10px] text-zinc-400">100</span>
              </div>
            </div>
            <div className="text-right w-28 shrink-0">
              <span className={`text-lg font-semibold ${rsiZoneColor(momentum.rsi.zone)}`}>
                {momentum.rsi.value.toFixed(2)}
              </span>
              <p className="text-[10px] uppercase tracking-wider text-[#888888] mt-0.5">
                {momentum.rsi.zone}
              </p>
            </div>
          </div>

          {/* MACD Row */}
          <div className="border-b border-dashed border-zinc-200">
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <Zap className="h-3 w-3 text-zinc-400" />
              <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                MACD
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  momentum.macd.crossover === "ABOVE"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {momentum.macd.crossover}
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-dashed divide-zinc-200 border-t border-dashed border-zinc-200">
              {macdItems.map(({ label, value, colored }) => (
                <div key={label} className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                    {label}
                  </span>
                  <span
                    className={`text-lg font-semibold leading-tight ${
                      colored
                        ? momentum.macd.histogram >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                        : "text-[#0F172B]"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stochastic Row */}
          <div className="flex items-center gap-4 px-4 py-3">
            <Layers className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                Stochastic
              </span>
              <p className="text-sm text-[#0F172B] font-medium mt-0.5">
                K: {momentum.stochastic.k.toFixed(2)} / D: {momentum.stochastic.d.toFixed(2)}
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                momentum.stochastic.signal === "BUY"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : momentum.stochastic.signal === "SELL"
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
              }`}
            >
              {momentum.stochastic.signal}
            </span>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
