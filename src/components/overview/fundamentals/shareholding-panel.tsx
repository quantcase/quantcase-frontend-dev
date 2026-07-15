"use client";

interface Segment {
  label: string;
  pct: number | null;
  color: string;
  qoq?: number | null;
}

interface ShareholdingPanelProps {
  segments: Segment[];
  quarter?: string | null;
}

export function ShareholdingPanel({ segments, quarter }: ShareholdingPanelProps) {
  const total = segments.reduce((s, seg) => s + (seg.pct ?? 0), 0);
  const hasData = total > 0;
  const visible = segments.filter((s) => s.pct != null && s.pct > 0);

  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 18px",
          borderBottom: "1px solid var(--qc-hair)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-9)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--qc-ink-2)",
          }}
        >
          Shareholding Pattern
        </span>
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-9)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--qc-ink-2)",
          }}
        >
          Latest Disclosure{quarter ? ` · ${quarter}` : ""}
        </span>
      </div>

      {/* Stacked bar */}
      <div style={{ display: "flex", height: 36, gap: 1, margin: "10px 18px", borderRadius: 6, overflow: "hidden" }}>
        {hasData ? (
          visible.map(({ label, pct: p, color }) => (
            <div
              key={label}
              style={{
                flex: p ?? 0,
                background: color,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              {(p ?? 0) >= 7 && (
                <span
                  style={{
                    fontFamily: "var(--qc-font-mono)",
                    fontSize: "var(--qc-fz-11)",
                    fontWeight: "var(--qc-w-medium)",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    letterSpacing: ".02em",
                  }}
                >
                  {p?.toFixed(1)}%
                </span>
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              flex: 1,
              background: "repeating-linear-gradient(45deg,var(--qc-chip),var(--qc-chip) 6px,var(--qc-hair) 6px,var(--qc-hair) 12px)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
            }}
          >
            <span style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>
              Awaiting disclosure
            </span>
          </div>
        )}
      </div>

      {/* Legend — flex items sized to match bar proportions */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid var(--qc-hair)",
          padding: "10px 18px",
        }}
      >
        {visible.map(({ label, pct: p, color }, i) => (
          <div
            key={label}
            style={{
              flex: p ?? 0,
              minWidth: 0,
              paddingLeft: i === 0 ? 0 : 12,
              paddingRight: i === visible.length - 1 ? 0 : 12,
              borderRight: i < visible.length - 1 ? "1px solid var(--qc-hair)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", letterSpacing: ".01em", fontFamily: "var(--qc-font-sans)" }}>
                {label}
              </span>
            </div>
            <span
              style={{
                fontSize: "var(--qc-fz-18)",
                fontWeight: "var(--qc-w-medium)",
                letterSpacing: "-0.02em",
                color: p != null ? "var(--qc-ink)" : "var(--qc-ink-2)",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                fontFamily: "var(--qc-font-mono)",
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
