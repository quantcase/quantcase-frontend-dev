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
  bg: string;
  text: string;
  borderStyle: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}> = {
  neutral: {
    label: "NEUTRAL",
    bg: "var(--qc-chip)",
    text: "var(--qc-ink-2)",
    borderStyle: "3px solid var(--qc-hair)",
    Icon: Minus,
  },
  caution: {
    label: "CAUTION",
    bg: "var(--qc-warn-soft)",
    text: "var(--qc-warn)",
    borderStyle: "3px solid var(--qc-warn)",
    Icon: AlertTriangle,
  },
  positive: {
    label: "POSITIVE",
    bg: "var(--qc-up-soft)",
    text: "var(--qc-up)",
    borderStyle: "3px solid var(--qc-up)",
    Icon: TrendingUp,
  },
  negative: {
    label: "NEGATIVE",
    bg: "var(--qc-down-soft)",
    text: "var(--qc-down)",
    borderStyle: "3px solid var(--qc-down)",
    Icon: TrendingDown,
  },
};

interface MarketNarrativeShiftsProps {
  shifts: NarrativeShift[];
  className?: string;
}

export function MarketNarrativeShifts({ shifts, className }: MarketNarrativeShiftsProps) {
  return (
    <div
      className={cn("rounded-[10px] p-2 h-full flex flex-col", className)}
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center gap-2">
        <Radio className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
          Market Narrative Shifts
        </span>
      </div>

      {/* Inner white box */}
      <div
        className="rounded-[10px] flex-1 flex flex-col divide-y overflow-hidden"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}
      >
        {shifts.map((shift) => {
          const config = SENTIMENT_CONFIG[shift.sentiment];
          const { Icon } = config;
          return (
            <div
              key={shift.id}
              className="flex items-start gap-3 pl-0 pr-4 py-3.5 cursor-pointer transition-colors group hover:bg-[var(--qc-section)]"
              style={{ borderLeft: config.borderStyle, borderTopColor: "var(--qc-hair-2)" }}
            >
              {/* Icon box */}
              <div className="pl-4 pt-0.5 flex-shrink-0">
                <div
                  className="p-1.5 rounded-[6px]"
                  style={{
                    background: config.bg,
                    border: `1px solid ${config.text}33`,
                  }}
                >
                  <Icon className="size-3.5" style={{ color: config.text }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Category + sentiment inline */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
                    style={{ background: "var(--qc-chip)", color: "var(--qc-ink)", border: "1px solid var(--qc-hair)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                  >
                    {shift.category}
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider"
                    style={{ color: config.text, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-ink)" }}>{shift.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
