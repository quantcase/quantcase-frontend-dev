"use client";

import { useState } from "react";
import { RuleEngineSection } from "./RuleEngineSection";
import type { RuleEngine, DecisionIntelligence } from "@/types/technicals";

const ENGINE_TABS = ["STRUCTURE", "TREND", "TIMING", "RELATIVE STRENGTH"] as const;
export type EngineTab = typeof ENGINE_TABS[number];

interface Props {
  ruleEngine: RuleEngine;
  decisionIntelligence?: DecisionIntelligence;
  activeEngine: EngineTab;
  onEngineChange: (tab: EngineTab) => void;
  avgVolume20d?: number;
}

export function TechnicalsRuleEngine({ ruleEngine, decisionIntelligence, activeEngine, onEngineChange, avgVolume20d }: Props) {
  const [activePerspective, setActivePerspective] = useState<"GROWTH" | "VALUE">("GROWTH");

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
        <RuleEngineSection
          ruleEngine={ruleEngine}
          decisionIntelligence={decisionIntelligence}
          activeEngine={activeEngine}
          activePerspective={activePerspective}
          avgVolume20d={avgVolume20d}
        />
        <p className="mt-3 px-1 text-[11px] text-right" style={{ color: "var(--qc-ink-2)" }}>
          * All analysis and indicators are calculated using daily timeframe data.
        </p>
      </div>
    </div>
  );
}
