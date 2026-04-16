import { Radio, Minus, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type NarrativeSentiment = "neutral" | "caution" | "positive" | "negative";

export interface NarrativeShift {
  id: string;
  category: string;
  sentiment: NarrativeSentiment;
  description: string;
}

const SENTIMENT_CONFIG: Record<NarrativeSentiment, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  iconBg: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}> = {
  neutral: {
    label: "NEUTRAL",
    badgeBg: "#F5F5F5",
    badgeText: "#888888",
    borderClass: "border-l-zinc-300",
    iconBg: "#F5F5F5",
    Icon: Minus,
  },
  caution: {
    label: "CAUTION",
    badgeBg: "#FFFBEB",
    badgeText: "#d97706",
    borderClass: "border-l-amber-400",
    iconBg: "#FFFBEB",
    Icon: AlertTriangle,
  },
  positive: {
    label: "POSITIVE",
    badgeBg: "#F0FDF4",
    badgeText: "#059669",
    borderClass: "border-l-emerald-500",
    iconBg: "#F0FDF4",
    Icon: TrendingUp,
  },
  negative: {
    label: "NEGATIVE",
    badgeBg: "#FEF3F2",
    badgeText: "#dc2626",
    borderClass: "border-l-red-500",
    iconBg: "#FEF3F2",
    Icon: TrendingDown,
  },
};

interface MarketNarrativeShiftsProps {
  shifts: NarrativeShift[];
  className?: string;
}

export function MarketNarrativeShifts({ shifts, className }: MarketNarrativeShiftsProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center gap-2">
        <Radio className="size-3.5 text-[#888888]" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
          Market Narrative Shifts
        </span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex-1 flex flex-col divide-y divide-[#E2E2E2] overflow-hidden">
        {shifts.map((shift) => {
          const config = SENTIMENT_CONFIG[shift.sentiment];
          const { Icon } = config;
          return (
            <div
              key={shift.id}
              className={cn(
                "flex items-start gap-3 pl-0 pr-4 py-3.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors group border-l-[3px]",
                config.borderClass
              )}
            >
              {/* Icon box */}
              <div className="pl-4 pt-0.5 flex-shrink-0">
                <div
                  className="p-1.5 rounded-[6px]"
                  style={{
                    background: config.iconBg,
                    border: `1px solid ${config.badgeText}33`,
                  }}
                >
                  <Icon className="size-3.5" style={{ color: config.badgeText }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Category + sentiment inline */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
                    style={{ background: "#F5F5F5", color: "#0F172B", border: "1px solid #E2E2E2" }}
                  >
                    {shift.category}
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider"
                    style={{ color: config.badgeText }}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "#888888" }}>{shift.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
