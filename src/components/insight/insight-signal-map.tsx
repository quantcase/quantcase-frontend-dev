"use client";

import type { InsightSignalMapItem } from "@/types/analysis";
import { SignalTile, SectionHeader } from "@/components/ds";

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
      <SectionHeader label={heading ?? "Signals"} count={signals.length} style={{ marginBottom: 0, padding: "10px 12px 16px" }} />

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
