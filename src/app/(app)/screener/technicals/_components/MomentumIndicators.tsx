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
        <div
          className="rounded-[10px] border overflow-hidden"
          style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
        >
          {/* RSI Row */}
          <div
            className="flex items-center gap-4 px-4 py-3"
            style={{ borderBottom: "1px dashed var(--qc-hair-2)" }}
          >
            <div className="flex items-center gap-2 w-36 shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>
                RSI (14)
              </span>
            </div>
            <div className="flex-1">
              <div className="relative h-1.5 rounded-full" style={{ background: "var(--qc-section)" }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${Math.min(momentum.rsi.value, 100)}%`, background: "var(--qc-ink)" }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="font-mono text-[10px]" style={{ color: "var(--qc-ink-2)" }}>0</span>
                <span className="font-mono text-[10px]" style={{ color: "var(--qc-ink-2)" }}>100</span>
              </div>
            </div>
            <div className="text-right w-28 shrink-0">
              <span className="text-lg font-semibold" style={{ color: rsiZoneColor(momentum.rsi.zone) }}>
                {momentum.rsi.value.toFixed(2)}
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] mt-0.5" style={{ color: "var(--qc-ink-2)" }}>
                {momentum.rsi.zone}
              </p>
            </div>
          </div>

          {/* MACD Row */}
          <div style={{ borderBottom: "1px dashed var(--qc-hair-2)" }}>
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <Zap className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>
                MACD
              </span>
              <span
                className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]"
                style={momentum.macd.crossover === "ABOVE"
                  ? { background: "var(--qc-up-soft)", color: "var(--qc-up)" }
                  : { background: "var(--qc-down-soft)", color: "var(--qc-down)" }
                }
              >
                {momentum.macd.crossover}
              </span>
            </div>
            <div
              className="grid grid-cols-3"
              style={{ borderTop: "1px dashed var(--qc-hair-2)" }}
            >
              {macdItems.map(({ label, value, colored }, i) => (
                <div
                  key={label}
                  className="px-4 py-3 flex flex-col gap-0.5"
                  style={i > 0 ? { borderLeft: "1px dashed var(--qc-hair-2)" } : undefined}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>
                    {label}
                  </span>
                  <span
                    className="text-lg font-semibold leading-tight"
                    style={{
                      color: colored
                        ? momentum.macd.histogram >= 0
                          ? "var(--qc-up)"
                          : "var(--qc-down)"
                        : "var(--qc-ink)"
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stochastic Row */}
          <div className="flex items-center gap-4 px-4 py-3">
            <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--qc-ink-2)" }} />
            <div className="flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>
                Stochastic
              </span>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--qc-ink)" }}>
                K: {momentum.stochastic.k.toFixed(2)} / D: {momentum.stochastic.d.toFixed(2)}
              </p>
            </div>
            <span
              className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-[4px] border"
              style={momentum.stochastic.signal === "BUY"
                ? { background: "var(--qc-up-soft)", color: "var(--qc-up)", borderColor: "var(--qc-up)" }
                : momentum.stochastic.signal === "SELL"
                  ? { background: "var(--qc-down-soft)", color: "var(--qc-down)", borderColor: "var(--qc-down)" }
                  : { background: "var(--qc-warn-soft)", color: "var(--qc-warn)", borderColor: "var(--qc-warn)" }
              }
            >
              {momentum.stochastic.signal}
            </span>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
