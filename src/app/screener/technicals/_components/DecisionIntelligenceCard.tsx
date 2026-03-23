"use client";

import { Brain, TrendingUp } from "lucide-react";
import { DecisionIntelligence } from "@/types/technicals";

interface Props {
  di: DecisionIntelligence;
}

function convictionConfig(level: string): { color: string; barColor: string; width: string } {
  const l = level.toLowerCase();
  if (l === "high") return { color: "text-emerald-600", barColor: "bg-emerald-600", width: "w-full" };
  if (l === "medium") return { color: "text-amber-600", barColor: "bg-amber-600", width: "w-2/3" };
  return { color: "text-red-600", barColor: "bg-red-600", width: "w-1/3" };
}

export function DecisionIntelligenceCard({ di }: Props) {
  const conviction = convictionConfig(di.convictionLevel);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E2E2] bg-[#F5F5F5]">
        <div className="p-1.5 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
          <Brain className="h-4 w-4 text-zinc-600" />
        </div>
        <h5 className="text-[#0F172B]">Decision Intelligence</h5>
      </div>

      <div className="p-4 space-y-5">
        {/* Current Regime */}
        <div className="space-y-2">
          <p className="text-[10px] font-500 text-[#888888] uppercase tracking-wider">Current Regime</p>
          <div className="rounded-[8px] bg-[#F5F5F5] px-3 py-3 space-y-1">
            <p className="text-[15px] font-semibold text-[#0F172B] leading-snug">{di.currentRegime.label}</p>
            <p className="text-[12px] text-[#888888] leading-relaxed">{di.currentRegime.description}</p>
          </div>
        </div>

        {/* Action Bias */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
            <p className="text-[10px] font-500 text-[#888888] uppercase tracking-wider">Action Bias</p>
          </div>
          <p className="text-[12px] text-[#888888] leading-relaxed">{di.actionBias}</p>
        </div>

        {/* Strategy Views */}
        <div className="space-y-2">
          <p className="text-[10px] font-500 text-[#888888] uppercase tracking-wider">Strategy Views</p>
          <div className="space-y-2">
            <div className="rounded-[8px] border border-[#E2E2E2] bg-white px-3 py-2.5 space-y-1">
              <p className="text-[11px] font-semibold text-[#0F172B] uppercase tracking-wide">Growth Strategy View</p>
              <p className="text-[12px] text-[#888888] leading-relaxed">{di.strategyViews.growth}</p>
            </div>
            <div className="rounded-[8px] border border-[#E2E2E2] bg-white px-3 py-2.5 space-y-1">
              <p className="text-[11px] font-semibold text-[#0F172B] uppercase tracking-wide">Value Strategy View</p>
              <p className="text-[12px] text-[#888888] leading-relaxed">{di.strategyViews.value}</p>
            </div>
          </div>
        </div>

        {/* Conviction Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-500 text-[#888888] uppercase tracking-wider">Conviction Level</p>
            <span className={`text-[12px] font-semibold ${conviction.color}`}>{di.convictionLevel}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#E2E2E2] overflow-hidden">
            <div className={`h-full rounded-full ${conviction.barColor} ${conviction.width} transition-all`} />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-[#888888]">Low</span>
            <span className="text-[10px] text-[#888888]">Medium</span>
            <span className="text-[10px] text-[#888888]">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
