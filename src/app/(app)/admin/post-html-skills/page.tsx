"use client";

import { useState } from "react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { DispatchPanel } from "./_components/DispatchPanel";
import { ConfigsPanel } from "./_components/ConfigsPanel";

type PageTab = "Dispatch" | "Configs";

export default function PostHtmlSkillsPage() {
  const [tab, setTab] = useState<PageTab>("Dispatch");

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Post-HTML Skills</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            On-demand dispatch for post-HTML (L3 / L4) and technicals analysis — plus prompt/schema
            configs per skill.
          </p>
        </div>
        <TabToggle variant="outline" options={["Dispatch", "Configs"]} value={tab} onChange={(v) => setTab(v as PageTab)} className="shrink-0" />
      </div>

      {tab === "Configs" ? <ConfigsPanel /> : <DispatchPanel />}
    </div>
  );
}
