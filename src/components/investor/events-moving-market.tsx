"use client";

import Link from "next/link";

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

const arrowColor = (dir: "up" | "down") => (dir === "up" ? "#22c55e" : "#ef4444");
const arrowChar = (dir: "up" | "down") => (dir === "up" ? "↑" : "↓");

export function EventsMovingMarket({ regimes, totalSectorSignals, refreshedTime, refreshedDate }: EventsMovingMarketProps) {
  return (
    <div
      style={{
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172B", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            EVENTS MOVING THE MARKET
          </div>
          <Link href="#" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#888", textDecoration: "none", whiteSpace: "nowrap", marginLeft: 16 }}>
            Full macro brief →
          </Link>
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
          Macro regime signals · sector-level impact map
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E2E2E2" }} />

      {/* Regime columns */}
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, flex: 1 }}>
        {regimes.map((regime, i) => (
          <div
            key={regime.category}
            style={{
              borderRight: i < regimes.length - 1 ? "1px solid #E2E2E2" : "none",
              paddingRight: i < regimes.length - 1 ? 20 : 0,
              paddingLeft: i > 0 ? 20 : 0,
            }}
          >
            {/* Category label */}
            <div style={{ fontSize: 10, fontWeight: 600, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              {regime.category}
            </div>
            {/* Title + arrow + subtitle */}
            <div style={{ fontSize: 14, fontWeight: 500, color: "#0F172B", marginBottom: 2 }}>
              {regime.title}{" "}
              <span style={{ color: "#555" }}>{regime.arrow}</span>{" "}
              <span style={{ fontWeight: 400, color: "#555" }}>{regime.subtitle}</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#E2E2E2", margin: "10px 0" }} />

            {/* Sectors */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {regime.sectors.map((sec) => (
                <div key={sec.name}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{sec.name}</div>
                  <div style={{ fontSize: 11, color: arrowColor(sec.direction) }}>
                    {arrowChar(sec.direction)} {sec.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E2E2E2" }} />

      {/* Footer */}
      <div style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "#888" }}>
          {regimes.length} active macro regimes · {totalSectorSignals} sector signals mapped
        </div>
        <div style={{ fontSize: 12, color: "#aaa" }}>
          Refreshed {refreshedTime} · {refreshedDate}
        </div>
      </div>
    </div>
  );
}
