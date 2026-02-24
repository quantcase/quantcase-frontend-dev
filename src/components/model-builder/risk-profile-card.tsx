"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    allocation: "Allocation: 40% Quality, 35% Growth, 25% Value",
    threshold: "Threshold: ≥60 IM Score",
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
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" />
          Risk Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {RISK_PROFILES.map((profile) => {
          const isActive = profile.type === activeProfile;
          return (
            <button
              key={profile.type}
              onClick={() => onProfileChange?.(profile.type)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-all",
                isActive
                  ? "border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40"
                  : "border-zinc-200 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <div className="h-4 w-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isActive
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    {profile.label}
                  </span>
                </div>
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                )}
              </div>
              <p
                className={cn(
                  "text-xs mt-1 pl-6",
                  isActive ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                {profile.description}
              </p>
              {isActive && profile.allocation && (
                <div className="mt-2 pl-6 space-y-0.5">
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    {profile.allocation}
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    {profile.threshold}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
