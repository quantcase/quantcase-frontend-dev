"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { DrhpRiskItem } from "@/types/drhp";

type Tier = "critical" | "caution" | "watch";

const TIER_CONFIG: Record<Tier, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: "CRITICAL", bg: "bg-red-50",    text: "text-red-700",    border: "border-l-red-600" },
  caution:  { label: "CAUTION",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-l-amber-500" },
  watch:    { label: "WATCH",    bg: "bg-yellow-50", text: "text-yellow-700", border: "border-l-yellow-500" },
};

interface RiskCardProps {
  item: DrhpRiskItem;
  tier: Tier;
}

export function RiskCard({ item, tier }: RiskCardProps) {
  const [open, setOpen] = useState(false);
  const { label, bg, text, border } = TIER_CONFIG[tier];

  return (
    <div className={`rounded-[8px] border border-[#E2E2E2] border-l-4 ${border} overflow-hidden`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${open ? bg : "bg-white hover:bg-[#F5F5F5]"}`}
      >
        {/* Tier badge */}
        <span className={`flex-shrink-0 mt-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm px-1.5 py-0.5 ${bg} ${text}`}>
          {label}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium leading-snug" style={{ color: "var(--qc-text-heading)" }}>{item.flag}</p>
          {!open && (
            <p className="text-[12px] mt-0.5 line-clamp-1" style={{ color: "var(--qc-text-muted)" }}>{item.implication}</p>
          )}
        </div>

        <div className="flex-shrink-0 ml-2">
          {open ? <ChevronUp className="size-3.5 mt-0.5" style={{ color: "var(--qc-text-muted)" }} /> : <ChevronDown className="size-3.5 mt-0.5" style={{ color: "var(--qc-text-muted)" }} />}
        </div>
      </button>

      {open && (
        <div className="px-4 py-3 border-t border-[#E2E2E2] space-y-2" style={{ background: "#FAFAFA" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--qc-text-muted)" }}>Evidence</p>
            <p className="text-[12px] leading-relaxed" style={{ color: "#121212" }}>{item.evidence}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--qc-text-muted)" }}>Implication</p>
            <p className="text-[12px] leading-relaxed" style={{ color: "#121212" }}>{item.implication}</p>
          </div>
        </div>
      )}
    </div>
  );
}
