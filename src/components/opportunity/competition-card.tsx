"use client";

import { ShieldCheck, AlertTriangle, Lightbulb, Zap, ArrowRight } from "lucide-react";
import { type CompetitionSection } from "@/types/opportunity";

interface CompetitionCardProps {
  data?: CompetitionSection;
}

const SWOT_CONFIG = [
  { key: "strengths" as const, label: "Strengths", icon: ShieldCheck, colorVar: "var(--qc-up)" },
  { key: "weaknesses" as const, label: "Weaknesses", icon: AlertTriangle, colorVar: "var(--qc-down)" },
  { key: "opportunities" as const, label: "Opportunities", icon: Lightbulb, colorVar: "var(--qc-warn)" },
  { key: "threats" as const, label: "Threats", icon: Zap, colorVar: "var(--qc-text-muted)" },
] as const;

export function CompetitionCard({ data }: CompetitionCardProps) {
  const swot = data?.text?.competitive_positioning;

  return (
    <div className="space-y-4">
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)", overflow: "hidden" }}>
        <div className="grid grid-cols-2" style={{ borderColor: "var(--qc-border-default)" }}>
          {SWOT_CONFIG.map(({ key, label, icon: Icon, colorVar }, idx) => {
            const items = (swot?.[key] ?? []) as string[];
            const isBottomRow = idx >= 2;
            return (
              <div
                key={key}
                className="px-4 py-4 space-y-2.5"
                style={{
                  borderTop: isBottomRow ? "1px solid var(--qc-border-default)" : "none",
                  borderRight: idx % 2 === 0 ? "1px solid var(--qc-border-default)" : "none",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3" style={{ color: colorVar }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colorVar }}>
                    {label}
                  </span>
                </div>
                {items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {items.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 shrink-0 mt-[3px]" style={{ color: "var(--qc-text-muted)" }} />
                        <span style={{ fontSize: 12, color: "var(--qc-text-body)", lineHeight: 1.6 }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
