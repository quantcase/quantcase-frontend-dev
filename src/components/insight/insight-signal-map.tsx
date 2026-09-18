"use client";

import { ReactNode } from "react";
import { Brain } from "lucide-react";
import type { InsightSignalMapItem } from "@/types/analysis";
import { SectionPanel } from "@/components/molecules/section-panel";
import { SignalCard } from "@/components/overview/signal-card";

interface InsightSignalMapProps {
  signals: InsightSignalMapItem[];
  heading?: ReactNode;
  subtitle?: string;
}

export function InsightSignalMap({ signals, heading, subtitle }: InsightSignalMapProps) {
  if (!signals.length) return null;

  const fillHeight = signals.length >= 5;

  const headerContent = heading ?? (
    <div className="flex items-center gap-2">
      <div className="grid place-items-center rounded-md border border-hair bg-[var(--qc-chip)] p-1.5">
        <Brain className="size-3.5 text-ink" />
      </div>
      <span className="text-[13px] font-semibold tracking-[0.01em] text-ink">
        Decision Intelligence
      </span>
    </div>
  );

  return (
    <SectionPanel
      className="flex-1"
      title={headerContent}
      subtitle={subtitle}
      contentClassName="min-w-0"
    >
      {/* ── Mobile: 2-col grid with dot indicators ── */}
      <div className="md:hidden" style={{ margin: "-16px -16px", padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {signals.map((s, i) => {
            const isPositive = s.sentiment === "positive";
            const dotColor = isPositive ? "var(--qc-up)" : s.sentiment === "negative" ? "var(--qc-down)" : "var(--qc-warn)";
            const valueColor = isPositive ? "var(--qc-up)" : s.sentiment === "negative" ? "var(--qc-down)" : "var(--qc-warn)";
            const isNotLastRow = i < signals.length - 2;
            const isLeftCol = i % 2 === 0;
            return (
              <div
                key={i}
                style={{
                  padding: "12px 14px",
                  borderBottom: isNotLastRow ? "1px solid var(--qc-hair)" : undefined,
                  borderRight: isLeftCol ? "1px solid var(--qc-hair)" : undefined,
                }}
              >
                <div style={{
                  fontSize: 9, color: "var(--qc-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "var(--qc-font-mono)", marginBottom: 5,
                }}>
                  {(s.category ?? s.label ?? "Signal").toUpperCase()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: dotColor }} />
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: valueColor, lineHeight: 1.3,
                    fontFamily: "var(--qc-font-sans)",
                  }}>
                    {s.summary ?? s.signal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop: 2-col grid (unchanged) ── */}
      <div
        className="hidden md:grid grid-cols-2"
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
