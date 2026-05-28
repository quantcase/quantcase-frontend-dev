"use client";

import { CommonCard } from "@/components/ds";
import type { FinalTakeaways } from "@/types/opportunity";

interface OpportunityScoreBreakdownCardProps {
  overallScore: number;
  overallMax: number;
  overallStatus: string;
  sectionScores: Partial<FinalTakeaways["section_scores"]>;
  investmentThesis?: string;
  title?: string;
  subtitle?: string;
}

const SECTION_MAX: Record<string, number> = {
  industry: 25,
  competition: 10,
  financial_strength: 10,
  customer_traction: 10,
};

const SECTION_LABELS: Record<string, string> = {
  industry: "Industry",
  competition: "Competition",
  financial_strength: "Financial Strength",
  customer_traction: "Customer Traction",
};

function levelColor(status: string): string {
  const u = status.toUpperCase();
  if (u.includes("STRONG") || u.includes("HIGH") || u.includes("GOOD") || u === "POSITIVE") return "var(--qc-up)";
  if (u.includes("WEAK") || u.includes("LOW") || u.includes("POOR") || u === "NEGATIVE") return "var(--qc-down)";
  return "var(--qc-warn)";
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
      <text x={cx} y={cy - 14} textAnchor="middle" style={{ fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)" }} fill="var(--qc-ink-2)" letterSpacing="0.12em">OFI</text>
      <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: "var(--qc-fz-30)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-mono)" }} fill="var(--qc-ink)">{score}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)" }} fill="var(--qc-ink-3)">/ {maxScore}</text>
    </svg>
  );
}

export function OpportunityScoreBreakdownCard({
  overallScore,
  overallMax,
  overallStatus,
  sectionScores,
  title,
  subtitle,
}: OpportunityScoreBreakdownCardProps) {
  const color = levelColor(overallStatus);

  const sections = Object.entries(SECTION_LABELS)
    .map(([key, label]) => {
      const ss = sectionScores[key as keyof FinalTakeaways["section_scores"]];
      const max = SECTION_MAX[key];
      const score = ss?.score ?? 0;
      const pct = max > 0 ? score / max : 0;
      const sc = ss ? levelColor(ss.status) : "var(--qc-warn)";
      return { key, label, score, max, pct, status: ss?.status ?? "", takeaway: ss?.takeaway ?? "", sc };
    })
    .filter(s => s.max > 0);

  return (
    <CommonCard title="Opportunity Score" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flex: 1 }}>
        <div style={{ flexShrink: 0 }}>
          <ArcGauge score={overallScore} maxScore={overallMax} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <span style={{
            display: "inline-block",
            fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-bold)", fontFamily: "var(--qc-font-sans)",
            color, background: color === "var(--qc-up)" ? "var(--qc-up-soft)" : color === "var(--qc-down)" ? "var(--qc-down-soft)" : "var(--qc-warn-soft)",
            border: `1px solid ${color}`,
            borderRadius: 4, padding: "2px 8px",
            textTransform: "uppercase", letterSpacing: "0.06em",
            marginBottom: 10,
          }}>
            {overallStatus}
          </span>
          <p style={{ margin: "0 0 8px", fontSize: "var(--qc-fz-18)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.45, letterSpacing: "var(--qc-track-display)" }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>
      </div>

      {sections.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(sections.length, 4)}, 1fr)`,
          borderTop: "1px solid var(--qc-hair)",
          marginTop: 20,
        }}>
          {sections.map((item, idx) => {
            const isLast = idx === sections.length - 1;
            return (
              <div key={item.key} style={{
                padding: "14px 14px 10px",
                borderRight: !isLast ? "1px solid var(--qc-hair)" : "none",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {item.label}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {item.score}
                  </span>
                  <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-3)" }}>/{item.max}</span>
                  <span style={{ marginLeft: "auto", fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: item.sc, textTransform: "uppercase", letterSpacing: "var(--qc-track-pill)" }}>
                    {item.status.split(" ")[0]}
                  </span>
                </div>
                <div style={{ height: 3, borderRadius: 999, background: "var(--qc-hair)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.pct * 100}%`, background: item.sc, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CommonCard>
  );
}
