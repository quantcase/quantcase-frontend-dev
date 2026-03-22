import { cn } from "@/lib/utils";

export type NarrativeSentiment = "neutral" | "caution" | "positive" | "negative";

export interface NarrativeShift {
  id: string;
  category: string;
  sentiment: NarrativeSentiment;
  description: string;
}

const SENTIMENT_CONFIG: Record<NarrativeSentiment, { label: string; textClass: string }> = {
  neutral: {
    label: "NEUTRAL",
    textClass: "text-zinc-500",
  },
  caution: {
    label: "CAUTION",
    textClass: "text-amber-600",
  },
  positive: {
    label: "POSITIVE",
    textClass: "text-emerald-600",
  },
  negative: {
    label: "NEGATIVE",
    textClass: "text-red-600",
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
      <div className="px-2 pt-1 pb-3">
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
          Market Narrative Shifts
        </span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex-1 flex flex-col divide-y divide-[#E2E2E2]">
        {shifts.map((shift) => {
          const config = SENTIMENT_CONFIG[shift.sentiment];
          return (
            <div key={shift.id} className="px-4 py-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#888888",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    background: "#F5F5F5",
                    padding: "2px 6px",
                    borderRadius: 2,
                  }}
                >
                  {shift.category}
                </span>
                <span className={cn("text-[10px] font-semibold tracking-wider uppercase", config.textClass)}>
                  {config.label}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#888888", lineHeight: 1.6 }}>{shift.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
