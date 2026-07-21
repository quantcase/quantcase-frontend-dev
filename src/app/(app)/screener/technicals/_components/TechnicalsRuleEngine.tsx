"use client";

import { useState } from "react";
import { RuleEngineSection } from "./RuleEngineSection";
import type {
  RuleEngine,
  DecisionIntelligence,
  SmaDistancePct,
  StockClassification,
} from "@/types/technicals";

const ENGINE_TABS = ["STRUCTURE", "TREND", "TIMING", "DOMINANCE"] as const;
export type EngineTab = typeof ENGINE_TABS[number];

const TAB_SUMMARY_KEY: Record<EngineTab, keyof DecisionIntelligence["ruleEngine"]["tabSummaries"]> = {
  STRUCTURE: "structure",
  TREND: "trend",
  TIMING: "timing",
  // Backend still keys this summary as `relativeStrength`; the tab is labelled Dominance.
  DOMINANCE: "relativeStrength",
};

interface Props {
  ruleEngine: RuleEngine;
  decisionIntelligence?: DecisionIntelligence;
  stockClassification?: StockClassification | null;
  smaDistancePct?: SmaDistancePct | null;
  activeEngine: EngineTab;
  onEngineChange: (tab: EngineTab) => void;
  avgVolume20d?: number;
}

/** Growth/Value is manual, but starts on whichever lens the classifier picked. */
function defaultPerspective(classification: StockClassification | null | undefined): "GROWTH" | "VALUE" {
  return classification?.stock_type === "Value" ? "VALUE" : "GROWTH";
}

function StockTypeChip({ classification }: { classification: StockClassification }) {
  const { stock_type, growth_score, value_score, classification_note, wyckoff_growth_warning } = classification;
  const label =
    stock_type === "Mixed"
      ? `MIXED · G ${growth_score} / V ${value_score}`
      : stock_type.toUpperCase();

  return (
    <span
      title={classification_note || undefined}
      className="inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]"
      // Neutral chrome — stock type is a category, not a good/bad signal.
      style={{ borderColor: "var(--qc-hair)", color: "var(--qc-ink-2)", background: "var(--qc-card)" }}
    >
      {wyckoff_growth_warning && (
        <span
          title={wyckoff_growth_warning}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--qc-warn)" }}
        />
      )}
      {label}
    </span>
  );
}

export function TechnicalsRuleEngine({
  ruleEngine,
  decisionIntelligence,
  stockClassification,
  smaDistancePct,
  activeEngine,
  onEngineChange,
  avgVolume20d,
}: Props) {
  const [activePerspective, setActivePerspective] = useState<"GROWTH" | "VALUE">(
    () => defaultPerspective(stockClassification),
  );

  const tabSummary =
    decisionIntelligence?.ruleEngine?.tabSummaries?.[TAB_SUMMARY_KEY[activeEngine]] ?? null;
  const isMixed = stockClassification?.stock_type === "Mixed";

  return (
    <div
      className="flex flex-col"
      style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", background: "var(--qc-section)", padding: 8 }}
    >
      {/* Header — stacks vertically on mobile */}
      <div className="flex flex-col gap-2 px-2 pt-1 pb-3">
        {/* Title row with perspective toggle */}
        <div className="flex items-center justify-between gap-2">
          <span style={{ fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", letterSpacing: "0.01em", fontFamily: "var(--qc-font-sans)" }}>
            Rule Engine
          </span>
          <div className="flex items-center gap-2">
            {stockClassification && <StockTypeChip classification={stockClassification} />}
            <div className="flex items-center gap-0.5">
            {(["GROWTH", "VALUE"] as const).map((p, i) => (
              <span key={p} className="contents">
                {i > 0 && <span className="text-[10px] select-none" style={{ color: "var(--qc-hair)" }}>·</span>}
                <button
                  onClick={() => setActivePerspective(p)}
                  className="px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors"
                  style={{ color: activePerspective === p ? "var(--qc-ink)" : "var(--qc-ink-2)" }}
                >
                  {p}
                </button>
              </span>
            ))}
            </div>
          </div>
        </div>
        {/* Mixed is the majority case today, so a one-line hint rather than
            stacking both watchouts on every card. */}
        {isMixed && (
          <span style={{ fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-sans)" }}>
            Mixed profile — compare both lenses.
          </span>
        )}
        {/* Engine tabs — scrollable on mobile */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div
            className="inline-flex rounded-[8px] border p-0.5 gap-0.5"
            style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
          >
            {ENGINE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => onEngineChange(tab)}
                className="px-3 py-1.5 rounded-[6px] font-mono text-[10px] uppercase tracking-[0.14em] transition-all whitespace-nowrap"
                style={activeEngine === tab
                  ? { background: "var(--qc-ink)", color: "var(--qc-card)" }
                  : { color: "var(--qc-ink-2)" }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content box */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid var(--qc-hair-2)",
          background: "var(--qc-card)",
          padding: 16,
        }}
      >
        {tabSummary && (
          <p style={{ margin: "0 0 12px", fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", lineHeight: 1.55, fontFamily: "var(--qc-font-sans)" }}>
            {tabSummary}
          </p>
        )}
        <RuleEngineSection
          ruleEngine={ruleEngine}
          decisionIntelligence={decisionIntelligence}
          activeEngine={activeEngine}
          activePerspective={activePerspective}
          avgVolume20d={avgVolume20d}
          smaDistancePct={smaDistancePct}
          wyckoffGrowthWarning={stockClassification?.wyckoff_growth_warning ?? null}
        />
        <p className="mt-3 px-1 text-[11px] text-right" style={{ color: "var(--qc-ink-2)" }}>
          * All analysis and indicators are calculated using daily timeframe data.
        </p>
      </div>
    </div>
  );
}
