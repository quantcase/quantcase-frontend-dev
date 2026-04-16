import { Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClientSegment {
  id: string;
  label: string;
  count: number;
  urgency?: "alert" | "warning" | "neutral";
}

interface SmartClientSegmentsProps {
  segments: ClientSegment[];
  className?: string;
}

export function SmartClientSegments({ segments, className }: SmartClientSegmentsProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Smart Client Segments
          </span>
        </div>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex flex-col divide-y divide-[#E2E2E2] overflow-hidden">
        {segments.map((seg) => {
          const countColor =
            seg.urgency === "alert" ? "#dc2626" :
            seg.urgency === "warning" ? "#d97706" :
            "#0F172B";
          return (
            <div
              key={seg.id}
              className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
            >
              <p className="text-[13px]" style={{ color: "#0F172B" }}>{seg.label}</p>
              <span
                className="text-[13px] font-semibold tabular-nums"
                style={{ color: countColor }}
              >
                {seg.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
