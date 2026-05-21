"use client";

export interface MarketMetric {
  label: string;
  value: string;
  annotation: string;
  annotationPositive?: boolean;
}

interface MarketViewCardProps {
  score: number;
  sentiment: string;
  metrics: MarketMetric[];
  updatedTime: string;
}

export function MarketViewCard({ score, sentiment, metrics, updatedTime }: MarketViewCardProps) {
  // Gradient stops for fear-greed bar: red → yellow → green
  const markerPct = score; // 0–100

  return (
    <div
      style={{
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 260,
      }}
    >
      {/* Top meta */}
      <div style={{ padding: "14px 18px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
          LIVE · UPDATED {updatedTime}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172B", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
          MARKET VIEW
        </div>
      </div>

      {/* Gauge area */}
      <div style={{ padding: "0 18px 14px", borderBottom: "1px solid #E2E2E2" }}>
        {/* Score + badge */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 44, fontWeight: 400, lineHeight: 1, color: "#0F172B" }}>
            {score}
            <span style={{ fontSize: 20, color: "#888", fontWeight: 400 }}>/100</span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: "#dcfce7",
              color: "#15803d",
              borderRadius: 5,
              padding: "3px 9px",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            {sentiment}
          </span>
        </div>

        {/* Fear-Greed bar */}
        <div style={{ marginBottom: 6 }}>
          <div
            style={{
              position: "relative",
              height: 8,
              borderRadius: 99,
              background: "linear-gradient(to right, #ef4444, #f59e0b 40%, #22c55e 80%)",
              marginBottom: 4,
            }}
          >
            {/* Marker dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${markerPct}%`,
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#1a1a1a",
                border: "2px solid #fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa" }}>
            <span>FEAR</span>
            <span>NEUTRAL</span>
            <span>GREED</span>
          </div>
        </div>
      </div>

      {/* Metrics list */}
      <div style={{ padding: "10px 18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, color: "#555" }}>{m.label}</span>
            <span style={{ fontSize: 12, textAlign: "right" }}>
              <span style={{ color: m.annotationPositive === false ? "#ef4444" : m.annotationPositive ? "#22c55e" : "#888", marginRight: 4 }}>
                {m.value}
              </span>
              <span style={{ color: m.annotationPositive === false ? "#ef4444" : m.annotationPositive ? "#22c55e" : "#888", fontWeight: 500 }}>
                {m.annotation}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
