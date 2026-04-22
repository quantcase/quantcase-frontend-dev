"use client";

interface Segment {
  label: string;
  pct: number | null;
  color: string;
}

interface ShareholdingPanelProps {
  segments: Segment[];
}

export function ShareholdingPanel({ segments }: ShareholdingPanelProps) {
  const total = segments.reduce((s, seg) => s + (seg.pct ?? 0), 0);
  const hasData = total > 0;

  return (
    <div
      style={{
        background: "var(--qc-surface-white)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Shareholding</h4>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5, color: "var(--qc-text-muted)",
            letterSpacing: ".06em", textTransform: "uppercase",
          }}
        >
          Latest disclosure
        </span>
      </div>

      {/* Stacked bar */}
      <div
        style={{
          display: "flex", height: 28, borderRadius: 8,
          overflow: "hidden", gap: 2, marginBottom: 10,
        }}
      >
        {hasData ? (
          segments
            .filter((s) => s.pct != null && s.pct > 0)
            .map(({ label, pct: p, color }) => (
              <div
                key={label}
                style={{
                  flex: p ?? 0,
                  display: "flex", alignItems: "center", justifyContent: "flex-start",
                  padding: "0 10px", color: "#fff",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11, fontWeight: 500,
                  overflow: "hidden", whiteSpace: "nowrap",
                  background: color, minWidth: 0,
                }}
              >
                {(p ?? 0) > 10 ? `${p?.toFixed(1)}%` : ""}
              </div>
            ))
        ) : (
          <div
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start",
              padding: "0 10px", color: "var(--qc-text-muted)",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
              background: "repeating-linear-gradient(45deg,#F2F1EC,#F2F1EC 6px,#EAE9E2 6px,#EAE9E2 12px)",
            }}
          >
            Awaiting disclosure
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {segments.map(({ label, pct: p, color }) => (
          <div
            key={label}
            style={{
              display: "flex", flexDirection: "column", gap: 2,
              paddingLeft: 10, borderLeft: `2px solid ${color}`,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--qc-text-muted)", letterSpacing: ".02em" }}>
              {label}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: p != null ? 500 : 400,
                color: p != null ? "var(--qc-text-heading)" : "var(--qc-text-muted)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.005em",
              }}
            >
              {p != null ? `${p.toFixed(1)}%` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
