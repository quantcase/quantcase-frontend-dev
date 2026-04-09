"use client";

import { useState, useCallback } from "react";
import { TabularCard } from "@/components/molecules/tabular-card";
import type { FactorScore } from "@/types/management";
import type { FinalTakeaways, OFactorResponse } from "@/types/opportunity";
import type { OverviewSection } from "@/types/deal";

interface TitledBullet {
  title: string;
  text: string;
}

interface IMScoreCardProps {
  managementScore?: number | null;
  managementMax?: number | null;
  opportunityScore?: number | null;
  opportunityMax?: number | null;
  dealScore?: number | null;
  dealMax?: number | null;
  // Structured insight items
  managementFactors?: FactorScore[];
  opportunityTakeaways?: FinalTakeaways | null;
  opportunityData?: OFactorResponse | null;
  dealOverview?: OverviewSection | null;
}

function getRating(scorePct: number): string {
  if (scorePct >= 0.80) return "Strong Buy";
  if (scorePct >= 0.65) return "Buy";
  if (scorePct >= 0.50) return "Hold";
  if (scorePct >= 0.35) return "Underperform";
  return "Sell";
}

function getOverallInsight(
  scorePct: number,
  oppTakeaways?: FinalTakeaways | null,
  dealOverview?: OverviewSection | null,
): string {
  const highlights = oppTakeaways?.key_highlights ?? [];
  const dealVerdict = dealOverview?.deal_verdict?.title ?? null;
  const rating = getRating(scorePct);

  if (highlights.length > 0 && dealVerdict) {
    return `${highlights[0]} · ${dealVerdict}`;
  }
  if (highlights.length > 0) return highlights.slice(0, 2).join(" · ");
  if (dealVerdict) return dealVerdict;

  // Fallback based on score band
  if (scorePct >= 0.80) return "Strong fundamentals · High confidence in management · Attractive entry point";
  if (scorePct >= 0.65) return "Solid business with positive outlook · Reasonable valuation";
  if (scorePct >= 0.50) return "Steady business · Watchful on valuation and growth catalysts";
  if (scorePct >= 0.35) return "Mixed signals · Below-average conviction on risk-reward";
  return rating + " · Limited upside or elevated risk";
}

// Clamp weights so they always sum to 100%
function clampWeights(m: number, o: number, d: number): [number, number, number] {
  const total = m + o + d;
  if (total === 0) return [33, 34, 33];
  return [
    Math.round((m / total) * 100),
    Math.round((o / total) * 100),
    100 - Math.round((m / total) * 100) - Math.round((o / total) * 100),
  ];
}

interface BentoCardProps {
  label: string;
  letter: string;
  score: number | null;
  max: number;
  weightPct: number;
  items: TitledBullet[];
  flex: number; // css flex grow value
}

function BentoCard({ label, letter, score, max, weightPct, items, flex }: BentoCardProps) {
  const pct = max > 0 && score !== null ? Math.min(score / max, 1) : 0;
  const ticks = max;

  return (
    <div
      className="rounded-[10px] border border-[#E2E2E2] bg-white p-5 flex flex-col gap-3 min-w-0 h-full overflow-y-auto"
      style={{ flex }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            {label} ({letter})
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">{weightPct}% weight</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[#0F172B] leading-none">
            {score !== null ? score : "—"}
          </span>
          <span className="text-sm font-normal text-zinc-400 ml-0.5">/{max}</span>
        </div>
      </div>

      {/* Tick bar */}
      <div className="flex gap-[2px] flex-wrap">
        {Array.from({ length: Math.min(ticks, 40) }).map((_, i) => {
          const filledCount = Math.round(pct * Math.min(ticks, 40));
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: 12,
                borderRadius: 1,
                backgroundColor: i < filledCount ? "#0F172B" : "#d1d5db",
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      {/* Titled bullet items */}
      {items.length > 0 ? (
        <ul className="space-y-2.5 flex-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#0F172B] leading-snug">{item.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-400 flex-1">No analysis available.</p>
      )}
    </div>
  );
}

export function IMScoreCard({
  managementScore,
  managementMax,
  opportunityScore,
  opportunityMax,
  dealScore,
  dealMax,
  managementFactors,
  opportunityTakeaways,
  opportunityData,
  dealOverview,
}: IMScoreCardProps) {
  const mScore = managementScore ?? null;
  const oScore = opportunityScore ?? null;
  const dScore = dealScore ?? null;

  const mMax = managementMax ?? 20;
  const oMax = opportunityMax ?? 40;
  const dMax = dealMax ?? 40;

  const [mWeight, setMWeight] = useState(40);
  const [oWeight, setOWeight] = useState(40);
  const [dWeight, setDWeight] = useState(20);

  const handleMWeight = useCallback((val: number) => {
    const newM = Math.max(5, Math.min(90, val));
    const remaining = 100 - newM;
    const ratio = oWeight / (oWeight + dWeight || 1);
    const newO = Math.max(5, Math.round(remaining * ratio));
    const newD = Math.max(5, remaining - newO);
    setMWeight(newM);
    setOWeight(newO);
    setDWeight(newD);
  }, [oWeight, dWeight]);

  const handleOWeight = useCallback((val: number) => {
    const newO = Math.max(5, Math.min(90, val));
    const remaining = 100 - newO;
    const ratio = mWeight / (mWeight + dWeight || 1);
    const newM = Math.max(5, Math.round(remaining * ratio));
    const newD = Math.max(5, remaining - newM);
    setOWeight(newO);
    setMWeight(newM);
    setDWeight(newD);
  }, [mWeight, dWeight]);

  const handleDWeight = useCallback((val: number) => {
    const newD = Math.max(5, Math.min(90, val));
    const remaining = 100 - newD;
    const ratio = mWeight / (mWeight + oWeight || 1);
    const newM = Math.max(5, Math.round(remaining * ratio));
    const newO = Math.max(5, remaining - newM);
    setDWeight(newD);
    setMWeight(newM);
    setOWeight(newO);
  }, [mWeight, oWeight]);

  const [cMW, cOW, cDW] = clampWeights(mWeight, oWeight, dWeight);
  const weightSum = cMW + cOW + cDW;
  const weightValid = weightSum === 100;

  // Weighted score
  let partialNumer = 0;
  let partialDenom = 0;
  if (mScore !== null) { partialNumer += (mScore / mMax) * cMW; partialDenom += cMW; }
  if (oScore !== null) { partialNumer += (oScore / oMax) * cOW; partialDenom += cOW; }
  if (dScore !== null) { partialNumer += (dScore / dMax) * cDW; partialDenom += cDW; }

  const hasAnyScore = partialDenom > 0;
  const weightedPct = hasAnyScore ? partialNumer / partialDenom : 0;
  const displayScore = hasAnyScore ? Math.round(weightedPct * 100) : null;
  const rating = hasAnyScore ? getRating(weightedPct) : null;
  const overallInsight = hasAnyScore ? getOverallInsight(weightedPct, opportunityTakeaways, dealOverview) : null;

  // Titled items per card
  const mItems: TitledBullet[] = managementFactors
    ? managementFactors.slice(0, 4).map((f) => ({
        title: f.factor,
        text: f.descriptor ?? "",
      }))
    : [];

  const oItems: TitledBullet[] = (() => {
    // Try final_takeaways.section_scores first
    const scores = opportunityTakeaways?.section_scores;
    if (scores) {
      const entries: { key: string; label: string }[] = [
        { key: "industry", label: "Industry" },
        { key: "competition", label: "Competition" },
        { key: "financial_strength", label: "Financial Strength" },
        { key: "customer_traction", label: "Customer Traction" },
      ];
      const items = entries
        .filter((e) => scores[e.key as keyof typeof scores]?.takeaway)
        .map((e) => ({
          title: e.label,
          text: scores[e.key as keyof typeof scores].takeaway,
        }));
      if (items.length > 0) return items;
    }
    // Fallback: read takeaway from each section's .text.takeaway
    if (!opportunityData) return [];
    const sectionMap: { key: keyof OFactorResponse; label: string }[] = [
      { key: "industry_overview", label: "Industry" },
      { key: "competition", label: "Competition" },
      { key: "financial_strength", label: "Financial Strength" },
      { key: "customer_traction", label: "Customer Traction" },
    ];
    return sectionMap
      .filter((e) => {
        const sec = opportunityData[e.key];
        return sec && typeof sec === "object" && "text" in sec && sec.text?.takeaway;
      })
      .map((e) => ({
        title: e.label,
        text: (opportunityData[e.key] as { text?: { takeaway?: string } })!.text!.takeaway!,
      }));
  })();

  const dItems: TitledBullet[] = (() => {
    const items: TitledBullet[] = [];
    const eps = dealOverview?.eps_engine_card;
    if (eps?.drivers?.length) {
      items.push({ title: "EPS Engine", text: eps.drivers?.slice(0, 2)?.join("; ") });
    }
    const val = dealOverview?.valuation_rerating_card;
    if (val?.drivers?.length) {
      items.push({ title: "Valuation Re-Rating", text: val.drivers?.slice(0, 2)?.join("; ") });
    }
    if (items.length === 0 && dealOverview?.key_takeaway?.length) {
      dealOverview.key_takeaway.slice(0, 4).forEach((t) => {
        items.push({ title: "Key Takeaway", text: t });
      });
    }
    return items;
  })();


  return (
    <TabularCard title="QC Insight">
      {/* Top: two-column layout — Col 1: radial chart, Col 2: rating + title + sliders */}
      <div className="flex gap-6 mb-4 pb-4 border-b border-[#E2E2E2]">

        {/* Col 1: Radial score chart */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg width={96} height={96} viewBox="0 0 96 96">
              <circle cx={48} cy={48} r={40} fill="none" stroke="#E5E7EB" strokeWidth={7} />
              <circle
                cx={48} cy={48} r={40}
                fill="none"
                stroke="#0F172B"
                strokeWidth={7}
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (displayScore ?? 0) / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-[#0F172B] leading-none">
                {displayScore !== null ? displayScore : "—"}
              </span>
              <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">/100</span>
            </div>
          </div>
        </div>

        {/* Col 2: Rating badge + headline + sliders stacked */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 justify-center">
          {/* Rating + headline */}
          <div className="flex flex-col gap-1">
            {rating && (
              <span className="self-start rounded-full bg-zinc-900 px-3 py-0.5 text-xs font-semibold text-white uppercase tracking-wide">
                {rating}
              </span>
            )}
            {overallInsight && (
              <p className="text-sm font-semibold text-[#0F172B] leading-snug">{overallInsight}</p>
            )}
          </div>

          {/* Sliders */}
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              Adjust Weightings — must total 100%
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              {[
                { label: "Management", value: cMW, onChange: handleMWeight },
                { label: "Opportunity", value: cOW, onChange: handleOWeight },
                { label: "Deal", value: cDW, onChange: handleDWeight },
              ].map(({ label, value, onChange }) => (
                <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[11px] text-zinc-500 w-20 flex-shrink-0">{label}</span>
                  <input
                    type="range"
                    min={5}
                    max={90}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 min-w-0 accent-zinc-900 h-1"
                  />
                  <span className="text-[11px] font-semibold text-[#0F172B] w-8 text-right flex-shrink-0">
                    {value}%
                  </span>
                </div>
              ))}
            </div>
            {!weightValid && (
              <p className="text-[10px] text-red-500 mt-1">Weightings must add up to 100% — adjust sliders.</p>
            )}
          </div>
        </div>

      </div>

      {/* Bento grid: left col = Opportunity (full height), right col = Management + Deal stacked */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: 480 }}>
        {/* Left: Management — width proportional to mWeight */}
        <div className="min-w-0 flex overflow-hidden" style={{ flex: cMW }}>
          <BentoCard
            label="Management"
            letter="M"
            score={mScore}
            max={mMax}
            weightPct={cMW}
            items={mItems}
            flex={1}
          />
        </div>

        {/* Right: Opportunity + Deal — width proportional to oWeight + dWeight, heights split by each weight */}
        <div className="min-w-0 flex flex-col gap-4" style={{ flex: cOW + cDW }}>
          <div className="flex flex-col overflow-hidden" style={{ flex: cOW }}>
            <BentoCard
              label="Opportunity"
              letter="O"
              score={oScore}
              max={oMax}
              weightPct={cOW}
              items={oItems}
              flex={1}
            />
          </div>
          <div className="flex flex-col overflow-hidden" style={{ flex: cDW }}>
            <BentoCard
              label="Deal"
              letter="D"
              score={dScore}
              max={dMax}
              weightPct={cDW}
              items={dItems}
              flex={1}
            />
          </div>
        </div>
      </div>

    </TabularCard>
  );
}
