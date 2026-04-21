"use client";

import { PILLAR_COLORS, type PillarKey } from "./pillar-pills";

interface TitledBullet {
  title: string;
  text: string;
  score?: number | null;
  max?: number;
}

interface FwxSubProps {
  item: TitledBullet;
  color: string;
  muted?: boolean;
}

function FwxSub({ item, color, muted }: FwxSubProps) {
  const pct = item.score != null && item.max ? Math.round((item.score / item.max) * 100) : 0;
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: muted ? "var(--qc-border-default)" : color,
          }}
        />
        <span
          style={{
            fontSize: 13, fontWeight: 500, flex: 1,
            color: muted ? "var(--qc-text-muted)" : "var(--qc-text-heading)",
          }}
        >
          {item.title}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
            color: muted ? "var(--qc-text-muted)" : "var(--qc-text-heading)",
            letterSpacing: "-0.01em",
          }}
        >
          {item.score != null ? item.score : "—"}
          <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>/{item.max ?? 5}</span>
        </span>
      </div>
      <div
        style={{
          height: 3, background: "var(--qc-chip-bg, #F2F1EC)",
          borderRadius: 999, overflow: "hidden", marginBottom: 6,
        }}
      >
        <span
          style={{
            display: "block", height: "100%", width: `${pct}%`,
            borderRadius: 999, background: muted ? "var(--qc-border-default)" : color,
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: "var(--qc-text-muted)", lineHeight: 1.45 }}>
        {item.text}
      </div>
    </div>
  );
}

interface ActivePillarHeroProps {
  activePillar: PillarKey;
  pillarLabel: string;
  pillarSub: string;
  score: number | null;
  max: number;
  weight: number;
  items: TitledBullet[];
}

export function ActivePillarHero({
  activePillar, pillarLabel, pillarSub, score, max, weight, items,
}: ActivePillarHeroProps) {
  const pct = score != null && max > 0 ? Math.round((score / max) * 100) : 0;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (circumference * pct) / 100;
  const color = PILLAR_COLORS[activePillar].dot;

  return (
    <>
      {/* Active pillar summary */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr auto auto",
          gap: 20, alignItems: "center",
          padding: "14px 4px 16px",
          borderTop: "1px solid var(--qc-border-inner)",
          borderBottom: "1px solid var(--qc-border-inner)",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              letterSpacing: "0.16em", color: "var(--qc-text-muted)",
              textTransform: "uppercase", marginBottom: 6,
            }}
          >
            Active pillar
          </div>
          <div
            style={{
              fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {pillarLabel}
            <span
              style={{
                display: "inline-grid", placeItems: "center",
                width: 22, height: 22, borderRadius: 6,
                background: color, color: "#fff",
                fontSize: 11, fontWeight: 600,
              }}
            >
              {activePillar}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--qc-text-muted)", marginTop: 6, lineHeight: 1.4 }}>
            {pillarSub}
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "0 10px" }}>
          <div
            style={{
              fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em",
              lineHeight: 1, fontVariantNumeric: "tabular-nums",
            }}
          >
            {score != null ? score : "—"}
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 14,
                color: "var(--qc-text-muted)", letterSpacing: 0, fontWeight: 400, marginLeft: 2,
              }}
            >
              /{max}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--qc-text-muted)", marginTop: 8,
            }}
          >
            {pct}% of max · {weight}% weight
          </div>
        </div>
        {/* Gauge ring */}
        <div style={{ position: "relative", width: 120, height: 120 }}>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="52" stroke="var(--qc-border-default)" strokeWidth="8" fill="none" />
            <circle
              cx="60" cy="60" r="52"
              stroke={color} strokeWidth="8" fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${dashOffset}`}
              transform="rotate(-90 60 60)"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute", inset: 0, display: "grid", placeItems: "center",
              fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em",
            }}
          >
            {pct}
            <span style={{ fontSize: 12, color: "var(--qc-text-muted)", fontWeight: 400, marginLeft: 1 }}>
              %
            </span>
          </div>
        </div>
      </div>

      {/* Sub-pillar breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
        {items.length > 0 ? (
          items.map((item, i) => (
            <FwxSub
              key={i}
              item={item}
              color={color}
              muted={item.score == null && item.text === ""}
            />
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--qc-text-muted)" }}>
            No analysis available.
          </div>
        )}
      </div>
    </>
  );
}
