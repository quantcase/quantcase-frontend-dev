"use client";

import { useState } from "react";
import { L1MultiDispatchTab } from "./_components/L1MultiDispatchTab";

type CoverageTab = "l1" | "l2" | "l3";

const TABS: { id: CoverageTab; label: string }[] = [
  { id: "l1", label: "L1" },
  { id: "l2", label: "L2" },
  { id: "l3", label: "L3" },
];

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-10 text-center">
      <p className="text-[13px] text-[#888888]">{label} coverage is not implemented yet.</p>
    </div>
  );
}

export default function CoveragePage() {
  const [activeTab, setActiveTab] = useState<CoverageTab>("l1");

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Pipeline Coverage</h1>
        <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
          On-demand pipeline dispatch and coverage, by extraction level
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex border-b border-[#E2E2E2]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[#0F172B] text-[#0F172B]"
                : "border-transparent text-[#888888] hover:text-[#0F172B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "l1" && <L1MultiDispatchTab />}
      {activeTab === "l2" && <ComingSoon label="L2" />}
      {activeTab === "l3" && <ComingSoon label="L3" />}
    </div>
  );
}
