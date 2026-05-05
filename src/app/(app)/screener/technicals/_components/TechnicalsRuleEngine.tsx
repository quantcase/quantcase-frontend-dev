"use client";

import { useState } from "react";
import { SectionPanel } from "@/components/molecules/section-panel";
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

  const titleNode = (
    <div className="flex items-center gap-3">
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", letterSpacing: "0.01em" }}>Rule Engine</span>
      <div className="flex items-center gap-0.5">
        {(["GROWTH", "VALUE"] as const).map((p, i) => (
          <span key={p} className="contents">
            {i > 0 && <span className="text-[10px] select-none" style={{ color: "var(--qc-border-default)" }}>·</span>}
            <button
              onClick={() => setActivePerspective(p)}
              className="px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors"
              style={{ color: activePerspective === p ? "var(--qc-text-heading)" : "var(--qc-text-muted)" }}
            >
              {p}
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  const engineTabs = (
    <div
      className="inline-flex rounded-[8px] border p-0.5 gap-0.5"
      style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      {ENGINE_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onEngineChange(tab)}
          className="px-3 py-1.5 rounded-[6px] font-mono text-[10px] uppercase tracking-[0.14em] transition-all"
          style={activeEngine === tab
            ? { background: "var(--qc-text-heading)", color: "var(--qc-surface-white)" }
            : { color: "var(--qc-text-muted)" }
          }
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
        avgVolume20d={avgVolume20d}
      />
      <p className="mt-3 px-1 text-[11px] text-right" style={{ color: "var(--qc-text-muted)" }}>
        * All analysis and indicators are calculated using daily timeframe data.
      </p>
    </SectionPanel>
  );
}
