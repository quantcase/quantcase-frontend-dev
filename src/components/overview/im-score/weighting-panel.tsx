"use client";

import { type PillarKey } from "./pillar-pills";

function WxSlider({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{label}</span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
            color: "rgba(255,255,255,0.9)", letterSpacing: 0,
          }}
        >
          {value}
          <span style={{ color: "rgba(200,180,255,0.6)", fontSize: 10.5, marginLeft: 1 }}>%</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 999 }}>
        <span
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${value}%`, background: "rgba(200,180,255,0.7)", borderRadius: 999,
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
            background: "rgba(255,255,255,0.95)",
            border: "2px solid rgba(139,92,246,0.7)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
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
  { key: "M", label: "Mgmt",  bg: "rgba(99,102,241,0.75)" },
  { key: "O", label: "Opp",   bg: "rgba(139,92,246,0.85)" },
  { key: "D", label: "Deal",  bg: "rgba(168,85,247,0.65)" },
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
        background: "linear-gradient(160deg, #2d1b5e 0%, #18103a 55%, #0e0920 100%)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 18,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* glow orbs */}
      <div
        style={{
          position: "absolute", top: -50, right: -30,
          width: 180, height: 180, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -40, left: -20,
          width: 120, height: 120, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,60,200,0.15) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
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
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.07)",
                color: "rgba(200,180,255,0.8)",
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
          margin: "2px 0 14px", fontSize: 17, fontWeight: 500, lineHeight: 1.4,
          letterSpacing: "-0.01em", color: "rgba(255,255,255,0.9)", paddingRight: 20,
        }}
      >
        Weights must total <span style={{ color: "rgba(200,180,255,1)", fontWeight: 600 }}>100%</span> — drag to rebalance.
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
              padding: "0 12px", minWidth: 0,
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, lineHeight: 1, color: "#fff" }}>
              {weights[key]}%
            </span>
            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 3, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16, flex: 1 }}>
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
          alignItems: "center", gap: 12,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.9)", lineHeight: 1, fontVariantNumeric: "tabular-nums",
            }}
          >
            100<span style={{ fontSize: 16, marginLeft: 1, color: "rgba(200,180,255,0.7)" }}>%</span>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6,
            }}
          >
            Allocated
          </div>
        </div>
        <button
          onClick={onReset}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.07)",
            color: "rgba(200,180,255,0.8)",
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
              color: "rgba(255,255,255,0.9)", lineHeight: 1, fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayScore != null ? displayScore : "—"}
            <span style={{ fontSize: 16, marginLeft: 1, color: "rgba(200,180,255,0.7)" }}>/100</span>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase",
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
