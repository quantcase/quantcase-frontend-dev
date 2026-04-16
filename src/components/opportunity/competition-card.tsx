"use client";

import { ShieldCheck, AlertTriangle, Lightbulb, Zap, ArrowRight } from "lucide-react";
import { type CompetitionSection } from "@/types/opportunity";
import { InsightsCard } from "@/components/opportunity/insights-card";

interface CompetitionCardProps {
  data?: CompetitionSection;
}

const SWOT_CONFIG = [
  {
    key: "strengths" as const,
    label: "Strengths",
    icon: ShieldCheck,
    labelColor: "text-emerald-700",
  },
  {
    key: "weaknesses" as const,
    label: "Weaknesses",
    icon: AlertTriangle,
    labelColor: "text-red-600",
  },
  {
    key: "opportunities" as const,
    label: "Opportunities",
    icon: Lightbulb,
    labelColor: "text-amber-600",
  },
  {
    key: "threats" as const,
    label: "Threats",
    icon: Zap,
    labelColor: "text-zinc-500",
  },
] as const;

export function CompetitionCard({ data }: CompetitionCardProps) {
  const swot = data?.text?.competitive_positioning;
  const ppd = data?.text?.pricing_power_dynamics;

  return (
    <div className="space-y-4">
      {/* SWOT 2x2 Grid */}
      <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-[#E2E2E2]">
          {SWOT_CONFIG.map(({ key, label, icon: Icon, labelColor }, idx) => {
            const items = (swot?.[key] ?? []) as string[];
            const isBottomRow = idx >= 2;
            return (
              <div
                key={key}
                className={`px-4 py-4 space-y-2.5${isBottomRow ? " border-t border-[#E2E2E2]" : ""}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`h-3 w-3 ${labelColor}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${labelColor}`}>
                    {label}
                  </span>
                </div>
                {items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {items.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 text-zinc-400 shrink-0 mt-[3px]" />
                        <span style={{ fontSize: 12, color: "#121212", lineHeight: 1.6 }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 12, color: "#AAAAAA" }}>—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
