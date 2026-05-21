"use client";

import { Zap } from "lucide-react";
import { MonoLabel } from "@/components/ds";

export interface MacroRegime {
  category: string;
  title: string;
  arrow: string;
  subtitle: string;
  sectors: { name: string; direction: "up" | "down"; metric: string }[];
}

interface EventsMovingMarketProps {
  regimes: MacroRegime[];
  totalSectorSignals: number;
  refreshedTime: string;
  refreshedDate: string;
}

const arrowColor = (dir: "up" | "down") => (dir === "up" ? "var(--qc-up, #22c55e)" : "var(--qc-down, #ef4444)");
const arrowChar  = (dir: "up" | "down") => (dir === "up" ? "↑" : "↓");

export function EventsMovingMarket({ regimes, totalSectorSignals, refreshedTime, refreshedDate }: EventsMovingMarketProps) {
  return (
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", flex: 1 }}
    >
      {/* Header — matches WhoToCallToday */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Events Moving the Market</MonoLabel>
        </div>
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--qc-ink-3)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          FULL MACRO BRIEF →
        </span>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: 12, color: "var(--qc-ink-3)", marginTop: -8 }}>
        Macro regime signals · sector-level impact map
      </div>

      {/* Inner white card */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--qc-card)", display: "flex", flexDirection: "column" }}>
        {/* Regime columns */}
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, flex: 1 }}>
          {regimes.map((regime, i) => (
            <div
              key={regime.category}
              style={{
                borderRight: i < regimes.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
                paddingRight: i < regimes.length - 1 ? 20 : 0,
                paddingLeft: i > 0 ? 20 : 0,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                {regime.category}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", marginBottom: 2, display: "flex", alignItems: "baseline", gap: 4, flexWrap: "nowrap", whiteSpace: "nowrap", overflow: "hidden" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{regime.title}</span>
                <span style={{ color: "var(--qc-ink-2)", flexShrink: 0 }}>{regime.arrow}</span>
                <span style={{ fontWeight: 400, color: "var(--qc-ink-2)", flexShrink: 0 }}>{regime.subtitle}</span>
              </div>

              <div style={{ height: 1, background: "var(--qc-hair-2)", margin: "10px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {regime.sectors.map((sec) => (
                  <div key={sec.name}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}>{sec.name}</div>
                    <div style={{ fontSize: 11, color: arrowColor(sec.direction) }}>
                      {arrowChar(sec.direction)} {sec.metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ height: 1, background: "var(--qc-hair-2)" }} />
        <div style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
            {regimes.length} active macro regimes · {totalSectorSignals} sector signals mapped
          </div>
          <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 11, letterSpacing: "0.04em", color: "var(--qc-ink-3)" }}>
            Refreshed {refreshedTime} · {refreshedDate}
          </div>
        </div>
      </div>
    </div>
  );
}
