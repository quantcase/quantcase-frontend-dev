"use client";

import { CommonCard } from "@/components/ds";
import type { MqiScore, IntelligenceSignalItem } from "@/types/management";

function levelColor(level: string): string {
  const u = level.toUpperCase();
  if (u === "HIGH") return "var(--qc-up)";
  if (u === "LOW") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function levelBg(level: string): string {
  const u = level.toUpperCase();
  if (u === "HIGH") return "var(--qc-up-soft)";
  if (u === "LOW") return "var(--qc-down-soft)";
  return "var(--qc-warn-soft)";
}

function sentimentColor(s: IntelligenceSignalItem["sentiment"]): string {
  if (s === "positive") return "var(--qc-up)";
  if (s === "negative") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function ratingLabel(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "Strong";
  if (pct >= 0.4) return "Mixed";
  return "Reactive";
}

function ArcGauge({ score, maxScore, color }: { score: number; maxScore: number; color: string }) {
  const size = 128;
  const strokeW = 9;
  const r = (size - strokeW) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = maxScore > 0 ? Math.min(1, score / maxScore) : 0;
  const filledDash = circumference * pct;

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {/* Track: full circle */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--qc-hair)"
        strokeWidth={strokeW}
      />
      {/* Filled arc: starts from top (−90°), drawn clockwise */}
      {pct > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeDasharray={`${filledDash} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Label: "MQI" */}
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={8} fontWeight={600} fill="var(--qc-ink-2)" letterSpacing="0.12em">MQI</text>
      {/* Score */}
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={30} fontWeight={600} fill="var(--qc-ink)" fontFamily="inherit">{score}</text>
      {/* Max */}
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize={10} fill="var(--qc-ink-3)">/ {maxScore}</text>
    </svg>
  );
}

interface ScoreBreakdownCardProps {
  mqiScore: MqiScore;
  signals: IntelligenceSignalItem[];
  action?: string;
  rationale?: string;
}

export function ScoreBreakdownCard({ mqiScore, signals, action, rationale }: ScoreBreakdownCardProps) {
  const band = mqiScore.label;
  const color = levelColor(band);
  const bg = levelBg(band);
  const visibleSignals = signals.filter((s) => s.max_score > 0);

  return (
    <CommonCard title="MQI Score" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flex: 1 }}>
        <div style={{ flexShrink: 0 }}>
          <ArcGauge score={mqiScore.total} maxScore={100} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <span style={{
            display: "inline-block",
            fontSize: 10, fontWeight: 700,
            color, background: bg,
            border: `1px solid ${color}`,
            borderRadius: 4, padding: "2px 8px",
            textTransform: "uppercase", letterSpacing: "0.06em",
            marginBottom: 10,
          }}>
            {band} · Discount Warranted
          </span>
          <p style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1.45, letterSpacing: "-0.01em" }}>
            {action}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
            {rationale}
          </p>
        </div>
      </div>

      {visibleSignals.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(visibleSignals.length, 3)}, 1fr)`,
          borderTop: "1px solid var(--qc-hair)",
          marginTop: 20,
        }}>
          {visibleSignals.map((item, idx) => {
            const sc = sentimentColor(item.sentiment);
            const rowPct = item.max_score > 0 ? (item.score / item.max_score) * 100 : 0;
            const dimLabel = item.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const rating = ratingLabel(item.score, item.max_score);
            const isLast = idx === visibleSignals.length - 1;
            return (
              <div key={item.key} style={{
                padding: "14px 14px 10px",
                borderRight: !isLast ? "1px solid var(--qc-hair)" : "none",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 9, fontWeight: 500, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {dimLabel}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 500, color: "var(--qc-ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {item.score}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--qc-ink-3)" }}>/{item.max_score}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: sc, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {rating}
                  </span>
                </div>
                <div style={{ height: 3, borderRadius: 999, background: "var(--qc-hair)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${rowPct}%`, background: sc, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CommonCard>
  );
}
