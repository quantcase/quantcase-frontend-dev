"use client";

import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskProfileType, RiskProfileOption } from "@/types/portfolio";

interface RiskProfileCardProps {
  activeProfile: RiskProfileType;
  onProfileChange?: (profile: RiskProfileType) => void;
}

const RISK_PROFILES: RiskProfileOption[] = [
  {
    type: "conservative",
    label: "Conservative",
    description: "Capital preservation focus with steady income",
    allocation: "",
    threshold: "",
  },
  {
    type: "balanced",
    label: "Balanced",
    description: "Mix of growth and stability",
    allocation: "",
    threshold: "",
  },
  {
    type: "aggressive",
    label: "Aggressive",
    description: "High growth potential with higher volatility",
    allocation: "",
    threshold: "",
  },
];

export function RiskProfileCard({ activeProfile, onProfileChange }: RiskProfileCardProps) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="px-2 pt-1 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5" style={{ color: "rgba(18,18,18,0.50)" }}>
          <ShieldAlert className="h-3 w-3" />
          Risk Profile
        </p>
      </div>
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-3 space-y-2">
        {RISK_PROFILES.map((profile) => {
          const isActive = profile.type === activeProfile;
          return (
            <button
              key={profile.type}
              onClick={() => onProfileChange?.(profile.type)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-all",
                isActive
                  ? "border-[#E2E2E2] bg-[#F5F5F5]"
                  : "border-transparent bg-transparent hover:bg-[#F5F5F5]",
                onProfileChange ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                    isActive ? "border-[#0F172B]" : "border-[#E2E2E2]"
                  )}>
                    {isActive && <div className="h-2 w-2 rounded-full bg-[#0F172B]" />}
                  </div>
                  <span className="text-sm font-medium" style={{ color: isActive ? "#0F172B" : "#888888" }}>
                    {profile.label}
                  </span>
                </div>
              </div>
              <p className="text-xs mt-1 pl-6.5" style={{ color: isActive ? "#888888" : "rgba(18,18,18,0.40)" }}>
                {profile.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
