"use client";

import { BarChart2 } from "lucide-react";
import type { InsightSignalMapItem } from "@/types/analysis";
import { SignalTile, MonoLabel, LimeCountPip } from "@/components/ds";

interface InsightSignalMapProps {
  signals: InsightSignalMapItem[];
  heading?: string;
}

export function InsightSignalMap({ signals, heading }: InsightSignalMapProps) {
  if (!signals.length) return null;

  return (
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", display: "flex", flexDirection: "column", flex: 1 }}
    >
      {/* Header */}
      <div className="px-2 pt-1 pb-3 flex items-center gap-2">
        <BarChart2 className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
        <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">
          {heading ?? "Signals"}
        </MonoLabel>
        <LimeCountPip count={signals.length} />
      </div>

      {/* Inner card with 2-col grid */}
      <div
        className="rounded-[10px] p-3"
        style={{ background: "var(--qc-card)", flex: 1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
          {signals.map((s, i) => (
            <SignalTile
              key={i}
              label={(s.category ?? s.label ?? "Signal").toUpperCase()}
              value={s.summary ?? s.signal}
              sentiment={s.sentiment}
              detail={s.signal}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
