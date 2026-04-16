"use client";

import { useState } from "react";
import { Factory, Info, ArrowRight, Clock } from "lucide-react";
import type { IndustryOverviewSection, IndustrySignalBreakdownItem, IndustryInvestmentImplications } from "@/types/opportunity";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentColors(sentiment: IndustrySignalBreakdownItem["sentiment"]) {
  if (sentiment === "positive") return {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    tagBg: "bg-emerald-600",
    accentBorder: "#059669",
    accentBg: "rgba(5,150,105,0.04)",
  };
  if (sentiment === "negative") return {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    tagBg: "bg-red-600",
    accentBorder: "#dc2626",
    accentBg: "rgba(220,38,38,0.04)",
  };
  return {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    tagBg: "bg-amber-600",
    accentBorder: "#D97706",
    accentBg: "rgba(217,119,6,0.04)",
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
  if (c === "green" || c === "high" || c === "favorable") return {
    border: "#059669", bg: "rgba(5,150,105,0.04)", tagBg: "bg-emerald-600",
    insightBorder: "border-emerald-200", insightBg: "bg-emerald-50/50",
  };
  if (c === "red" || c === "low" || c === "unfavorable") return {
    border: "#dc2626", bg: "rgba(220,38,38,0.04)", tagBg: "bg-red-600",
    insightBorder: "border-red-200", insightBg: "bg-red-50/50",
  };
  return {
    border: "#D97706", bg: "rgba(217,119,6,0.04)", tagBg: "bg-amber-600",
    insightBorder: "border-amber-200", insightBg: "bg-amber-50/50",
  };
}

// ─── Signal Bucket with inline hover popover ──────────────────────────────────

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
      <div
        className={`text-left rounded-lg border ${sc.border} ${sc.bg} px-3 py-2.5 cursor-default`}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
            {item.label}
          </p>
          <Info className="h-3 w-3 text-[#AAAAAA]" />
        </div>

        {/* Mini score bar */}
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

      {/* Hover popover */}
      {open && (
        <div
          className="absolute right-full top-0 mr-2 z-50 w-72 rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl"
          style={{ minWidth: 288 }}
        >
          {/* Header */}
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

          {/* Details */}
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

// ─── Clamped text with hover popover ──────────────────────────────────────────

function ClampedText({
  text,
  label,
  fontSize = 12,
  color = "#121212",
  fontWeight,
}: {
  text: string;
  label: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <p
        style={{
          fontSize,
          color,
          lineHeight: 1.5,
          fontWeight,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {text}
      </p>

      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl"
          style={{ minWidth: 256 }}
        >
          <div className="px-4 py-3 border-b border-[#E2E2E2] bg-[#F5F5F5] rounded-t-[10px]">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
              {label}
            </p>
          </div>
          <div className="px-4 py-3">
            <p style={{ fontSize: 13, color: "#121212", lineHeight: 1.6 }}>{text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recommended Strategy ─────────────────────────────────────────────────────

function RecommendedStrategyCard({ strategy }: { strategy: IndustryInvestmentImplications["recommended_strategy"] }) {
  if (!strategy) return null;

  const rows: { label: string; value: string }[] = [
    { label: "Thesis", value: strategy.thesis },
    { label: "Timing", value: strategy.timing },
    { label: "Segment", value: strategy.segment },
    { label: "Rationale", value: strategy.rationale },
  ].filter((r) => r.value);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
          Recommended Strategy
        </p>
        <div className="flex-1 h-px bg-[#E2E2E2]" />
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-3 space-y-2" style={{ borderTopWidth: 3, borderTopColor: "#2563eb" }}>
        {/* Action headline — clamped */}
        <div className="flex items-start gap-2">
          <ArrowRight className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <ClampedText text={strategy.action} label="Action" fontSize={13} fontWeight={600} color="#0F172B" />
        </div>

        {/* Detail rows — each value clamped */}
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-1.5 min-w-0">
              <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider shrink-0 w-[58px] mt-0.5 mr-2">{r.label}</span>
              <ClampedText text={r.value} label={r.label} fontSize={12} color="#121212" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Next Quarter Watch Points ─────────────────────────────────────────────────

function NextQuarterWatchPoints({ watchpoints }: { watchpoints: string[] }) {
  if (!watchpoints || watchpoints.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-3 w-3 text-[#888888]" />
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
          Next Quarter Watch Points
        </p>
        <div className="flex-1 h-px bg-[#E2E2E2]" />
      </div>

      <div className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3 space-y-2">
        {watchpoints.map((point, i) => (
          <div key={i} className="flex items-start gap-2 min-w-0">
            <span className="text-[10px] text-[#AAAAAA] shrink-0 mt-0.5">→</span>
            <ClampedText text={point} label={`Watch Point ${i + 1}`} fontSize={12} color="#121212" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  data: IndustryOverviewSection;
  investmentImplications?: IndustryInvestmentImplications;
}

export function IndustryIntelligenceCard({ data, investmentImplications }: Props) {
  const fs = data.final_scoring;
  if (!fs) return null;

  const score = fs.score ?? 0;
  const maxScore = fs.checks?.length ?? 10;
  const status = fs.status ?? "NEUTRAL";
  const color = fs.color ?? fs.status_color;
  const theme = statusTheme(status, color);
  const signals = fs.signal_breakdown ?? [];
  const takeaway = data.text?.takeaway;
  const sector = data.sector;
  const period = data.period;

  // Score bar fill
  const scoreBarPct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const scoreBarColor = scoreColor(score, maxScore);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full">
      {/* Card header */}
      <div className="flex items-center gap-2.5 pb-3 px-1 pt-1">
        <div className="p-1.5 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-white">
          <Factory className="h-4 w-4 text-zinc-600" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", letterSpacing: "0.01em" }}>
          Industry Intelligence
        </span>
        {sector && (
          <span className="ml-auto text-[10px] font-medium text-[#888888] bg-white border border-[#E2E2E2] rounded-sm px-2 py-0.5">
            {sector}
          </span>
        )}
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
                Industry Attractiveness Score
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
            <span
              className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold text-white mt-1 ${theme.tagBg}`}
            >
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
              <span className="text-[10px] text-[#888888]">Low</span>
              <span className="text-[10px] text-[#888888]">Medium</span>
              <span className="text-[10px] text-[#888888]">High</span>
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

        {/* Divider */}
        <div className="border-t border-[#E2E2E2]" />

        {/* Signal Breakdown */}
        {signals.length > 0 && (
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
        )}

        {/* Recommended Strategy */}
        {investmentImplications?.recommended_strategy && (
          <>
            <div className="border-t border-[#E2E2E2]" />
            <RecommendedStrategyCard strategy={investmentImplications.recommended_strategy} />
          </>
        )}

        {/* Next Quarter Watch Points */}
        {(investmentImplications?.next_quarter_watchpoints ?? []).length > 0 && (
          <>
            <div className="border-t border-[#E2E2E2]" />
            <NextQuarterWatchPoints watchpoints={investmentImplications!.next_quarter_watchpoints} />
          </>
        )}

        {/* Scoring checks */}
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

        {/* Period footnote */}
        {period && (
          <p className="text-[10px] text-[#AAAAAA] text-right -mt-2">{period}</p>
        )}
      </div>
    </div>
  );
}
