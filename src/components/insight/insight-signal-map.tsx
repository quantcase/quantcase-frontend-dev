"use client";

import type { InsightSignalMapItem } from "@/types/analysis";
import { SignalTile } from "@/components/ds";

interface InsightSignalMapProps {
  signals: InsightSignalMapItem[];
  heading?: string;
}

export function InsightSignalMap({ signals, heading }: InsightSignalMapProps) {
  if (!signals.length) return null;

  return (
    <div>
      {heading && (
        <h3 style={{ fontSize: 28, fontWeight: 400, color: "var(--qc-ink)", margin: "0 0 16px", fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>
          {heading}
        </h3>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
  );
}
