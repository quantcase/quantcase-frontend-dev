"use client";

import { Brain } from "lucide-react";
import type { DecisionIntelligence } from "@/types/technicals";

function convictionConfig(level: string): { color: string; barColor: string; position: string } {
  const l = level.toLowerCase();
  if (l === "high") return { color: "text-emerald-600", barColor: "bg-emerald-600", position: "w-full" };
  if (l === "medium") return { color: "text-amber-600", barColor: "bg-amber-600", position: "w-2/3" };
  return { color: "text-red-600", barColor: "bg-red-600", position: "w-1/3" };
}

interface Props {
  di: DecisionIntelligence;
}

export function DecisionIntelligenceBanner({ di }: Props) {
  const conviction = convictionConfig(di.convictionLevel);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      {/* Card header */}
      <div className="flex items-center gap-2.5 px-3 pt-2 pb-3">
        <div className="p-1.5 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-white">
          <Brain className="h-4 w-4 text-zinc-600" />
        </div>
        <h5 className="text-[#0F172B]">Decision Intelligence</h5>
      </div>

      {/* Content row: 3 columns — [Regime+Conviction] | [Action Bias] | [Growth | Value] */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] px-5 py-5">
        <div className="flex gap-0 divide-x divide-[#E2E2E2]">

          {/* Col 1: Current Regime + Conviction Level */}
          <div className="flex flex-col gap-4 pr-6" style={{ flex: "0 0 34%" }}>
            {/* Regime */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Current Regime</p>
              <p className="text-[14px] font-semibold text-[#0F172B] leading-snug">{di.currentRegime.label}</p>
              <p className="text-[12px] text-[#888888] leading-relaxed">{di.currentRegime.description}</p>
            </div>

            {/* Conviction Level */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Conviction</p>
                <span className={`text-[11px] font-semibold ${conviction.color}`}>{di.convictionLevel}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E2E2E2] overflow-hidden">
                <div className={`h-full rounded-full ${conviction.barColor} ${conviction.position} transition-all`} />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-[#888888]">Low</span>
                <span className="text-[10px] text-[#888888]">Medium</span>
                <span className="text-[10px] text-[#888888]">High</span>
              </div>
            </div>
          </div>

          {/* Col 2: Action Bias */}
          <div className="flex flex-col gap-1 px-6" style={{ flex: "0 0 30%" }}>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Action Bias</p>
            <p className="text-[13px] text-[#121212] leading-relaxed">{di.actionBias}</p>
          </div>

          {/* Col 3: Growth + Value side-by-side (no "Strategy Views" title) */}
          <div className="flex gap-0 divide-x divide-[#E2E2E2] pl-6" style={{ flex: "1 1 0%" }}>
            {/* Growth */}
            <div className="flex flex-col gap-1 pr-6 flex-1">
              <p className="text-[10px] font-semibold text-[#0F172B] uppercase tracking-wider">Growth Strategy</p>
              <p className="text-[12px] text-[#888888] leading-relaxed">{di.strategyViews.growth}</p>
            </div>
            {/* Value */}
            <div className="flex flex-col gap-1 pl-6 flex-1">
              <p className="text-[10px] font-semibold text-[#0F172B] uppercase tracking-wider">Value Strategy</p>
              <p className="text-[12px] text-[#888888] leading-relaxed">{di.strategyViews.value}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
