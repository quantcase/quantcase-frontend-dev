"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { MonoLabel } from "@/components/ds";

export interface MacroRegime {
  category: string;
  title: string;
  arrow: string;
  subtitle: string;
  sectors: { name: string; direction: "up" | "down"; metric: string; basketId?: string }[];
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
      <div className="px-2 pt-1 pb-3 flex items-center gap-2">
        <Zap className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
        <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Events Moving the Market</MonoLabel>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: -8 }}>
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
              <div style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", letterSpacing: "var(--qc-track-eyebrow)", textTransform: "uppercase", marginBottom: 4 }}>
                {regime.category}
              </div>
              <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", marginBottom: 2, display: "flex", alignItems: "baseline", gap: 4, flexWrap: "nowrap", whiteSpace: "nowrap", overflow: "hidden" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{regime.title}</span>
                <span style={{ color: "var(--qc-ink-2)", flexShrink: 0 }}>{regime.arrow}</span>
                <span style={{ fontWeight: "var(--qc-w-regular)", color: "var(--qc-ink-2)", flexShrink: 0 }}>{regime.subtitle}</span>
              </div>

              <div style={{ height: 1, background: "var(--qc-hair-2)", margin: "10px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {regime.sectors.map((sec) => (
                  <Link
                    key={sec.name}
                    href={sec.basketId ? `/screener/basket?id=${sec.basketId}` : "/screener/home"}
                    style={{ textDecoration: "none", display: "block", borderRadius: 6, padding: "4px 6px", margin: "-4px -6px", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{sec.name}</div>
                    <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: arrowColor(sec.direction) }}>
                      {arrowChar(sec.direction)} {sec.metric}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ height: 1, background: "var(--qc-hair-2)" }} />
        <div style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>
            {regimes.length} active macro regimes · {totalSectorSignals} sector signals mapped
          </div>
          <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-11)", letterSpacing: "var(--qc-track-mono)", color: "var(--qc-ink-3)" }}>
            Refreshed {refreshedTime} · {refreshedDate}
          </div>
        </div>
      </div>
    </div>
  );
}
