import { Search, ChevronRight } from "lucide-react";
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

const CONVICTION_CONFIG: Record<ConvictionLevel, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}> = {
  positive: {
    label: "Positive",
    badgeBg: "#F0FDF4",
    badgeText: "#059669",
    borderClass: "border-l-emerald-500",
  },
  neutral: {
    label: "Neutral",
    badgeBg: "#F5F5F5",
    badgeText: "#888888",
    borderClass: "border-l-zinc-300",
  },
  watch: {
    label: "Watch",
    badgeBg: "#F5F5F5",
    badgeText: "#888888",
    borderClass: "border-l-zinc-300",
  },
  review: {
    label: "Review",
    badgeBg: "#FFFBEB",
    badgeText: "#d97706",
    borderClass: "border-l-amber-400",
  },
};

const VALUATION_CONFIG: Record<string, { bg: string; text: string }> = {
  "Attractive":   { bg: "#F0FDF4", text: "#059669" },
  "Fair":         { bg: "#F5F5F5", text: "#888888" },
  "High":         { bg: "#FFFBEB", text: "#d97706" },
  "Speculative":  { bg: "#FEF3F2", text: "#dc2626" },
};

interface OpportunityRadarProps {
  items: OpportunityItem[];
  className?: string;
}

export function OpportunityRadar({ items, className }: OpportunityRadarProps) {
  const positiveCount = items.filter((i) => i.conviction === "positive").length;

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
        <div className="flex items-center gap-1.5">
          {positiveCount > 0 && (
            <span className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5" style={{ background: "#F0FDF4", color: "#059669", border: "1px solid #bbf7d0" }}>
              {positiveCount} High conviction
            </span>
          )}
          <span
            className="text-[10px] font-medium rounded-sm px-2 py-0.5"
            style={{ background: "#F5F5F5", color: "#888888", border: "1px solid #E2E2E2" }}
          >
            {items.length} tracked
          </span>
        </div>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] overflow-hidden">
        {/* Table header */}
        <div
          className="grid gap-4 px-4 py-2.5 border-b border-[#E2E2E2]"
          style={{ gridTemplateColumns: "2.2fr 1fr 1.1fr 1.5fr 1rem", background: "#F5F5F5" }}
        >
          {["Asset", "Conviction", "Valuation Zone", "Next Catalyst"].map((col) => (
            <span
              key={col}
              style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {col}
            </span>
          ))}
          <span />
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y divide-[#E2E2E2]">
          {items.map((item) => {
            const convConfig = CONVICTION_CONFIG[item.conviction];
            const valConfig = VALUATION_CONFIG[item.valuationZone] ?? { bg: "#F5F5F5", text: "#888888" };
            return (
              <div
                key={item.id}
                className={cn(
                  "grid gap-4 pl-0 pr-4 py-3 items-center cursor-pointer hover:bg-[#F5F5F5] transition-colors group border-l-[3px]",
                  convConfig.borderClass
                )}
                style={{ gridTemplateColumns: "2.2fr 1fr 1.1fr 1.5fr 1rem" }}
              >
                {/* Asset — ticker badge + company name */}
                <div className="pl-4 flex items-center gap-2.5 min-w-0">
                  <span
                    className="font-mono text-[10px] font-semibold rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: "#F5F5F5", color: "#0F172B", border: "1px solid #E2E2E2", letterSpacing: "0.04em" }}
                  >
                    {item.ticker}
                  </span>
                  <p className="text-[13px] font-semibold truncate" style={{ color: "#0F172B" }}>{item.company}</p>
                </div>

                {/* Conviction badge */}
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 w-fit"
                  style={{ background: convConfig.badgeBg, color: convConfig.badgeText, border: `1px solid ${convConfig.badgeText}33` }}
                >
                  {convConfig.label}
                </span>

                {/* Valuation zone badge */}
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 w-fit"
                  style={{ background: valConfig.bg, color: valConfig.text, border: `1px solid ${valConfig.text}33` }}
                >
                  {item.valuationZone}
                </span>

                {/* Catalyst */}
                <span className="text-[12px]" style={{ color: "#888888" }}>{item.nextCatalyst}</span>

                {/* Chevron */}
                <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "#0F172B" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
