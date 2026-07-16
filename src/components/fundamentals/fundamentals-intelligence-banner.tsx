"use client";

import { AlertTriangle, Zap } from "lucide-react";
import type { FundamentalsIntelligence } from "@/types/financials";
import { SignalCard } from "@/components/overview/signal-card";
import { cn } from "@/lib/utils";
import {
  DecisionIntelligenceShell,
  DecisionSection,
  DecisionEyebrow,
  DecisionDivider,
} from "@/components/ds";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function convictionConfig(level: string) {
  const l = level.toLowerCase();
  if (l === "high") return { color: "var(--qc-up)", barColor: "var(--qc-up)", width: "100%" };
  if (l === "medium") return { color: "var(--qc-warn)", barColor: "var(--qc-warn)", width: "66%" };
  return { color: "var(--qc-down)", barColor: "var(--qc-down)", width: "33%" };
}

const SIGNAL_METRIC_HINTS: Record<string, string[]> = {
  growth: ["Revenue Growth", "Profit Growth"],
  valuation: ["P/E", "P/B"],
  balanceSheet: ["Debt-to-Equity"],
  profitability: ["Operating Margin", "ROE"],
  cashConversion: ["Cash from Operations"],
};

const SIGNAL_LABELS: Record<string, string> = {
  growth: "Growth",
  valuation: "Valuation",
  balanceSheet: "Balance Sheet",
  profitability: "Profitability",
  cashConversion: "Cash Conversion",
};

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  fi: FundamentalsIntelligence;
}

export function FundamentalsIntelligenceBanner({ fi }: Props) {
  const conviction = convictionConfig(fi.convictionLevel);

  return (
    <DecisionIntelligenceShell
      headerAction={
        <span className="flex-shrink-0 rounded-full bg-[var(--qc-ink)] px-2.5 py-1 text-[13px] font-bold tracking-[0.02em] text-white">
          {fi.fundamentalGrade}
        </span>
      }
    >
      {/* ── 1. Tag + Actionable Insight ── */}
      <DecisionSection accent>
        <div>
          <DecisionEyebrow className="mb-1.5">Tag</DecisionEyebrow>
          <p className="m-0 text-[15px] font-semibold leading-[1.3] text-ink">{fi.tag}</p>
        </div>

        <DecisionDivider />

        {/* Actionable Insight */}
        <div className="flex flex-col gap-1.5">
          <DecisionEyebrow>Actionable Insight</DecisionEyebrow>
          <p className="m-0 text-[14px] font-medium leading-[1.45] tracking-[-0.005em] text-ink">
            {fi.actionableInsight.action}
          </p>
          {fi.actionableInsight.rationale && (
            <p className="m-0 text-[12px] leading-[1.55] text-ink">
              {fi.actionableInsight.rationale}
            </p>
          )}
        </div>

        {/* Bias */}
        {fi.actionBias && (
          <>
            <DecisionDivider />
            <div className="flex flex-col gap-1.5">
              <DecisionEyebrow>Bias</DecisionEyebrow>
              <p className="m-0 text-[12px] leading-[1.55] text-ink">{fi.actionBias}</p>
              {fi.actionableInsight.existingHolderAction && (
                <p className="m-0 text-[12px] leading-[1.55] text-ink">
                  {fi.actionableInsight.existingHolderAction}
                </p>
              )}
              {fi.actionableInsight.reEvaluateCondition && (
                <p className="m-0 text-[11px] leading-[1.5] text-ink-2">
                  Re-evaluate: {fi.actionableInsight.reEvaluateCondition}
                </p>
              )}
            </div>
          </>
        )}
      </DecisionSection>

      {/* ── 2. Signal Breakdown ── */}
      <DecisionSection>
        <DecisionEyebrow icon={<Zap className="size-[11px] text-ink-2" />}>
          Signal Breakdown
        </DecisionEyebrow>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(fi.signals).map(([key, value]) => {
            const hints = SIGNAL_METRIC_HINTS[key] ?? [];
            const allMetrics = fi.keyMetricsSummary ?? [];
            const relatedMetrics = allMetrics.filter((m) =>
              hints.some((h) => m.name.toLowerCase().includes(h.toLowerCase()))
            );
            return (
              <SignalCard
                key={key}
                label={SIGNAL_LABELS[key] ?? key}
                value={value}
                metrics={relatedMetrics}
              />
            );
          })}
        </div>

        {/* Conviction Meter */}
        <div className="flex flex-col gap-1.5 border-t border-hair pt-2.5">
          <div className="flex items-center justify-between">
            <DecisionEyebrow>Conviction</DecisionEyebrow>
            <span className="text-[11px] font-semibold" style={{ color: conviction.color }}>
              {fi.convictionLevel}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full transition-[width] duration-[400ms]"
              style={{ width: conviction.width, background: conviction.barColor }}
            />
          </div>
          <div className="flex justify-between">
            {["Low", "Medium", "High"].map((l) => (
              <span key={l} className="font-mono text-[9px] text-ink-2">
                {l}
              </span>
            ))}
          </div>
        </div>
      </DecisionSection>

      {/* ── 3. Risk Alerts + What Can Change ── */}
      {(fi.riskAlerts.length > 0 || fi.whatCanChange.length > 0) && (
        <DecisionSection>
          {fi.riskAlerts.length > 0 && (
            <div className="flex flex-col gap-2">
              <DecisionEyebrow icon={<AlertTriangle className="size-[11px] text-ink-2" />}>
                Risk Alerts
              </DecisionEyebrow>
              <div className="flex flex-wrap gap-1.5">
                {fi.riskAlerts.map((alert, i) => (
                  <span
                    key={i}
                    className="rounded-sm border border-down/20 bg-down-soft px-2 py-[3px] text-[11px] font-medium text-down"
                  >
                    {alert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fi.whatCanChange.length > 0 && (
            <>
              {fi.riskAlerts.length > 0 && <DecisionDivider />}
              <div className="flex flex-col gap-2">
                <DecisionEyebrow>What Can Change</DecisionEyebrow>
                <div className="flex flex-col">
                  {fi.whatCanChange.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 py-[5px]",
                        i < fi.whatCanChange.length - 1 && "border-b border-hair"
                      )}
                    >
                      <span className="mt-[5px] size-[5px] flex-shrink-0 rounded-full bg-[var(--qc-ink-2)]" />
                      <p className="m-0 text-[12px] leading-[1.55] text-ink">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DecisionSection>
      )}
    </DecisionIntelligenceShell>
  );
}
