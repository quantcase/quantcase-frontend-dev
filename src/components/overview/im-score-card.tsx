"use client";

import { useState, useCallback } from "react";
import type { FactorScore, ManagementIntelligence } from "@/types/management";
import type { FinalTakeaways, OFactorResponse } from "@/types/opportunity";
import type { OverviewSection } from "@/types/deal";
import { SectionShell } from "./primitives";
import { PillarPills, type PillarKey } from "./im-score/pillar-pills";
import { ActivePillarHero } from "./im-score/active-pillar-hero";
import { WeightingPanel } from "./im-score/weighting-panel";
import { QcScoreStrip } from "./im-score/qc-score-strip";

interface TitledBullet {
  title: string;
  text: string;
  score?: number | null;
  max?: number;
}

interface IMScoreCardProps {
  managementScore?: number | null;
  managementMax?: number | null;
  opportunityScore?: number | null;
  opportunityMax?: number | null;
  dealScore?: number | null;
  dealMax?: number | null;
  managementFactors?: FactorScore[];
  managementIntelligence?: ManagementIntelligence | null;
  opportunityTakeaways?: FinalTakeaways | null;
  opportunityData?: OFactorResponse | null;
  dealOverview?: OverviewSection | null;
}

const PILLAR_META = {
  M: { label: "Management", letter: "M" as const, sub: "Quality · credibility · track record · guidance" },
  O: { label: "Opportunity", letter: "O" as const, sub: "Industry · competition · strength · customer traction" },
  D: { label: "Deal", letter: "D" as const, sub: "EPS engine · valuation · re-rating · margin of safety" },
};

function getRating(scorePct: number): string {
  if (scorePct >= 0.80) return "Strong Buy";
  if (scorePct >= 0.65) return "Buy";
  if (scorePct >= 0.50) return "Hold";
  if (scorePct >= 0.35) return "Underperform";
  return "Sell";
}

function clampWeights(m: number, o: number, d: number): [number, number, number] {
  const total = m + o + d;
  if (total === 0) return [33, 34, 33];
  return [
    Math.round((m / total) * 100),
    Math.round((o / total) * 100),
    100 - Math.round((m / total) * 100) - Math.round((o / total) * 100),
  ];
}

export function IMScoreCard({
  managementScore, managementMax,
  opportunityScore, opportunityMax,
  dealScore, dealMax,
  managementFactors, managementIntelligence, opportunityTakeaways, opportunityData, dealOverview,
}: IMScoreCardProps) {
  const mScore = managementScore ?? null;
  const oScore = opportunityScore ?? null;
  const dScore = dealScore ?? null;
  const mMax = managementMax ?? 50;
  const oMax = opportunityMax ?? 30;
  const dMax = dealMax ?? 20;

  const [mWeight, setMWeight] = useState(40);
  const [oWeight, setOWeight] = useState(40);
  const [dWeight, setDWeight] = useState(20);
  const [activePillar, setActivePillar] = useState<PillarKey>("O");

  const handleMWeight = useCallback((val: number) => {
    const newM = Math.max(5, Math.min(90, val));
    const remaining = 100 - newM;
    const ratio = oWeight / (oWeight + dWeight || 1);
    setMWeight(newM);
    setOWeight(Math.max(5, Math.round(remaining * ratio)));
    setDWeight(Math.max(5, remaining - Math.max(5, Math.round(remaining * ratio))));
  }, [oWeight, dWeight]);

  const handleOWeight = useCallback((val: number) => {
    const newO = Math.max(5, Math.min(90, val));
    const remaining = 100 - newO;
    const ratio = mWeight / (mWeight + dWeight || 1);
    setOWeight(newO);
    setMWeight(Math.max(5, Math.round(remaining * ratio)));
    setDWeight(Math.max(5, remaining - Math.max(5, Math.round(remaining * ratio))));
  }, [mWeight, dWeight]);

  const handleDWeight = useCallback((val: number) => {
    const newD = Math.max(5, Math.min(90, val));
    const remaining = 100 - newD;
    const ratio = mWeight / (mWeight + oWeight || 1);
    setDWeight(newD);
    setMWeight(Math.max(5, Math.round(remaining * ratio)));
    setOWeight(Math.max(5, remaining - Math.max(5, Math.round(remaining * ratio))));
  }, [mWeight, oWeight]);

  const handleReset = useCallback(() => {
    setMWeight(40);
    setOWeight(40);
    setDWeight(20);
  }, []);

  const [cMW, cOW, cDW] = clampWeights(mWeight, oWeight, dWeight);

  let partialNumer = 0, partialDenom = 0;
  if (mScore !== null) { partialNumer += (mScore / mMax) * cMW; partialDenom += cMW; }
  if (oScore !== null) { partialNumer += (oScore / oMax) * cOW; partialDenom += cOW; }
  if (dScore !== null) { partialNumer += (dScore / dMax) * cDW; partialDenom += cDW; }
  const hasAnyScore = partialDenom > 0;
  const weightedPct = hasAnyScore ? partialNumer / partialDenom : 0;
  const displayScore = hasAnyScore ? Math.round(weightedPct * 100) : null;
  const rating = hasAnyScore ? getRating(weightedPct) : null;

  const pillScores: Record<PillarKey, { score: number | null; max: number }> = {
    M: { score: mScore, max: mMax },
    O: { score: oScore, max: oMax },
    D: { score: dScore, max: dMax },
  };

  const ap = activePillar;
  const apScore = pillScores[ap].score;
  const apMax = pillScores[ap].max;
  const apWeight = ap === "M" ? cMW : ap === "O" ? cOW : cDW;

  // Build sub-items per pillar
  const mItems: TitledBullet[] = managementIntelligence?.signals_breakdown?.length
    ? managementIntelligence.signals_breakdown.map((s) => ({
        title: s.label,
        text: s.details[0] ?? "",
        score: s.score,
        max: s.max_score,
      }))
    : managementFactors
      ? managementFactors.slice(0, 4).map((f) => ({ title: f.factor, text: f.descriptor ?? "" }))
      : [];

  const oSubScores = opportunityTakeaways?.section_scores;
  const oEntries = [
    { key: "industry", label: "Industry", max: 10 },
    { key: "competition", label: "Competition", max: 10 },
    { key: "financial_strength", label: "Financial Strength", max: 5 },
    { key: "customer_traction", label: "Customer Traction", max: 5 },
  ];
  const oItems: TitledBullet[] = oEntries.map((e) => {
    const sec = oSubScores?.[e.key as keyof typeof oSubScores];
    const takeaway =
      (sec as { takeaway?: string } | undefined)?.takeaway
      ?? (opportunityData?.[e.key as keyof OFactorResponse] as { text?: { takeaway?: string } } | undefined)?.text?.takeaway
      ?? "";
    return { title: e.label, text: takeaway, score: (sec as { score?: number } | undefined)?.score ?? null, max: e.max };
  });

  const dItems: TitledBullet[] = (() => {
    const items: TitledBullet[] = [];
    const eps = dealOverview?.eps_engine_card;
    if (eps?.drivers?.length) items.push({ title: "EPS Engine", text: eps.drivers.slice(0, 2).join("; ") });
    const val = dealOverview?.valuation_rerating_card;
    if (val?.drivers?.length) items.push({ title: "Valuation Re-Rating", text: val.drivers.slice(0, 2).join("; ") });
    if (items.length === 0 && dealOverview?.key_takeaway?.length) {
      dealOverview.key_takeaway.slice(0, 4).forEach((t) => items.push({ title: "Key Takeaway", text: t }));
    }
    return items;
  })();

  const activeItems = ap === "M" ? mItems : ap === "O" ? oItems : dItems;

  const pillarLabels: Record<PillarKey, string> = { M: "Management", O: "Opportunity", D: "Deal" };

  return (
    <div>
      <SectionShell>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, letterSpacing: "0.14em",
            color: "var(--qc-text-body)", textTransform: "uppercase",
            marginBottom: 12, whiteSpace: "nowrap",
          }}
        >
          QC Insight
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 14, marginBottom: 14 }}>
          {/* LEFT: Framework pillars */}
          <section
            style={{
              background: "var(--qc-surface-white)",
              border: "1px solid var(--qc-border-default)",
              borderRadius: 18, padding: "16px 20px 18px",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Header with icon buttons */}
            <header
              style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  letterSpacing: "0.16em", color: "var(--qc-text-muted)", textTransform: "uppercase",
                }}
              >
                M · O · D Framework
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
                  "M4 14v6h6M20 10V4h-6M20 4l-7 7M4 20l7-7",
                ].map((d, i) => (
                  <button
                    key={i}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      border: "1px solid var(--qc-border-default)",
                      background: "var(--qc-surface-white)",
                      color: "var(--qc-text-muted)",
                      display: "grid", placeItems: "center", cursor: "pointer",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d={d} />
                    </svg>
                  </button>
                ))}
              </div>
            </header>

            <PillarPills
              activePillar={activePillar}
              onSelect={setActivePillar}
              scores={pillScores}
              labels={pillarLabels}
            />

            <ActivePillarHero
              activePillar={ap}
              pillarLabel={PILLAR_META[ap].label}
              pillarSub={PILLAR_META[ap].sub}
              score={apScore}
              max={apMax}
              weight={apWeight}
              items={activeItems}
            />
          </section>

          {/* RIGHT: Weighting panel */}
          <WeightingPanel
            mWeight={cMW}
            oWeight={cOW}
            dWeight={cDW}
            displayScore={displayScore}
            onMChange={handleMWeight}
            onOChange={handleOWeight}
            onDChange={handleDWeight}
            onReset={handleReset}
          />
        </div>

        {rating && displayScore != null && (
          <QcScoreStrip
            displayScore={displayScore}
            rating={rating}
            weightedPct={weightedPct}
            weights={{ M: cMW, O: cOW, D: cDW }}
          />
        )}
      </SectionShell>
    </div>
  );
}
