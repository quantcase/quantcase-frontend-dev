"use client";

import { AlertTriangle, Zap } from "lucide-react";
import type { FundamentalsIntelligence } from "@/types/financials";
import { SignalCard } from "@/components/overview/signal-card";
import {
  DecisionIntelligenceShell,
  DecisionSection,
  DecisionEyebrow,
  DecisionDivider,
} from "@/components/ds";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_RISK_ALERTS = 4;

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
  className?: string;
}

export function FundamentalsIntelligenceBanner({ fi, className }: Props) {
  const riskAlerts = fi.riskAlerts.slice(0, MAX_RISK_ALERTS);

  return (
    <DecisionIntelligenceShell
      className={className}
      headerAction={
        <span className="flex-shrink-0 rounded-full bg-[var(--qc-ink)] px-2.5 py-1 text-[13px] font-bold tracking-[0.02em] text-white">
          {fi.fundamentalGrade}
        </span>
      }
    >
      {/* ── Signal Breakdown + Risk Alerts (one card) ── */}
      <DecisionSection className="flex-1 justify-around">
        <div className="flex flex-col gap-2.5">
          <DecisionEyebrow icon={<Zap className="size-[11px] text-ink-2" />}>
            Signal Breakdown
          </DecisionEyebrow>
          <div className="grid grid-cols-3 gap-2">
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
        </div>

        {riskAlerts.length > 0 && (
          <>
            <DecisionDivider />
            <div className="flex flex-col gap-2">
              <DecisionEyebrow icon={<AlertTriangle className="size-[11px] text-ink-2" />}>
                Risk Alerts
              </DecisionEyebrow>
              <div className="flex flex-wrap gap-1.5">
                {riskAlerts.map((alert, i) => (
                  <span
                    key={i}
                    className="rounded-sm border border-down/20 bg-down-soft px-2 py-[3px] text-[11px] font-medium text-down"
                  >
                    {alert}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </DecisionSection>
    </DecisionIntelligenceShell>
  );
}
