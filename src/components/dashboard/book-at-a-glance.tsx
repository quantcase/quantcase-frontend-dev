import { CommonCard, MonoLabel } from "@/components/ds";
import type { ReactNode } from "react";

const DELTA_COLOR: Record<string, string> = {
  up:    "var(--qc-up)",
  warn:  "var(--qc-warn)",
  muted: "var(--qc-ink-3)",
};

interface Cell {
  k: string;
  v: ReactNode;
  delta: string;
  deltaType: string;
  valueColor?: string;
}

const CELLS: Cell[] = [
  { k: "Total AUM",     v: <>₹796 <span style={{ fontSize: 14 }}>Cr</span></>,  delta: "+₹14 Cr · 7d",    deltaType: "up" },
  { k: "Clients",       v: "18",                                                  delta: "+1 this month",    deltaType: "muted" },
  { k: "Active alerts", v: "3",                                                   delta: "2 from yesterday", deltaType: "warn", valueColor: "var(--qc-down)" },
  { k: "Avg pulse",     v: <>71<span style={{ fontSize: 14, color: "var(--qc-ink-3)" }}>/100</span></>, delta: "+2 vs last wk", deltaType: "up" },
];

export function BookAtAGlance() {
  return (
    <CommonCard title="Book at a glance" style={{ marginBottom: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 18px" }}>
        {CELLS.map((cell, i) => (
          <div key={i}>
            <MonoLabel size={9.5} tracking="0.14em" color="var(--qc-ink-3)" style={{ display: "block", marginBottom: 6 }}>
              {cell.k}
            </MonoLabel>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.015em",
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
                color: cell.valueColor ?? "var(--qc-ink)",
              }}
            >
              {cell.v}
            </div>
            <MonoLabel size={11} tracking="0.04em" color={DELTA_COLOR[cell.deltaType]} style={{ display: "block", marginTop: 4 }}>
              {cell.delta}
            </MonoLabel>
          </div>
        ))}
      </div>
    </CommonCard>
  );
}
