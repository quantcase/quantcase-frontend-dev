"use client";

import type { IndustryInvestmentImplications } from "@/types/opportunity";

interface ImplicationColumnProps {
  title: string;
  subtitle?: string;
  items: { heading: string; bullets: string[] }[];
  sentiment: "positive" | "negative";
}

function ImplicationColumn({ title, subtitle, items, sentiment }: ImplicationColumnProps) {
  const accentColor = sentiment === "positive" ? "#22c55e" : "#ef4444";
  const labelColor = sentiment === "positive" ? "#059669" : "#dc2626";

  return (
    <div
      className="flex-1 min-w-0 rounded-lg border bg-white p-4 space-y-3"
      style={{ borderColor: accentColor, borderTopWidth: 3 }}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
          {title}
        </p>
        {subtitle && <p className="text-[11px] text-[#888888] mt-0.5">{subtitle}</p>}
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] text-[#888888] italic">No data available</p>
      ) : (
        <div className="overflow-y-auto space-y-3" style={{ maxHeight: 260 }}>
          {items.map((item, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[12px] font-semibold text-[#0F172B]">— {item.heading}</p>
              <ul className="space-y-0.5 pl-3">
                {item.bullets.map((bullet, j) => (
                  <li key={j} style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", lineHeight: 1.6 }}>
                    – {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface InvestmentImplicationsCardProps {
  data: IndustryInvestmentImplications;
}

export function InvestmentImplicationsCard({ data }: InvestmentImplicationsCardProps) {
  const positiveItems = (data.positive_signals ?? []).map((s) => ({
    heading: s.signal,
    bullets: s.evidence ? [s.evidence] : [],
  }));

  const negativeItems = (data.risks ?? []).map((r) => ({
    heading: r.risk,
    bullets: r.evidence ? [r.evidence] : [],
  }));

  if (positiveItems.length === 0 && negativeItems.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <p style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Investment Implications
        </p>
        <div className="flex-1 h-px bg-[#E2E2E2]" />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4">
        <ImplicationColumn
          title="Positive Signals (Bullish Case)"
          items={positiveItems}
          sentiment="positive"
        />
        <ImplicationColumn
          title="Risks to Monitor"
          items={negativeItems}
          sentiment="negative"
        />
      </div>
    </div>
  );
}
