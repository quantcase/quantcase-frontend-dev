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
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  dotColor: string;
}> = {
  moderate: {
    borderClass: "border-l-amber-400",
    badgeBg: "#FFFBEB",
    badgeText: "#d97706",
    badgeLabel: "Moderate",
    dotColor: "#f59e0b",
  },
  low_risk: {
    borderClass: "border-l-emerald-500",
    badgeBg: "#F0FDF4",
    badgeText: "#059669",
    badgeLabel: "Low Risk",
    dotColor: "#10b981",
  },
  high_risk: {
    borderClass: "border-l-red-500",
    badgeBg: "#FEF3F2",
    badgeText: "#dc2626",
    badgeLabel: "High Risk",
    dotColor: "#ef4444",
  },
  neutral: {
    borderClass: "border-l-zinc-300",
    badgeBg: "#F5F5F5",
    badgeText: "#90A1B9",
    badgeLabel: "Neutral",
    dotColor: "#90A1B9",
  },
};

interface AIInsightsProps {
  items: AIInsightItem[];
  className?: string;
}

export function AIInsights({ items, className }: AIInsightsProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col h-full", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            AI Insights from Recent Interactions
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
          style={{ color: "#888888" }}
        >
          See All <ArrowRight className="size-3 ml-0.5" />
        </button>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex flex-col divide-y divide-[#E2E2E2] overflow-hidden flex-1">
        {items.map((item) => {
          const config = RISK_CONFIG[item.risk];
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 pl-0 pr-4 py-2.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors group border-l-[3px]",
                config.borderClass
              )}
            >
              {/* Avatar */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: config.badgeBg, color: config.badgeText, border: `1px solid ${config.badgeText}33` }}
                >
                  {item.client.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Content — 2-line layout */}
              <div className="flex-1 min-w-0">
                {/* Line 1: client name + badges */}
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold" style={{ color: "#0F172B" }}>{item.client}</p>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: "#F5F5F5", color: "#90A1B9", border: "1px solid #E2E2E2" }}
                  >
                    {item.category}
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: config.badgeBg, color: config.badgeText, border: `1px solid ${config.badgeText}33` }}
                  >
                    {config.badgeLabel}
                  </span>
                </div>
                {/* Line 2: note */}
                <p className="text-[11px] leading-snug truncate" style={{ color: "#888888" }}>{item.note}</p>
              </div>

              {/* Right side: time + CTA + chevron */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-[10px] tabular-nums" style={{ color: "rgba(18,18,18,0.40)" }}>{item.timeAgo}</span>
                {item.actionLabel && (
                  <button
                    className="flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-0.5 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
                    style={{ color: "#0F172B" }}
                  >
                    {item.actionLabel} <ArrowRight className="size-3" />
                  </button>
                )}
                <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "#0F172B" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
