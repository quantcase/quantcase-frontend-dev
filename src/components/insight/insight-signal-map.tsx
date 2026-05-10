"use client";

import type { InsightSignalMapItem } from "@/types/analysis";
import { MonoLabel } from "@/components/ds";

interface InsightSignalMapProps {
  signals: InsightSignalMapItem[];
  heading?: string;
}

function tileStyle(sentiment: string): React.CSSProperties {
  if (sentiment === "positive") {
    return {
      background: "#F0FAF4",
      border: "1px solid #C3E8D0",
    };
  }
  if (sentiment === "negative") {
    return {
      background: "#FEF2F0",
      border: "1px solid #F5C9C3",
    };
  }
  return {
    background: "#FDF8EE",
    border: "1px solid #EDE4C8",
  };
}

function signalTextColor(sentiment: string): string {
  if (sentiment === "positive") return "#1A6640";
  if (sentiment === "negative") return "#B83A2E";
  return "#7A5C1E";
}

function categoryColor(sentiment: string): string {
  if (sentiment === "positive") return "#3A8A5C";
  if (sentiment === "negative") return "#B83A2E";
  return "#9A7A3A";
}

export function InsightSignalMap({ signals, heading }: InsightSignalMapProps) {
  if (!signals.length) return null;

  return (
    <div>
      {heading && (
        <h3 style={{ fontSize: 28, fontWeight: 400, color: "var(--qc-ink)", margin: "0 0 16px", fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>
          {heading}
        </h3>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {signals.map((s, i) => {
          const cat = s.category ?? s.label;
          const tile = tileStyle(s.sentiment);
          const signalColor = signalTextColor(s.sentiment);
          const catColor = categoryColor(s.sentiment);

          return (
            <div
              key={i}
              style={{
                ...tile,
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              {cat && (
                <MonoLabel size={8} tracking="0.10em" color={catColor} style={{ marginBottom: 4 }}>
                  {cat.toUpperCase()}
                </MonoLabel>
              )}
              <p style={{
                fontSize: 11,
                fontWeight: 500,
                color: signalColor,
                lineHeight: 1.4,
                margin: 0,
              }}>
                {s.signal}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
