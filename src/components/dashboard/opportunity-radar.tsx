import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConvictionLevel = "positive" | "neutral" | "watch" | "review";

export interface OpportunityItem {
  id: string;
  company: string;
  ticker: string;
  conviction: ConvictionLevel;
  valuationZone: string;
  nextCatalyst: string;
}

const CONVICTION_CONFIG: Record<ConvictionLevel, { label: string; textClass: string }> = {
  positive: {
    label: "Positive",
    textClass: "text-emerald-600",
  },
  neutral: {
    label: "Neutral",
    textClass: "text-zinc-500",
  },
  watch: {
    label: "Watch",
    textClass: "text-zinc-500",
  },
  review: {
    label: "Review",
    textClass: "text-amber-600",
  },
};

interface OpportunityRadarProps {
  items: OpportunityItem[];
  className?: string;
}

export function OpportunityRadar({ items, className }: OpportunityRadarProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Opportunity Radar
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#888888" }}>Sorted by Conviction</span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)]">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1.5fr] gap-4 px-4 py-2.5 border-b border-[#E2E2E2]">
          {["Asset", "Conviction", "Valuation Zone", "Next Catalyst"].map((col) => (
            <span
              key={col}
              style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y divide-[#E2E2E2]">
          {items.map((item) => {
            const config = CONVICTION_CONFIG[item.conviction];
            return (
              <div key={item.id} className="grid grid-cols-[2fr_1fr_1.2fr_1.5fr] gap-4 px-4 py-3.5 items-center">
                <div>
                  <h5 style={{ color: "#0F172B", marginBottom: 2 }}>{item.company}</h5>
                  <span style={{ fontSize: 11, color: "#888888", letterSpacing: "0.04em" }}>{item.ticker}</span>
                </div>
                <span className={cn("text-sm font-semibold", config.textClass)}>{config.label}</span>
                <span style={{ fontSize: 14, color: "#0F172B" }}>{item.valuationZone}</span>
                <span style={{ fontSize: 14, color: "#888888" }}>{item.nextCatalyst}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
