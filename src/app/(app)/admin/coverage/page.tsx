"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, ArrowRight, HelpCircle } from "lucide-react";
import { L1MultiDispatchTab } from "./_components/L1MultiDispatchTab";
import { L2MultiDispatchTab } from "./_components/L2MultiDispatchTab";
import { DailyRunsTab } from "./_components/DailyRunsTab";
import { HelpModal } from "./_components/HelpModal";

type CoverageTab = "l1" | "l2" | "l3" | "daily";

const TABS: { id: CoverageTab; label: string }[] = [
  { id: "l1", label: "L1" },
  { id: "l2", label: "L2" },
  { id: "l3", label: "L3" },
  { id: "daily", label: "Daily Runs" },
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
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Pipeline Coverage</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            On-demand pipeline dispatch and coverage, by extraction level
          </p>
        </div>

        {/* Always available — explains the flow and every option across L1, L2, Daily Runs, and Company Groups */}
        <button
          onClick={() => setShowHelp(true)}
          title="Help"
          className="flex items-center justify-center size-7 rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors shrink-0"
        >
          <HelpCircle className="size-3.5" />
        </button>
      </div>

      {/* Manage Company Groups — prominent, top of page: manual ticker lists and live filters
          reusable across L1/L2/L3, managed in one place regardless of which lens tab is open. */}
      <Link
        href="/admin/company-groups"
        className="flex items-center gap-4 rounded-[10px] border border-[#E2E2E2] bg-white px-5 py-4 hover:border-[#0F172B] transition-colors group"
      >
        <div className="flex size-10 items-center justify-center rounded-[8px] bg-[#0F172B] shrink-0">
          <Layers className="size-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#0F172B]">Company Groups</p>
          <p className="text-[12px] text-[#888888] mt-0.5">
            Manual ticker lists and live filters, reusable across L1, L2, and L3 dispatch — create,
            edit, and tag them here.
          </p>
        </div>
        <ArrowRight className="size-4 text-[#888888] group-hover:text-[#0F172B] transition-colors shrink-0" />
      </Link>

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
      {activeTab === "l2" && <L2MultiDispatchTab />}
      {activeTab === "l3" && <ComingSoon label="L3" />}
      {activeTab === "daily" && <DailyRunsTab />}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
