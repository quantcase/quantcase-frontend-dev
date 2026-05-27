"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SectionPanel } from "@/components/molecules/section-panel";
import type { PromoterActivity, MqiScore } from "@/types/management";

interface PromoterSectionProps {
  promoterActivity: PromoterActivity;
  mqiScore: MqiScore;
}

function scoreLevel(score: number, max: number): "up" | "warn" | "down" {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "up";
  if (pct >= 0.4) return "warn";
  return "down";
}

function scoreCssColor(score: number, max: number): string {
  const level = scoreLevel(score, max);
  if (level === "up") return "var(--qc-up)";
  if (level === "warn") return "var(--qc-warn)";
  return "var(--qc-down)";
}

function verdictStyle(verdict: string): { bg: string; text: string; border: string } {
  const v = verdict.toLowerCase();
  if (v === "strong" || v === "high") return { bg: "var(--qc-up-soft)", text: "var(--qc-up)", border: "var(--qc-up)" };
  if (v === "weak" || v === "low" || v === "poor") return { bg: "var(--qc-down-soft)", text: "var(--qc-down)", border: "var(--qc-down)" };
  return { bg: "var(--qc-warn-soft)", text: "var(--qc-warn)", border: "var(--qc-warn)" };
}

function formatChange(change: number | null): { text: string; color: string } {
  if (change === null || change === 0) return { text: "—", color: "var(--qc-ink-2)" };
  if (change > 0) return { text: `+${change}%`, color: "var(--qc-up)" };
  return { text: `${change}%`, color: "var(--qc-down)" };
}

function MqiDonut({ score, label }: { score: number; label: string }) {
  const radius = 48;
  const strokeWidth = 10;
  const size = 132;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = scoreCssColor(score, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--qc-ink-2)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        M-Score
      </span>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--qc-hair)" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text x={center} y={center - 5} textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--qc-ink)">
          {score}
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fontSize="11" fill="var(--qc-ink-2)">
          /100
        </text>
      </svg>

      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3 }}>
        {label} <span style={{ color: "var(--qc-ink-2)", fontWeight: 400 }}>| {score} / 100</span>
      </p>
    </div>
  );
}

function DimensionBars({ dimensions }: { dimensions: MqiScore["dimensions"] }) {
  const items = [
    { label: "Guidance Accuracy", score: dimensions.guidance_accuracy.score, max: dimensions.guidance_accuracy.max },
    { label: "Red Flags", score: dimensions.red_flags.score, max: dimensions.red_flags.max },
    { label: "Investment Thesis", score: dimensions.investment_thesis.score, max: dimensions.investment_thesis.max },
    { label: "Promoter Activity", score: dimensions.promoter_activity.score, max: dimensions.promoter_activity.max },
  ];

  return (
    <div className="flex flex-col justify-center gap-4 h-full">
      {items.map((item) => {
        const pct = item.max > 0 ? item.score / item.max : 0;
        const color = scoreCssColor(item.score, item.max);
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span style={{ fontSize: 12, color: "var(--qc-ink)", width: 140, flexShrink: 0 }}>
              {item.label}
            </span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--qc-section)", overflow: "hidden" }}>
              <div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 4, background: color }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", width: 36, textAlign: "right", flexShrink: 0 }}>
              {item.score}/{item.max}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PromoterSection({ promoterActivity, mqiScore }: PromoterSectionProps) {
  const { verdict, shareholding, promoter_note, verdict_rationale, mqi_rationale } = promoterActivity;
  const vStyle = verdictStyle(verdict);

  const headerAction = (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: vStyle.text,
        background: vStyle.bg,
        border: `1px solid ${vStyle.border}`,
        borderRadius: 4,
        padding: "3px 10px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {verdict}
    </div>
  );

  return (
    <SectionPanel title="Promoter Activity" headerAction={headerAction}>
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <Table className="table-fixed w-full">
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "34%" }} />
            </colgroup>
            <TableHeader>
              <TableRow style={{ borderColor: "var(--qc-hair)" }}>
                {["Quarter", "Promoter %", "Pledge %", "Change", "Signal"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: "var(--qc-ink-2)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {shareholding.map((row, i) => {
                const change = formatChange(row.change);
                return (
                  <TableRow key={i} style={{ borderColor: "var(--qc-hair-2)" }}>
                    <TableCell className="text-xs font-medium" style={{ color: "var(--qc-ink)" }}>
                      {row.quarter}
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: "var(--qc-ink)" }}>
                      {row.promoter_pct != null ? `${row.promoter_pct.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: "var(--qc-ink)" }}>
                      {row.pledge_pct != null ? `${row.pledge_pct.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium" style={{ color: change.color }}>
                      {change.text}
                    </TableCell>
                    <TableCell className="text-xs break-words whitespace-normal" style={{ color: "var(--qc-ink-2)" }}>
                      {row.signal}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div
          className="flex gap-6 items-center shrink-0"
          style={{ borderLeft: "1px solid var(--qc-hair)", paddingLeft: 24, minWidth: 380 }}
        >
          <MqiDonut score={mqiScore.total} label={mqiScore.label} />
          <div className="flex-1">
            <DimensionBars dimensions={mqiScore.dimensions} />
          </div>
        </div>
      </div>

      {(promoter_note || verdict_rationale || mqi_rationale) && (
        <div className="flex flex-col gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--qc-hair)" }}>
          {promoter_note && (
            <p style={{ fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600 }}>Promoter note: </span>
              {promoter_note}
            </p>
          )}
          {verdict_rationale && (
            <p style={{ fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600 }}>Verdict rationale: </span>
              {verdict_rationale}
            </p>
          )}
          {mqi_rationale && (
            <p style={{ fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600 }}>M-Score impact: </span>
              {mqi_rationale}
            </p>
          )}
        </div>
      )}
    </SectionPanel>
  );
}
