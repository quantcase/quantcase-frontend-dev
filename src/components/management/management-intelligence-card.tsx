"use client";

import { useState } from "react";
import { Brain, Info, ArrowRight, Clock } from "lucide-react";
import type { ManagementIntelligence, MqiScore, IntelligenceSignalItem, IntelligenceRecommendedStrategy } from "@/types/management";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentColors(sentiment: IntelligenceSignalItem["sentiment"]) {
  if (sentiment === "positive") return {
    text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    dot: "bg-emerald-500", tagBg: "bg-emerald-600",
  };
  if (sentiment === "negative") return {
    text: "text-red-600", bg: "bg-red-50", border: "border-red-200",
    dot: "bg-red-500", tagBg: "bg-red-600",
  };
  return {
    text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    dot: "bg-amber-400", tagBg: "bg-amber-600",
  };
}

function labelTheme(label: string) {
  const l = label.toLowerCase();
  if (l === "high" || l === "strong" || l === "good") return {
    border: "#059669", bg: "rgba(5,150,105,0.04)", tagBg: "bg-emerald-600",
    insightBorder: "border-emerald-200", insightBg: "bg-emerald-50/50",
  };
  if (l === "low" || l === "poor" || l === "weak") return {
    border: "#dc2626", bg: "rgba(220,38,38,0.04)", tagBg: "bg-red-600",
    insightBorder: "border-red-200", insightBg: "bg-red-50/50",
  };
  return {
    border: "#D97706", bg: "rgba(217,119,6,0.04)", tagBg: "bg-amber-600",
    insightBorder: "border-amber-200", insightBg: "bg-amber-50/50",
  };
}

function tickColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.7) return "#059669";
  if (pct >= 0.4) return "#D97706";
  return "#dc2626";
}

// ─── Signal Bucket ─────────────────────────────────────────────────────────────

function SignalBucket({ item }: { item: IntelligenceSignalItem }) {
  const [open, setOpen] = useState(false);
  const sc = sentimentColors(item.sentiment);
  const fill = tickColor(item.score, item.max_score);
  const filledTicks = Math.round(item.score);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className={`text-left rounded-lg border ${sc.border} ${sc.bg} px-3 py-2.5 cursor-default`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
            {item.label}
          </p>
          <Info className="h-3 w-3 text-[#AAAAAA]" />
        </div>

        <div className="flex gap-0.5 mb-1.5">
          {Array.from({ length: item.max_score }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6, height: 10, borderRadius: 1,
                backgroundColor: i < filledTicks ? fill : "#E2E8F0",
              }}
            />
          ))}
        </div>

        <p className={`text-[12px] font-semibold ${sc.text}`}>
          {item.score}/{item.max_score}
        </p>
      </div>

      {open && item.details.length > 0 && (
        <div className="absolute right-full top-0 mr-2 z-50 w-72 rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl">
          <div className={`flex items-center justify-between px-4 py-3 rounded-t-[10px] border-b border-[#E2E2E2] ${sc.bg}`}>
            <div>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-0.5">
                Signal Breakdown
              </p>
              <p className="text-[14px] font-semibold text-[#0F172B]">{item.label}</p>
            </div>
            <span className={`text-[13px] font-semibold ${sc.text}`}>
              {item.score}/{item.max_score}
            </span>
          </div>
          <div className="px-4 py-4 space-y-2.5">
            {item.details.map((d, i) => (
              <div key={i} className="flex gap-2.5">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${sc.dot}`} />
                <p style={{ fontSize: 13, color: "#121212", lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recommended Strategy ─────────────────────────────────────────────────────

function RecommendedStrategyCard({ strategy }: { strategy: IntelligenceRecommendedStrategy }) {
  const rows: { label: string; value: string }[] = [
    { label: "Thesis", value: strategy.thesis ?? "" },
    { label: "Timing", value: strategy.timing ?? "" },
    { label: "Segment", value: strategy.segment ?? "" },
    { label: "Rationale", value: strategy.rationale ?? "" },
  ].filter((r) => r.value);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
          Recommended Strategy
        </p>
        <div className="flex-1 h-px bg-[#E2E2E2]" />
      </div>

      <div
        className="rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-3 space-y-2"
        style={{ borderTopWidth: 3, borderTopColor: "#2563eb" }}
      >
        <div className="flex items-start gap-2">
          <ArrowRight className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172B", lineHeight: 1.5 }}>
            {strategy.action}
          </p>
        </div>

        {rows.length > 0 && (
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-1.5 min-w-0">
                <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider shrink-0 w-[58px] mt-0.5 mr-2">
                  {r.label}
                </span>
                <p style={{ fontSize: 12, color: "#121212", lineHeight: 1.5 }}>{r.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  intelligence: ManagementIntelligence;
  mqiScore: MqiScore;
}

export function ManagementIntelligenceCard({ intelligence, mqiScore }: Props) {
  const { key_takeaways, signals_breakdown, recommended_strategy, watchouts } = intelligence;
  const theme = labelTheme(mqiScore.label);
  const scoreBarPct = (mqiScore.total / 100) * 100;
  const barColor = tickColor(mqiScore.total, 100);

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

        {/* Score + status block */}
        <div
          className="rounded-[10px] border px-4 py-4 flex flex-col gap-3"
          style={{ borderColor: theme.border, borderTopWidth: 3, backgroundColor: theme.bg }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
                Management Credibility Score
              </p>
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: 40, fontWeight: 500, color: "#0F172B", lineHeight: 1 }}>
                  {mqiScore.total}
                </span>
                <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(18,18,18,0.40)" }}>
                  /100
                </span>
              </div>
            </div>
            <span className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold text-white mt-1 ${theme.tagBg}`}>
              {mqiScore.label}
            </span>
          </div>

          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-[#E2E2E2] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${scoreBarPct}%`, backgroundColor: barColor }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#888888]">Low</span>
              <span className="text-[10px] text-[#888888]">Medium</span>
              <span className="text-[10px] text-[#888888]">High</span>
            </div>
          </div>

          {key_takeaways.length > 0 && (
            <div className={`rounded-lg border ${theme.insightBorder} ${theme.insightBg} px-4 py-3`}>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
                Key Takeaway
              </p>
              <p style={{ fontSize: 13, color: "#121212", lineHeight: 1.6 }}>{key_takeaways[0]}</p>
            </div>
          )}
        </div>

        {/* Signal Breakdown */}
        {signals_breakdown.length > 0 && (
          <>
            <div className="border-t border-[#E2E2E2]" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                  Signal Breakdown
                </p>
                <p className="text-[10px] text-[#AAAAAA]">Hover for details</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {signals_breakdown.map((item) => (
                  <SignalBucket key={item.key} item={item} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Recommended Strategy */}
        {recommended_strategy && (
          <>
            <div className="border-t border-[#E2E2E2]" />
            <RecommendedStrategyCard strategy={recommended_strategy} />
          </>
        )}

        {/* Watchouts */}
        {watchouts.length > 0 && (
          <>
            <div className="border-t border-[#E2E2E2]" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3 w-3 text-[#888888]" />
                <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                  Watch Outs
                </p>
                <div className="flex-1 h-px bg-[#E2E2E2]" />
              </div>
              <div className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3 space-y-2">
                {watchouts.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] text-[#AAAAAA] shrink-0 mt-0.5">→</span>
                    <p style={{ fontSize: 12, color: "#121212", lineHeight: 1.5 }}>{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
