"use client";

import type { ValuationVsPeersSection, ValuationRichSegment } from "@/types/deal";
import { fmtDealNum } from "@/lib/utils";
import { valuationVsPeersData, type DescriptionSegment } from "@/components/deal/detailed-analysis-data";

interface PeReratingPotentialProps {
  data?: ValuationVsPeersSection;
}

type ScenarioKey = "emerald" | "blue" | "red";

const scenarioCardAccent: Record<ScenarioKey, string> = {
  emerald: "var(--qc-up)",
  blue: "var(--qc-blue)",
  red: "var(--qc-down)",
};

const segmentCssColor: Record<string, string> = {
  emerald: "var(--qc-up)",
  blue: "var(--qc-blue)",
  red: "var(--qc-down)",
};

function RichDescription({ segments }: { segments: (DescriptionSegment | ValuationRichSegment)[] }) {
  return (
    <p className="text-sm leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>
      {segments.map((seg, i) => {
        const cssColor = seg.color ? segmentCssColor[seg.color] : undefined;
        return (
          <span key={i} style={{ fontWeight: seg.bold ? 600 : 400, color: cssColor ?? undefined }}>
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}

export function PeReratingPotential({ data }: PeReratingPotentialProps) {
  const reRatingView     = data?.re_rating_view      ?? valuationVsPeersData.reRatingView;
  const expansionDrivers = data?.expansion_drivers   ?? valuationVsPeersData.expansionDrivers;
  const contractionRisks = data?.contraction_risks   ?? valuationVsPeersData.contractionRisks;
  const scenarioMultiples = data?.scenario_multiples ?? valuationVsPeersData.scenarioMultiples;

  return (
    <div className="space-y-6">
      {/* Scenario P/E Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioMultiples.map((item, i) => {
          const accent = scenarioCardAccent[item.color as ScenarioKey] ?? "var(--qc-blue)";
          return (
            <div
              key={i}
              className="rounded-lg p-5 space-y-3"
              style={{ borderLeft: `4px solid ${accent}`, border: `1px solid var(--qc-border-default)`, borderLeftWidth: 4, borderLeftColor: accent, background: "var(--qc-surface-white)" }}
            >
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ border: `1px solid ${accent}60`, color: accent }}
              >
                {item.label}
              </span>

              <p className="text-[36px] font-medium leading-tight" style={{ color: accent }}>
                {fmtDealNum(item.value)}
              </p>

              <span
                className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: `${accent}12`, border: `1px solid ${accent}40`, color: accent }}
              >
                {fmtDealNum(item.change)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Re-rating view */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>
            Re-rating view
          </p>
          <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ color: "var(--qc-text-muted)", border: "1px solid var(--qc-border-default)" }}>
            {reRatingView.badge}
          </span>
        </div>
        <h4 className="text-base font-semibold" style={{ color: "var(--qc-text-heading)" }}>{reRatingView.title}</h4>
        <RichDescription segments={reRatingView.description} />
      </div>

      {/* Expansion Drivers + Contraction Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-5 space-y-4" style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--qc-up)" }} />
            <h4 className="text-sm font-bold" style={{ color: "var(--qc-text-heading)" }}>Expansion drivers</h4>
          </div>
          <div className="space-y-4">
            {expansionDrivers.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-semibold" style={{ color: "var(--qc-text-body)" }}>{item.text}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--qc-text-muted)" }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-5 space-y-4" style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--qc-down)" }} />
            <h4 className="text-sm font-bold" style={{ color: "var(--qc-text-heading)" }}>Contraction risks</h4>
          </div>
          <div className="space-y-4">
            {contractionRisks.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-semibold" style={{ color: "var(--qc-text-body)" }}>{item.text}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--qc-text-muted)" }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
