import { BookOpen, FileText, BarChart2, Milestone, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResearchMetric {
  id: string;
  label: string;
  value: number | string;
  sublabel: string;
}

const METRIC_ICONS = [FileText, BarChart2, Milestone, PlusCircle];

interface ResearchMomentumProps {
  metrics: ResearchMetric[];
  className?: string;
}

export function ResearchMomentum({ metrics, className }: ResearchMomentumProps) {
  const total = metrics.reduce((sum, m) => {
    const v = typeof m.value === "number" ? m.value : parseInt(String(m.value), 10);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  return (
    <div
      className={cn("rounded-[10px] p-2 h-full flex flex-col", className)}
      style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            Research Momentum
          </span>
        </div>
        <span
          className="text-[10px] font-medium rounded-sm px-2 py-0.5"
          style={{ background: "var(--qc-chip-bg)", color: "var(--qc-chip-fg)", border: "1px solid var(--qc-chip-border)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
        >
          {total} activities
        </span>
      </div>

      {/* Inner white box */}
      <div
        className="rounded-[10px] flex-1 flex flex-col divide-y overflow-hidden"
        style={{ background: "var(--qc-surface-card)", border: "1px solid var(--qc-border-inner)" }}
      >
        {metrics.map((metric, i) => {
          const Icon = METRIC_ICONS[i % METRIC_ICONS.length];
          return (
            <div
              key={metric.id}
              className="flex items-center gap-4 pl-0 pr-4 py-3 cursor-pointer transition-colors hover:bg-[var(--qc-surface-hover)]"
              style={{ borderLeft: "3px solid var(--qc-border-default)", borderTopColor: "var(--qc-border-inner)" }}
            >
              {/* Icon box */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="p-1.5 rounded-[6px]"
                  style={{
                    border: "1px solid var(--qc-icon-box-border)",
                    background: "var(--qc-icon-box-bg)",
                  }}
                >
                  <Icon className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
                </div>
              </div>

              {/* Label */}
              <p className="flex-1 text-[13px] font-medium" style={{ color: "var(--qc-text-heading)" }}>{metric.label}</p>

              {/* Value + sublabel */}
              <div className="flex items-baseline gap-1.5 flex-shrink-0">
                <span style={{ fontSize: 26, fontWeight: 500, color: "var(--qc-text-heading)", lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                  {metric.value}
                </span>
                <span
                  className="text-[10px] font-medium rounded-sm px-1.5 py-0.5"
                  style={{ background: "var(--qc-chip-bg)", color: "var(--qc-chip-fg)", border: "1px solid var(--qc-chip-border)" }}
                >
                  {metric.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
