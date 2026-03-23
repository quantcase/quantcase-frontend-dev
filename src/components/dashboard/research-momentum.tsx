import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResearchMetric {
  id: string;
  label: string;
  value: number | string;
  sublabel: string;
}

interface ResearchMomentumProps {
  metrics: ResearchMetric[];
  className?: string;
}

export function ResearchMomentum({ metrics, className }: ResearchMomentumProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center gap-2">
        <BookOpen className="size-3.5 text-[#888888]" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
          Research Momentum
        </span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex-1 flex flex-col divide-y divide-[#E2E2E2]">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span style={{ fontSize: 14, fontWeight: 500, color: "#0F172B" }}>{metric.label}</span>
            <div className="text-right shrink-0">
              <div style={{ fontSize: 28, fontWeight: 400, color: "#0F172B", lineHeight: 1 }}>{metric.value}</div>
              <div style={{ fontSize: 11, color: "#888888", marginTop: 2 }}>{metric.sublabel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
