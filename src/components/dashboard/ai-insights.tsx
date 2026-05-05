import { Brain, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightRisk = "moderate" | "low_risk" | "high_risk" | "neutral";

export interface AIInsightItem {
  id: string;
  client: string;
  category: string;
  note: string;
  risk: InsightRisk;
  timeAgo: string;
  actionLabel?: string;
}

const RISK_CONFIG: Record<InsightRisk, {
  borderClass: string;
  bg: string;
  text: string;
  badgeLabel: string;
}> = {
  moderate: {
    borderClass: "border-l-[var(--qc-warn)]",
    bg: "var(--qc-warn-soft)",
    text: "var(--qc-warn)",
    badgeLabel: "Moderate",
  },
  low_risk: {
    borderClass: "border-l-[var(--qc-up)]",
    bg: "var(--qc-up-soft)",
    text: "var(--qc-up)",
    badgeLabel: "Low Risk",
  },
  high_risk: {
    borderClass: "border-l-[var(--qc-down)]",
    bg: "var(--qc-down-soft)",
    text: "var(--qc-down)",
    badgeLabel: "High Risk",
  },
  neutral: {
    borderClass: "border-l-[var(--qc-ink-2)]",
    bg: "var(--qc-chip)",
    text: "var(--qc-ink-2)",
    badgeLabel: "Neutral",
  },
};

interface AIInsightsProps {
  items: AIInsightItem[];
  className?: string;
}

export function AIInsights({ items, className }: AIInsightsProps) {
  return (
    <div
      className={cn("rounded-[10px] p-2 flex flex-col h-full", className)}
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            AI Insights from Recent Interactions
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 transition-colors"
          style={{ color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}
        >
          See All <ArrowRight className="size-3 ml-0.5" />
        </button>
      </div>

      {/* Inner white box */}
      <div
        className="rounded-[10px] flex flex-col divide-y overflow-hidden flex-1"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)", borderColor: "var(--qc-hair-2)" }}
      >
        {items.map((item) => {
          const config = RISK_CONFIG[item.risk];
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 pl-0 pr-4 py-2.5 cursor-pointer transition-colors group border-l-[3px]",
                config.borderClass
              )}
              style={{ borderTopColor: "var(--qc-hair-2)" }}
            >
              {/* Avatar */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: config.bg, color: config.text, border: `1px solid ${config.text}33` }}
                >
                  {item.client.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Content — 2-line layout */}
              <div className="flex-1 min-w-0">
                {/* Line 1: client name + badges */}
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold" style={{ color: "var(--qc-ink)" }}>{item.client}</p>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: "var(--qc-chip)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)" }}
                  >
                    {item.category}
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: config.bg, color: config.text, border: `1px solid ${config.text}33` }}
                  >
                    {config.badgeLabel}
                  </span>
                </div>
                {/* Line 2: note */}
                <p className="text-[11px] leading-snug truncate" style={{ color: "var(--qc-ink)" }}>{item.note}</p>
              </div>

              {/* Right side: time + CTA + chevron */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-[10px] tabular-nums" style={{ color: "var(--qc-ink-3)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{item.timeAgo}</span>
                {item.actionLabel && (
                  <button
                    className="flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-0.5 transition-colors"
                    style={{ color: "var(--qc-ink)", border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}
                  >
                    {item.actionLabel} <ArrowRight className="size-3" />
                  </button>
                )}
                <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--qc-ink)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
