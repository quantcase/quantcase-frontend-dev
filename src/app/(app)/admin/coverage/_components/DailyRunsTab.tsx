"use client";

import { useState } from "react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { ProwessDailyBatchPanel } from "./ProwessDailyBatchPanel";
import { BseDiscoveryPanel } from "./BseDiscoveryPanel";

const SUB_TABS = ["Prowess Daily", "BSE Discovery"] as const;
type SubTab = (typeof SUB_TABS)[number];

export function DailyRunsTab() {
  const [subTab, setSubTab] = useState<SubTab>("Prowess Daily");

  return (
    <div className="space-y-4">
      <TabToggle options={[...SUB_TABS]} value={subTab} onChange={(v) => setSubTab(v as SubTab)} variant="pill" />
      {subTab === "Prowess Daily" && <ProwessDailyBatchPanel />}
      {subTab === "BSE Discovery" && <BseDiscoveryPanel />}
    </div>
  );
}
