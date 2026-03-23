import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type FrameworkStatus = "on_track" | "pressured" | "at_risk" | "watch";

export interface FrameworkItem {
  id: string;
  title: string;
  description: string;
  status: FrameworkStatus;
}

const STATUS_CONFIG: Record<FrameworkStatus, { label: string; textClass: string }> = {
  on_track: {
    label: "ON TRACK",
    textClass: "text-emerald-600",
  },
  pressured: {
    label: "PRESSURED",
    textClass: "text-amber-600",
  },
  at_risk: {
    label: "AT RISK",
    textClass: "text-red-600",
  },
  watch: {
    label: "WATCH",
    textClass: "text-zinc-500",
  },
};

interface FrameworkIntegrityMonitorProps {
  items: FrameworkItem[];
  className?: string;
}

export function FrameworkIntegrityMonitor({ items, className }: FrameworkIntegrityMonitorProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center gap-2">
        <Layers className="size-3.5 text-[#888888]" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
          Framework Integrity Monitor
        </span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex-1 flex flex-col divide-y divide-[#E2E2E2]">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          return (
            <div key={item.id} className="flex items-center justify-between gap-6 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <h5 style={{ color: "#0F172B", marginBottom: 2 }}>{item.title}</h5>
                <p style={{ fontSize: 13, color: "#888888" }}>{item.description}</p>
              </div>
              <span
                className={cn("text-[11px] font-semibold tracking-wider shrink-0", config.textClass)}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
