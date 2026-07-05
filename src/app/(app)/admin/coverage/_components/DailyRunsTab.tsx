"use client";

import { useState } from "react";
import { BseDiscoveryPanel } from "./BseDiscoveryPanel";

type DailyRunsSection = "prowess" | "bse";

const SECTIONS: { id: DailyRunsSection; label: string }[] = [
  { id: "prowess", label: "Prowess Daily" },
  { id: "bse", label: "BSE Discovery" },
];

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-10 text-center">
      <p className="text-[13px] text-[#888888]">{label} is not implemented yet.</p>
    </div>
  );
}

export function DailyRunsTab() {
  const [section, setSection] = useState<DailyRunsSection>("bse");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border border-[#E2E2E2] p-0.5 bg-[#F5F5F5]">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
              section === s.id ? "bg-white text-[#0F172B] shadow-sm" : "text-[#888888] hover:text-[#0F172B]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "prowess" && <ComingSoon label="Prowess Daily" />}
      {section === "bse" && <BseDiscoveryPanel />}
    </div>
  );
}
