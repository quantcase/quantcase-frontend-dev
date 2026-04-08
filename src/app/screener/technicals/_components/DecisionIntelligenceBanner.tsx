"use client";

import { useState } from "react";
import { Brain, Info } from "lucide-react";
import type { DecisionIntelligence, DecisionIntelligenceIndicator } from "@/types/technicals";

function sentimentColor(sentiment: DecisionIntelligenceIndicator["sentiment"]) {
  if (sentiment === "positive") return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" };
  if (sentiment === "negative") return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" };
  return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" };
}

function convictionConfig(level: string) {
  const l = level.toLowerCase();
  if (l === "high") return { color: "text-emerald-600", barColor: "bg-emerald-600", width: "100%" };
  if (l === "medium") return { color: "text-amber-600", barColor: "bg-amber-600", width: "66%" };
  return { color: "text-red-600", barColor: "bg-red-600", width: "33%" };
}

interface Props {
  di: DecisionIntelligence;
}

export function DecisionIntelligenceBanner({ di }: Props) {
  const conviction = convictionConfig(di.convictionLevel);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full">
      {/* Card header */}
      <div className="flex items-center gap-2.5 pb-3 px-1 pt-1">
        <div className="p-1.5 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-white">
          <Brain className="h-4 w-4 text-zinc-600" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", letterSpacing: "0.01em" }}>
          Decision Intelligence
        </span>
      </div>

      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] px-5 py-5 flex flex-col gap-5">
        {/* TAG */}
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-2">Tag</p>
          <span className="inline-block rounded-md border border-[#0F172B] px-3 py-1.5 text-[13px] font-semibold text-[#0F172B]">
            {di.tag}
          </span>
        </div>

        {/* Lens / Ideal For / Timeframe */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Lens", value: di.lens },
            { label: "Ideal For", value: di.idealFor },
            { label: "Timeframe", value: di.timeframe },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-[13px] font-semibold text-[#0F172B]">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Actionable Insight */}
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-2">Actionable Insight</p>
          <div className="rounded-lg border border-[#E2E2E2] bg-[#FAFAFA] px-4 py-3 text-[13px] text-[#121212] leading-relaxed">
            {di.actionableInsight.action}. {di.actionableInsight.firstShift} {di.actionableInsight.existingHolderAction} {di.actionableInsight.reEvaluateCondition}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E2E2E2]" />

        {/* Signal Breakdown */}
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">Signal Breakdown</p>
          <div className="grid grid-cols-2 gap-2.5">
            {di.indicators.map((ind) => {
              const sc = sentimentColor(ind.sentiment);
              return (
                <SignalBucket key={ind.name} indicator={ind} sc={sc} />
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E2E2E2]" />

        {/* Conviction Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Conviction Meter</p>
            <span className={`text-[11px] font-semibold ${conviction.color}`}>{di.convictionLevel}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#E2E2E2] overflow-hidden">
            <div
              className={`h-full rounded-full ${conviction.barColor} transition-all`}
              style={{ width: conviction.width }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#888888]">Low</span>
            <span className="text-[10px] text-[#888888]">Medium</span>
            <span className="text-[10px] text-[#888888]">High</span>
          </div>
        </div>

        {/* What Can Change */}
        {di.whatCanChange.length > 0 && (
          <>
            <div className="border-t border-[#E2E2E2]" />
            <div>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-2">What Can Change</p>
              <ul className="space-y-1.5">
                {di.whatCanChange.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-[#888888] leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SignalBucket({
  indicator,
  sc,
}: {
  indicator: DecisionIntelligenceIndicator;
  sc: ReturnType<typeof sentimentColor>;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative rounded-lg border ${sc.border} ${sc.bg} px-3 py-2.5`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">{indicator.name}</p>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info className="h-3 w-3 text-[#AAAAAA] cursor-help" />
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-1.5 z-50 w-48 rounded-md border border-[#E2E2E2] bg-white px-3 py-2 shadow-lg">
              <p className="text-[11px] text-[#555555] leading-relaxed">{indicator.explanation}</p>
            </div>
          )}
        </div>
      </div>
      <p className={`text-[12px] font-semibold ${sc.text}`}>{indicator.tag}</p>
    </div>
  );
}
