"use client";

import type { ValuationVsPeersSection, ValuationRichSegment } from "@/types/deal";
import { fmtDealNum } from "@/lib/utils";
import { valuationVsPeersData, type DescriptionSegment } from "@/components/deal/detailed-analysis-data";

interface PeReratingPotentialProps {
  data?: ValuationVsPeersSection;
}

type ScenarioKey = "emerald" | "blue" | "red";

const scenarioCardConfig: Record<
  ScenarioKey,
  { borderColor: string; badgeBorder: string; badgeText: string; valueColor: string; tagBg: string; tagText: string }
> = {
  emerald: {
    borderColor: "border-l-4 border-l-emerald-500 border border-[#E2E2E2]",
    badgeBorder: "border-emerald-400 text-emerald-700",
    badgeText: "text-emerald-700",
    valueColor: "text-emerald-600",
    tagBg: "bg-emerald-50 border-emerald-200",
    tagText: "text-emerald-700",
  },
  blue: {
    borderColor: "border-l-4 border-l-blue-500 border border-[#E2E2E2]",
    badgeBorder: "border-blue-400 text-blue-700",
    badgeText: "text-blue-700",
    valueColor: "text-blue-600",
    tagBg: "bg-blue-50 border-blue-200",
    tagText: "text-blue-700",
  },
  red: {
    borderColor: "border-l-4 border-l-red-500 border border-[#E2E2E2]",
    badgeBorder: "border-red-400 text-red-700",
    badgeText: "text-red-700",
    valueColor: "text-red-600",
    tagBg: "bg-red-50 border-red-200",
    tagText: "text-red-700",
  },
};

const segmentColor: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  red: "text-red-500",
};

function RichDescription({ segments }: { segments: (DescriptionSegment | ValuationRichSegment)[] }) {
  return (
    <p className="text-sm text-[#888888] leading-relaxed">
      {segments.map((seg, i) => {
        const colorClass = seg.color ? segmentColor[seg.color] : "";
        return (
          <span key={i} className={[seg.bold ? "font-semibold" : "", colorClass].join(" ").trim()}>
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}

export function PeReratingPotential({ data }: PeReratingPotentialProps) {
  const reRatingView = data?.re_rating_view ?? valuationVsPeersData.reRatingView;
  const expansionDrivers = data?.expansion_drivers ?? valuationVsPeersData.expansionDrivers;
  const contractionRisks = data?.contraction_risks ?? valuationVsPeersData.contractionRisks;
  const scenarioMultiples = data?.scenario_multiples ?? valuationVsPeersData.scenarioMultiples;

  return (
    <div className="space-y-6">
      {/* Scenario P/E Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioMultiples.map((item, i) => {
          const colorKey = item.color as ScenarioKey;
          const config = scenarioCardConfig[colorKey] ?? scenarioCardConfig.blue;

          return (
            <div
              key={i}
              className={`rounded-lg bg-white ${config.borderColor} p-5 space-y-3`}
            >
              {/* Badge */}
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badgeBorder}`}
              >
                {item.label}
              </span>

              {/* P/E Value */}
              <p className={`text-[36px] font-medium leading-tight ${config.valueColor}`}>
                {fmtDealNum(item.value)}
              </p>

              {/* Change tag */}
              <span
                className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${config.tagBg} ${config.tagText}`}
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
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#888888]">
            Re-rating view
          </p>
          <span className="text-[10px] font-bold text-[#888888] border border-[#E2E2E2] rounded px-1.5 py-0.5">
            {reRatingView.badge}
          </span>
        </div>
        <h4 className="text-base font-semibold text-[#0F172B]">{reRatingView.title}</h4>
        <RichDescription segments={reRatingView.description} />
      </div>

      {/* Expansion Drivers + Contraction Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expansion Drivers */}
        <div className="rounded-lg bg-[#F5F5F5] border border-[#E2E2E2] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h4 className="text-sm font-bold text-[#0F172B]">Expansion drivers</h4>
          </div>
          <div className="space-y-4">
            {expansionDrivers.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-[#121212]">{item.text}</p>
                <p className="text-xs text-[#888888] mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contraction Risks */}
        <div className="rounded-lg bg-[#F5F5F5] border border-[#E2E2E2] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h4 className="text-sm font-bold text-[#0F172B]">Contraction risks</h4>
          </div>
          <div className="space-y-4">
            {contractionRisks.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-[#121212]">{item.text}</p>
                <p className="text-xs text-[#888888] mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
