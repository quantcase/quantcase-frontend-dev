"use client";

import { PILLAR_COLORS, type PillarKey } from "./pillar-pills";

function WxSlider({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--qc-text-heading)" }}>{label}</span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
            color: "var(--qc-text-heading)", letterSpacing: 0,
          }}
        >
          {value}
          <span style={{ color: "#4A5F20", fontSize: 10.5, marginLeft: 1 }}>%</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 4, background: "rgba(14,14,12,0.14)", borderRadius: 999 }}>
        <span
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${value}%`, background: "#0E0E0C", borderRadius: 999,
          }}
        />
        <input
          type="range"
          min={5} max={90}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%",
            opacity: 0, cursor: "pointer", height: "100%", margin: 0,
          }}
        />
        <span
          style={{
            position: "absolute", top: "50%", transform: `translate(-50%, -50%)`,
            left: `${value}%`,
            width: 14, height: 14, borderRadius: "50%",
            background: "var(--qc-surface-white)",
            border: "2px solid #0E0E0C",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

interface WeightingPanelProps {
  mWeight: number;
  oWeight: number;
  dWeight: number;
  displayScore: number | null;
  onMChange: (v: number) => void;
  onOChange: (v: number) => void;
  onDChange: (v: number) => void;
  onReset?: () => void;
}

const SEGMENTS: { key: PillarKey; label: string; bg: string }[] = [
  { key: "M", label: "Mgmt", bg: "#0E0E0C" },
  { key: "O", label: "Opp", bg: "#1E3A2B" },
  { key: "D", label: "Deal", bg: "#7A5A12" },
];

export function WeightingPanel({
  mWeight, oWeight, dWeight, displayScore,
  onMChange, onOChange, onDChange, onReset,
}: WeightingPanelProps) {
  const weights = { M: mWeight, O: oWeight, D: dWeight };
  const handlers = { M: onMChange, O: onOChange, D: onDChange };
  const labels = { M: "Management", O: "Opportunity", D: "Deal" };

  return (
    <aside
      style={{
        background: "linear-gradient(175deg, #E8F3BD 0%, #D6E996 100%)",
        border: "1px solid #C6DC8A",
        borderRadius: 18,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: "0.16em", color: "#4A5F20", textTransform: "uppercase",
          }}
        >
          Adjust Weightings
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { path: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5", onClick: onReset },
            { path: "M5 12l5 5L20 7", onClick: undefined },
          ].map(({ path, onClick }, i) => (
            <button
              key={i}
              onClick={onClick}
              style={{
                width: 24, height: 24, borderRadius: "50%",
                border: "1px solid rgba(14,14,12,0.12)",
                background: "rgba(255,255,255,0.35)",
                color: "#0E0E0C",
                display: "grid", placeItems: "center", cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={path} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <h3
        style={{
          margin: "2px 0 8px", fontSize: 18, fontWeight: 500, lineHeight: 1.35,
          letterSpacing: "-0.01em", color: "#0E0E0C", paddingRight: 20,
        }}
      >
        Weights must total <b style={{ fontWeight: 600 }}>100%</b> — drag to rebalance.
      </h3>

      {/* Stacked weight bar */}
      <div style={{ display: "flex", height: 44, borderRadius: 10, overflow: "hidden", gap: 2, marginBottom: 16 }}>
        {SEGMENTS.map(({ key, label, bg }) => (
          <div
            key={key}
            style={{
              flex: weights[key], background: bg,
              display: "flex", flexDirection: "column",
              alignItems: "flex-start", justifyContent: "center",
              padding: "0 12px", color: "#fff", minWidth: 0,
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, lineHeight: 1 }}>
              {weights[key]}%
            </span>
            <span style={{ fontSize: 10.5, opacity: 0.75, marginTop: 3, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14, flex: 1 }}>
        {(["M", "O", "D"] as PillarKey[]).map((key) => (
          <WxSlider
            key={key}
            label={labels[key]}
            value={weights[key]}
            onChange={handlers[key]}
          />
        ))}
      </div>

      {/* Footer: allocated / resulting QC */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center", gap: 12, marginTop: 6,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em",
              color: "#0E0E0C", lineHeight: 1, fontVariantNumeric: "tabular-nums",
            }}
          >
            100<span style={{ fontSize: 16, marginLeft: 1 }}>%</span>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: "#4A5F20", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6,
            }}
          >
            Allocated
          </div>
        </div>
        <button
          onClick={onReset}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            border: "1px solid rgba(14,14,12,0.12)",
            background: "rgba(255,255,255,0.5)",
            color: "#0E0E0C",
            display: "grid", placeItems: "center", cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em",
              color: "#0E0E0C", lineHeight: 1, fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayScore != null ? displayScore : "—"}
            <span style={{ fontSize: 16, marginLeft: 1 }}>/100</span>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: "#4A5F20", letterSpacing: "0.08em", textTransform: "uppercase",
              marginTop: 6, textAlign: "right",
            }}
          >
            Resulting QC
          </div>
        </div>
      </div>
    </aside>
  );
}
