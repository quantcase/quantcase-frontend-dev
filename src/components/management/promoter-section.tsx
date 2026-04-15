"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SectionPanel } from "@/components/molecules/section-panel";
import type { PromoterActivity, MqiScore } from "@/types/management";

interface PromoterSectionProps {
  promoterActivity: PromoterActivity;
  mqiScore: MqiScore;
}

function scoreColor(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "#16a34a";
  if (pct >= 0.4) return "#d97706";
  return "#dc2626";
}

function verdictColor(verdict: string): { bg: string; text: string; border: string } {
  const v = verdict.toLowerCase();
  if (v === "strong" || v === "high") return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
  if (v === "weak" || v === "low" || v === "poor") return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
  return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
}

function formatChange(change: number | null): { text: string; color: string } {
  if (change === null || change === 0) return { text: "—", color: "#888888" };
  if (change > 0) return { text: `+${change}%`, color: "#16a34a" };
  return { text: `${change}%`, color: "#dc2626" };
}

function MqiDonut({ score, label }: { score: number; label: string }) {
  const radius = 48;
  const strokeWidth = 10;
  const size = 132;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = scoreColor(score, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#888888",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        MQI Score
      </span>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#E2E2E2" strokeWidth={strokeWidth} />
        {/* Progress */}
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
        {/* Score */}
        <text x={center} y={center - 5} textAnchor="middle" fontSize="26" fontWeight="700" fill="#0F172B">
          {score}
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fontSize="11" fill="#888888">
          /100
        </text>
      </svg>

      {/* Label line */}
      <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172B", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3 }}>
        {label} <span style={{ color: "#888888", fontWeight: 400 }}>| {score} / 100</span>
      </p>
    </div>
  );
}

function DimensionBars({ dimensions }: { dimensions: MqiScore["dimensions"] }) {
  const items = [
    { label: "Guidance Credibility", score: dimensions.guidance_credibility.score, max: dimensions.guidance_credibility.max },
    { label: "Capital Allocation", score: dimensions.capital_allocation.score, max: dimensions.capital_allocation.max },
    { label: "Disclosure Honesty", score: dimensions.disclosure_honesty.score, max: dimensions.disclosure_honesty.max },
  ];

  return (
    <div className="flex flex-col justify-center gap-4 h-full">
      {items.map((item) => {
        const pct = item.max > 0 ? item.score / item.max : 0;
        const color = scoreColor(item.score, item.max);
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span
              style={{ fontSize: 12, color: "#0F172B", width: 140, flexShrink: 0 }}
            >
              {item.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: "#F5F5F5",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct * 100}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: color,
                }}
              />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172B", width: 36, textAlign: "right", flexShrink: 0 }}>
              {item.score}/{item.max}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PromoterSection({ promoterActivity, mqiScore }: PromoterSectionProps) {
  const { verdict, shareholding, promoter_note, verdict_rationale } = promoterActivity;
  const vColor = verdictColor(verdict);

  const headerAction = (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: vColor.text,
        background: vColor.bg,
        border: `1px solid ${vColor.border}`,
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
      {/* Top: table + score card */}
      <div className="flex gap-6 items-start">
        {/* Promoter shareholding table */}
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
              <TableRow className="border-zinc-200">
                {["Quarter", "Promoter %", "Pledge %", "Change", "Signal"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-[10px] font-medium uppercase tracking-wider text-zinc-500"
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
                  <TableRow key={i} className="border-zinc-100">
                    <TableCell className="text-xs text-zinc-700 font-medium">
                      {row.quarter}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-700">
                      {row.promoter_pct != null ? `${row.promoter_pct.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-700">
                      {row.pledge_pct != null ? `${row.pledge_pct.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium" style={{ color: change.color }}>
                      {change.text}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 break-words whitespace-normal">
                      {row.signal}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Right: donut + dimension bars */}
        <div
          className="flex gap-6 items-center shrink-0"
          style={{
            borderLeft: "1px solid #E2E2E2",
            paddingLeft: 24,
            minWidth: 380,
          }}
        >
          <MqiDonut score={mqiScore.total} label={mqiScore.label} />
          <div className="flex-1">
            <DimensionBars dimensions={mqiScore.dimensions} />
          </div>
        </div>
      </div>

      {/* Bottom: notes */}
      {(promoter_note || verdict_rationale) && (
        <div
          className="flex flex-col gap-2 mt-4 pt-4"
          style={{ borderTop: "1px solid #E2E2E2" }}
        >
          {promoter_note && (
            <p style={{ fontSize: 12, color: "#121212", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600 }}>Promoter note: </span>
              {promoter_note}
            </p>
          )}
          {verdict_rationale && (
            <p style={{ fontSize: 12, color: "#121212", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600 }}>MQI rationale: </span>
              {verdict_rationale}
            </p>
          )}
        </div>
      )}
    </SectionPanel>
  );
}
