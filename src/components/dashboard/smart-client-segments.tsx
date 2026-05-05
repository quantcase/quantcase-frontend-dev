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
    <div
      className={cn("rounded-[10px] p-2 flex flex-col", className)}
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            Smart Client Segments
          </span>
        </div>
      </div>

      {/* Inner white box */}
      <div
        className="rounded-[10px] flex flex-col divide-y overflow-hidden"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}
      >
        {segments.map((seg) => {
          const countColor =
            seg.urgency === "alert" ? "var(--qc-down)" :
            seg.urgency === "warning" ? "var(--qc-warn)" :
            "var(--qc-ink)";
          const countBg =
            seg.urgency === "alert" ? "var(--qc-down-soft)" :
            seg.urgency === "warning" ? "var(--qc-warn-soft)" :
            "transparent";
          return (
            <div
              key={seg.id}
              className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors hover:bg-[var(--qc-section)]"
              style={{ borderTopColor: "var(--qc-hair-2)" }}
            >
              <p className="text-[13px]" style={{ color: "var(--qc-ink)" }}>{seg.label}</p>
              <span
                className="text-[13px] font-semibold tabular-nums rounded-sm px-2 py-0.5"
                style={{
                  color: countColor,
                  background: countBg,
                  fontFamily: "var(--font-ibm-plex-mono, monospace)",
                }}
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
