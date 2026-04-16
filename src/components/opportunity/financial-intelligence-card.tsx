"use client";

import { useState } from "react";
import { DollarSign, Info } from "lucide-react";
import type { FinancialStrengthSectionFull, IndustrySignalBreakdownItem } from "@/types/opportunity";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentColors(sentiment: IndustrySignalBreakdownItem["sentiment"]) {
  if (sentiment === "positive") return {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    fill: "#059669",
  };
  if (sentiment === "negative") return {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    fill: "#dc2626",
  };
  return {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    fill: "#D97706",
  };
}

function scoreColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.7) return "#059669";
  if (pct >= 0.4) return "#D97706";
  return "#dc2626";
}

function statusTheme(status: string, color?: string) {
  const c = (color ?? status ?? "").toLowerCase();
  if (c === "green" || c === "high" || c === "favorable" || c === "strong") return {
    border: "#059669", bg: "rgba(5,150,105,0.04)", tagBg: "bg-emerald-600",
    insightBorder: "border-emerald-200", insightBg: "bg-emerald-50/50",
  };
  if (c === "red" || c === "low" || c === "unfavorable" || c === "weak") return {
    border: "#dc2626", bg: "rgba(220,38,38,0.04)", tagBg: "bg-red-600",
    insightBorder: "border-red-200", insightBg: "bg-red-50/50",
  };
  return {
    border: "#D97706", bg: "rgba(217,119,6,0.04)", tagBg: "bg-amber-600",
    insightBorder: "border-amber-200", insightBg: "bg-amber-50/50",
  };
}

// ─── Signal Bucket with hover popover ─────────────────────────────────────────

function SignalBucket({ item }: { item: IndustrySignalBreakdownItem }) {
  const [open, setOpen] = useState(false);
  const sc = sentimentColors(item.sentiment);
  const fill = scoreColor(item.score, item.max_score);
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
                width: 6,
                height: 10,
                borderRadius: 1,
                backgroundColor: i < filledTicks ? fill : "#E2E8F0",
              }}
            />
          ))}
        </div>

        <p className={`text-[12px] font-semibold ${sc.text}`}>
          {item.score}/{item.max_score}
        </p>
      </div>

      {open && (
        <div
          className="absolute right-full top-0 mr-2 z-50 w-72 rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl"
          style={{ minWidth: 288 }}
        >
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

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  data: FinancialStrengthSectionFull;
}

export function FinancialIntelligenceCard({ data }: Props) {
  const fs = data.final_scoring;
  if (!fs) return null;

  const score = fs.score ?? 0;
  const maxScore = fs.max_score ?? 10;
  const status = fs.status ?? "NEUTRAL";
  const color = fs.color ?? fs.status_color;
  const theme = statusTheme(status, color);
  const signals = fs.signal_breakdown ?? [];
  const takeaway = data.text?.takeaway ?? fs.body;

  const scoreBarPct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const scoreBarColor = scoreColor(score, maxScore);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full">
      {/* Card header */}
      <div className="flex items-center gap-2.5 pb-3 px-1 pt-1">
        <div className="p-1.5 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-white">
          <DollarSign className="h-4 w-4 text-zinc-600" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", letterSpacing: "0.01em" }}>
          Financial Intelligence
        </span>
      </div>

      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] px-5 py-5 flex flex-col gap-5">

        {/* Top accent block — score + status */}
        <div
          className="rounded-[10px] border px-4 py-4 flex flex-col gap-3"
          style={{ borderColor: theme.border, borderTopWidth: 3, backgroundColor: theme.bg }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
                Financial Strength Score
              </p>
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: 40, fontWeight: 500, color: "#0F172B", lineHeight: 1 }}>
                  {score}
                </span>
                <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(18,18,18,0.40)" }}>
                  /{maxScore}
                </span>
              </div>
            </div>
            <span className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold text-white mt-1 ${theme.tagBg}`}>
              {status}
            </span>
          </div>

          {/* Score bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-[#E2E2E2] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${scoreBarPct}%`, backgroundColor: scoreBarColor }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#888888]">Weak</span>
              <span className="text-[10px] text-[#888888]">Moderate</span>
              <span className="text-[10px] text-[#888888]">Strong</span>
            </div>
          </div>

          {/* Takeaway */}
          {takeaway && (
            <div className={`rounded-lg border ${theme.insightBorder} ${theme.insightBg} px-4 py-3`}>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
                Key Takeaway
              </p>
              <p style={{ fontSize: 13, color: "#121212", lineHeight: 1.6 }}>{takeaway}</p>
            </div>
          )}
        </div>

        {/* Signal Breakdown */}
        {signals.length > 0 && (
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
                {signals.map((item) => (
                  <SignalBucket key={item.key} item={item} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Scoring Criteria */}
        {(fs.checks ?? []).length > 0 && (
          <>
            <div className="border-t border-[#E2E2E2]" />
            <div>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                Scoring Criteria
              </p>
              <div className="space-y-1.5">
                {fs.checks!.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: c.result ? "#059669" : "#E2E2E2", fontSize: 8, fontWeight: 700 }}
                    >
                      {c.result ? "✓" : ""}
                    </span>
                    <p style={{ fontSize: 11, color: c.result ? "#121212" : "#888888", lineHeight: 1.5 }}>
                      {c.description}
                      {c.points > 0 && (
                        <span style={{ color: "#059669", fontWeight: 600 }}> +{c.points}</span>
                      )}
                    </p>
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
