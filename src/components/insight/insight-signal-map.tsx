"use client";

import type { InsightSignalMapItem } from "@/types/analysis";
import { SectionPanel } from "@/components/molecules/section-panel";
import { SignalCard } from "@/components/overview/signal-card";

interface InsightSignalMapProps {
  signals: InsightSignalMapItem[];
  heading?: string;
  subtitle?: string;
}

export function InsightSignalMap({ signals, heading, subtitle }: InsightSignalMapProps) {
  if (!signals.length) return null;

  // With enough tiles the rows are sized evenly to fill the card, so this column
  // ends level with the (taller) lenses column beside it. Sparse lists keep their
  // natural rows so a 2- or 3-signal card doesn't balloon. The tile itself is
  // never resized — it's centred in its row — since SignalCard is shared.
  const fillHeight = signals.length >= 5;

  return (
    // Header matches the fundamentals page cards (SectionPanel: sans title +
    // subtitle), so every research card across the screener reads the same.
    <SectionPanel
      className="flex-1"
      title={heading ?? "Signals"}
      subtitle={subtitle ?? "Positive and caution signals"}
      contentClassName="min-w-0"
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ gap: 10, height: "100%", gridAutoRows: fillHeight ? "1fr" : "auto" }}
      >
        {signals.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <SignalCard
              label={(s.category ?? s.label ?? "Signal").toUpperCase()}
              value={s.summary ?? s.signal}
              sentiment={s.sentiment}
              tooltip={s.signal ? { description: s.signal } : undefined}
              tooltipAlign="right"
            />
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
