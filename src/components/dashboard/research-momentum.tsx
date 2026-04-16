import { BookOpen, FileText, BarChart2, Milestone, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResearchMetric {
  id: string;
  label: string;
  value: number | string;
  sublabel: string;
}

// Each metric gets a dedicated icon for quick visual scanning
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
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Research Momentum
          </span>
        </div>
        <span
          className="text-[10px] font-medium rounded-sm px-2 py-0.5"
          style={{ background: "#F5F5F5", color: "#888888", border: "1px solid #E2E2E2" }}
        >
          {total} activities
        </span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex-1 flex flex-col divide-y divide-[#E2E2E2] overflow-hidden">
        {metrics.map((metric, i) => {
          const Icon = METRIC_ICONS[i % METRIC_ICONS.length];
          return (
            <div
              key={metric.id}
              className="flex items-center gap-4 pl-0 pr-4 py-3 border-l-[3px] border-l-zinc-300 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
            >
              {/* Icon box */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="p-1.5 rounded-[6px]"
                  style={{
                    border: "1px solid rgba(18,18,18,0.10)",
                    background: "rgba(18,18,18,0.03)",
                  }}
                >
                  <Icon className="size-3.5 text-zinc-500" />
                </div>
              </div>

              {/* Label */}
              <p className="flex-1 text-[13px] font-medium" style={{ color: "#0F172B" }}>{metric.label}</p>

              {/* Value + sublabel */}
              <div className="flex items-baseline gap-1.5 flex-shrink-0">
                <span style={{ fontSize: 26, fontWeight: 500, color: "#0F172B", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {metric.value}
                </span>
                <span
                  className="text-[10px] font-medium rounded-sm px-1.5 py-0.5"
                  style={{ background: "#F5F5F5", color: "#888888", border: "1px solid #E2E2E2" }}
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
