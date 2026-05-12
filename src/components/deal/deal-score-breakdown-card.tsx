"use client";

import { CommonCard } from "@/components/ds";
import type { OverviewSection } from "@/types/deal";

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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--qc-hair)" strokeWidth={strokeW} />
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
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={8} fontWeight={600} fill="var(--qc-ink-2)" letterSpacing="0.12em">DEAL</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={30} fontWeight={600} fill="var(--qc-ink)" fontFamily="inherit">{Math.round(score)}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize={10} fill="var(--qc-ink-3)">/ {maxScore}</text>
    </svg>
  );
}

interface DealScoreBreakdownCardProps {
  overview: OverviewSection;
}

export function DealScoreBreakdownCard({ overview }: DealScoreBreakdownCardProps) {
  const score = overview.deal_factor_score;
  const verdict = overview.deal_verdict;
  const level = score?.level ?? "MODERATE";
  const color = levelColor(level);
  const bg = levelBg(level);

  const subScores = [
    { label: "EPS Engine", value: score?.eps_engine ?? 0, max: 50 },
    { label: "Valuation Re-Rating", value: score?.valuation_rerating ?? 0, max: 50 },
  ];

  return (
    <CommonCard title="Deal Factor Score" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0 }}>
          <ArcGauge score={score?.overall ?? 0} maxScore={100} color={color} />
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
            {level} Conviction
          </span>
          {verdict?.title && (
            <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1.45, letterSpacing: "-0.01em" }}>
              {verdict.title}
            </p>
          )}
          {verdict?.description && (
            <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
              {verdict.description}
            </p>
          )}
        </div>
      </div>

      {/* Sub-scores */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderTop: "1px solid var(--qc-hair)",
        marginTop: 20,
      }}>
        {subScores.map((item, idx) => {
          const pct = item.max > 0 ? (item.value / item.max) * 100 : 0;
          const isLast = idx === subScores.length - 1;
          return (
            <div key={item.label} style={{
              padding: "14px 14px 10px",
              borderRight: !isLast ? "1px solid var(--qc-hair)" : "none",
            }}>
              <p style={{ margin: "0 0 8px", fontSize: 9, fontWeight: 500, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {item.label}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 500, color: "var(--qc-ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {item.value}
                </span>
                <span style={{ fontSize: 12, color: "var(--qc-ink-3)" }}>/{item.max}</span>
              </div>
              <div style={{ height: 3, borderRadius: 999, background: "var(--qc-hair)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }} />
              </div>
            </div>
          );
        })}
      </div>
    </CommonCard>
  );
}
