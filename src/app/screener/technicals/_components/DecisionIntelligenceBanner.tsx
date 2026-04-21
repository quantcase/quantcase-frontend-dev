"use client";

import { useState } from "react";
import { Brain, Info } from "lucide-react";
import type { DecisionIntelligence, DecisionIntelligenceIndicator } from "@/types/technicals";

function sentimentStyle(sentiment: DecisionIntelligenceIndicator["sentiment"]) {
  if (sentiment === "positive") return {
    text: "var(--qc-up)",
    bg: "var(--qc-up-soft)",
    border: "var(--qc-up)",
    dot: "var(--qc-up)",
  };
  if (sentiment === "negative") return {
    text: "var(--qc-down)",
    bg: "var(--qc-down-soft)",
    border: "var(--qc-down)",
    dot: "var(--qc-down)",
  };
  return {
    text: "var(--qc-warn)",
    bg: "var(--qc-warn-soft)",
    border: "var(--qc-warn)",
    dot: "var(--qc-warn)",
  };
}

function convictionConfig(level: string) {
  const l = level.toLowerCase();
  if (l === "high") return { color: "var(--qc-up)", barColor: "var(--qc-up)", width: "100%" };
  if (l === "medium") return { color: "var(--qc-warn)", barColor: "var(--qc-warn)", width: "66%" };
  return { color: "var(--qc-down)", barColor: "var(--qc-down)", width: "33%" };
}

function biasTheme(indicators: DecisionIntelligenceIndicator[]) {
  let pos = 0, neg = 0;
  for (const ind of indicators) {
    if (ind.sentiment === "positive") pos++;
    else if (ind.sentiment === "negative") neg++;
  }
  if (pos > neg) return {
    borderColor: "var(--qc-up)",
    bg: "var(--qc-up-soft)",
    textColor: "var(--qc-up)",
    tagBg: "var(--qc-up)",
    insightBorderColor: "var(--qc-up)",
    insightBg: "var(--qc-up-soft)",
  };
  if (neg > pos) return {
    borderColor: "var(--qc-down)",
    bg: "var(--qc-down-soft)",
    textColor: "var(--qc-down)",
    tagBg: "var(--qc-down)",
    insightBorderColor: "var(--qc-down)",
    insightBg: "var(--qc-down-soft)",
  };
  return {
    borderColor: "var(--qc-warn)",
    bg: "var(--qc-warn-soft)",
    textColor: "var(--qc-warn)",
    tagBg: "var(--qc-warn)",
    insightBorderColor: "var(--qc-warn)",
    insightBg: "var(--qc-warn-soft)",
  };
}

interface Props {
  di: DecisionIntelligence;
}

export function DecisionIntelligenceBanner({ di }: Props) {
  const conviction = convictionConfig(di.convictionLevel);
  const theme = biasTheme(di.indicators);

  return (
    <div
      className="rounded-[14px] border p-2 h-full"
      style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 pb-3 px-1 pt-1">
        <div
          className="p-1.5 rounded-[6px] border"
          style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
        >
          <Brain className="h-4 w-4" style={{ color: "var(--qc-text-muted)" }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", letterSpacing: "0.01em" }}>
          Decision Intelligence
        </span>
      </div>

      <div
        className="rounded-[14px] border px-5 py-5 flex flex-col gap-5"
        style={{ background: "var(--qc-surface-white)", borderColor: "var(--qc-border-inner)" }}
      >
        {/* Key insights — colored accent block */}
        <div
          className="rounded-[10px] border px-4 py-4 flex flex-col gap-4"
          style={{ borderColor: theme.borderColor, borderTopWidth: 3, backgroundColor: theme.bg }}
        >
          {/* TAG */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--qc-text-muted)" }}>Tag</p>
            <span
              className="inline-block rounded-full px-3 py-1 text-[13px] font-semibold text-white"
              style={{ background: theme.tagBg }}
            >
              {di.tag}
            </span>
          </div>

          {/* Lens / Ideal For / Timeframe */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Lens", value: di.lens },
              { label: "Ideal For", value: di.idealFor },
              { label: "Timeframe", value: di.timeframe },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[8px] border px-3 py-2.5 text-center"
                style={{ borderColor: theme.borderColor, borderTopWidth: 2, background: "var(--qc-surface-white)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: "var(--qc-text-muted)" }}>{item.label}</p>
                <p className="text-[13px] font-semibold" style={{ color: theme.textColor }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Actionable Insight */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--qc-text-muted)" }}>Actionable Insight</p>
            <div
              className="rounded-[8px] border px-4 py-3 text-[13px] leading-relaxed"
              style={{ borderColor: theme.insightBorderColor, background: theme.insightBg, color: "var(--qc-text-body)" }}
            >
              {di.actionableInsight.action}. {di.actionableInsight.firstShift} {di.actionableInsight.existingHolderAction} {di.actionableInsight.reEvaluateCondition}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--qc-border-default)" }} />

        {/* Signal Breakdown */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] mb-3" style={{ color: "var(--qc-text-muted)" }}>Signal Breakdown</p>
          <div className="grid grid-cols-2 gap-2.5">
            {di.indicators.map((ind) => {
              const sc = sentimentStyle(ind.sentiment);
              return (
                <SignalBucket key={ind.name} indicator={ind} sc={sc} />
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--qc-border-default)" }} />

        {/* Conviction Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>Conviction Meter</p>
            <span className="text-[11px] font-semibold" style={{ color: conviction.color }}>{di.convictionLevel}</span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--qc-surface-row-alt)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: conviction.width, background: conviction.barColor }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[10px]" style={{ color: "var(--qc-text-muted)" }}>Low</span>
            <span className="font-mono text-[10px]" style={{ color: "var(--qc-text-muted)" }}>Medium</span>
            <span className="font-mono text-[10px]" style={{ color: "var(--qc-text-muted)" }}>High</span>
          </div>
        </div>

        {/* What Can Change */}
        {di.whatCanChange.length > 0 && (
          <>
            <div style={{ borderTop: "1px solid var(--qc-border-default)" }} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--qc-text-muted)" }}>What Can Change</p>
              <ul className="space-y-1.5">
                {di.whatCanChange.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[12px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--qc-text-muted)" }} />
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
  sc: ReturnType<typeof sentimentStyle>;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative rounded-[8px] border px-3 py-2.5"
      style={{ borderColor: sc.border, background: sc.bg }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>{indicator.name}</p>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info className="h-3 w-3 cursor-help" style={{ color: "var(--qc-text-muted)" }} />
          {showTooltip && (
            <div
              className="absolute bottom-full right-0 mb-1.5 z-50 w-48 rounded-[8px] border px-3 py-2 shadow-lg"
              style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
            >
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--qc-text-body)" }}>{indicator.explanation}</p>
            </div>
          )}
        </div>
      </div>
      <p className="text-[12px] font-semibold" style={{ color: sc.text }}>{indicator.tag}</p>
    </div>
  );
}
