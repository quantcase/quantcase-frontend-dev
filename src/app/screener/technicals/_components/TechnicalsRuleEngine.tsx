"use client";

import { useState } from "react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { RuleEngineSection } from "./RuleEngineSection";
import type { RuleEngine, DecisionIntelligence } from "@/types/technicals";

const ENGINE_TABS = ["STRUCTURE", "TREND", "TIMING", "DOMINANCE"] as const;
export type EngineTab = typeof ENGINE_TABS[number];

interface Props {
  ruleEngine: RuleEngine;
  decisionIntelligence?: DecisionIntelligence;
  activeEngine: EngineTab;
  onEngineChange: (tab: EngineTab) => void;
}

export function TechnicalsRuleEngine({ ruleEngine, decisionIntelligence, activeEngine, onEngineChange }: Props) {
  const [activePerspective, setActivePerspective] = useState<"GROWTH" | "VALUE">("GROWTH");

  const titleNode = (
    <div className="flex items-center gap-3">
      <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", letterSpacing: "0.01em" }}>Rule Engine</span>
      <div className="flex items-center gap-0.5">
        {(["GROWTH", "VALUE"] as const).map((p, i) => (
          <>
            {i > 0 && <span key={`sep-${p}`} className="text-[#E2E2E2] text-[10px] select-none">·</span>}
            <button
              key={p}
              onClick={() => setActivePerspective(p)}
              className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                activePerspective === p
                  ? "text-[#0F172B]"
                  : "text-[#C0C0C0] hover:text-[#888888]"
              }`}
            >
              {p}
            </button>
          </>
        ))}
      </div>
    </div>
  );

  const engineTabs = (
    <div className="inline-flex rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] p-0.5 gap-0.5">
      {ENGINE_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onEngineChange(tab)}
          className={`px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all ${
            activeEngine === tab
              ? "bg-[#0F172B] text-white"
              : "text-[#888888] hover:text-[#0F172B]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  return (
    <SectionPanel
      title={titleNode}
      headerAction={engineTabs}
    >
      <RuleEngineSection
        ruleEngine={ruleEngine}
        decisionIntelligence={decisionIntelligence}
        activeEngine={activeEngine}
        activePerspective={activePerspective}
      />
    </SectionPanel>
  );
}
