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
  bg: string;
  text: string;
  borderStyle: string;
}> = {
  positive: {
    label: "Positive",
    bg: "var(--qc-up-soft)",
    text: "var(--qc-up)",
    borderStyle: "3px solid var(--qc-up)",
  },
  neutral: {
    label: "Neutral",
    bg: "var(--qc-chip-bg)",
    text: "var(--qc-text-muted)",
    borderStyle: "3px solid var(--qc-border-default)",
  },
  watch: {
    label: "Watch",
    bg: "var(--qc-chip-bg)",
    text: "var(--qc-text-muted)",
    borderStyle: "3px solid var(--qc-border-default)",
  },
  review: {
    label: "Review",
    bg: "var(--qc-warn-soft)",
    text: "var(--qc-warn)",
    borderStyle: "3px solid var(--qc-warn)",
  },
};

const VALUATION_CONFIG: Record<string, { bg: string; text: string }> = {
  "Attractive":  { bg: "var(--qc-up-soft)",   text: "var(--qc-up)" },
  "Fair":        { bg: "var(--qc-chip-bg)",    text: "var(--qc-text-muted)" },
  "High":        { bg: "var(--qc-warn-soft)",  text: "var(--qc-warn)" },
  "Speculative": { bg: "var(--qc-down-soft)",  text: "var(--qc-down)" },
};

interface OpportunityRadarProps {
  items: OpportunityItem[];
  className?: string;
}

export function OpportunityRadar({ items, className }: OpportunityRadarProps) {
  const positiveCount = items.filter((i) => i.conviction === "positive").length;

  return (
    <div
      className={cn("rounded-[10px] p-2", className)}
      style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            Opportunity Radar
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {positiveCount > 0 && (
            <span
              className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5"
              style={{ background: "var(--qc-up-soft)", color: "var(--qc-up)", border: "1px solid var(--qc-up)" }}
            >
              {positiveCount} High conviction
            </span>
          )}
          <span
            className="text-[10px] font-medium rounded-sm px-2 py-0.5"
            style={{ background: "var(--qc-chip-bg)", color: "var(--qc-chip-fg)", border: "1px solid var(--qc-chip-border)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
          >
            {items.length} tracked
          </span>
        </div>
      </div>

      {/* Inner white box */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: "var(--qc-surface-card)", border: "1px solid var(--qc-border-default)" }}
      >
        {/* Table header */}
        <div
          className="grid gap-4 px-4 py-2.5"
          style={{ gridTemplateColumns: "2.2fr 1fr 1.1fr 1.5fr 1rem", borderBottom: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
        >
          {["Asset", "Conviction", "Valuation Zone", "Next Catalyst"].map((col) => (
            <span
              key={col}
              style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
            >
              {col}
            </span>
          ))}
          <span />
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--qc-border-inner)" }}>
          {items.map((item) => {
            const convConfig = CONVICTION_CONFIG[item.conviction];
            const valConfig = VALUATION_CONFIG[item.valuationZone] ?? { bg: "var(--qc-chip-bg)", text: "var(--qc-text-muted)" };
            return (
              <div
                key={item.id}
                className="grid gap-4 pl-0 pr-4 py-3 items-center cursor-pointer transition-colors group hover:bg-[var(--qc-surface-hover)]"
                style={{ gridTemplateColumns: "2.2fr 1fr 1.1fr 1.5fr 1rem", borderLeft: convConfig.borderStyle, borderTopColor: "var(--qc-border-inner)" }}
              >
                {/* Asset — ticker badge + company name */}
                <div className="pl-4 flex items-center gap-2.5 min-w-0">
                  <span
                    className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: "var(--qc-chip-bg)", color: "var(--qc-text-heading)", border: "1px solid var(--qc-chip-border)", letterSpacing: "0.04em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                  >
                    {item.ticker}
                  </span>
                  <p className="text-[13px] font-semibold truncate" style={{ color: "var(--qc-text-heading)" }}>{item.company}</p>
                </div>

                {/* Conviction badge */}
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 w-fit"
                  style={{ background: convConfig.bg, color: convConfig.text, border: `1px solid ${convConfig.text}33`, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                >
                  {convConfig.label}
                </span>

                {/* Valuation zone badge */}
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 w-fit"
                  style={{ background: valConfig.bg, color: valConfig.text, border: `1px solid ${valConfig.text}33`, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                >
                  {item.valuationZone}
                </span>

                {/* Catalyst */}
                <span className="text-[12px]" style={{ color: "var(--qc-text-body)" }}>{item.nextCatalyst}</span>

                {/* Chevron */}
                <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--qc-text-heading)" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
