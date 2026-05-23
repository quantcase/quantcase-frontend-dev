"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

interface DimCard {
  abbr: string;
  label: string;
  description: string;
  status: string;
  statusColor: string;
  statusBg: string;
  signals: { text: string; positive: boolean }[];
}

function buildDimCards(topSignals: TopSignal[], km: Record<string, string>): DimCard[] {
  const proactiveSignals = topSignals.filter((s) => s.metric === "proactive_disclosure");
  const claritySignals = topSignals.filter((s) => s.metric === "capital_allocation_clarity");
  const transparentSignals = topSignals.filter((s) => s.metric === "transparent");

  const govImpact = km["governance_impact_distribution"] ?? "";
  const hasHighImpact = govImpact.includes("high (1)");

  return [
    {
      abbr: "PD",
      label: "Proactive Disclosure",
      description: "Voluntary surfacing of material headwinds before analyst questioning",
      status: proactiveSignals.length >= 2 ? "PROACTIVE" : "REACTIVE",
      statusColor: proactiveSignals.length >= 2 ? "var(--qc-up)" : "var(--qc-warn)",
      statusBg: proactiveSignals.length >= 2 ? "rgba(31,122,74,0.10)" : "rgba(180,115,26,0.10)",
      signals: proactiveSignals.map((s) => ({ text: s.label, positive: (s.actual_value ?? 0) > 0 })),
    },
    {
      abbr: "CA",
      label: "Capital Allocation Clarity",
      description: "Quantitative specificity on capex, margins, and deployment timelines",
      status: claritySignals.some((s) => s.label.toLowerCase().includes("decline")) ? "OPAQUE" : "PARTIAL",
      statusColor: claritySignals.some((s) => s.label.toLowerCase().includes("decline")) ? "var(--qc-down)" : "var(--qc-warn)",
      statusBg: claritySignals.some((s) => s.label.toLowerCase().includes("decline")) ? "rgba(220,38,38,0.10)" : "rgba(180,115,26,0.10)",
      signals: claritySignals.map((s) => ({ text: s.label, positive: !s.label.toLowerCase().includes("decline") })),
    },
    {
      abbr: "TR",
      label: "Transparency Depth",
      description: "Quantitative vs vague qualitative language in management commentary",
      status: transparentSignals.length > 0 ? "PROCEDURAL" : "WEAK",
      statusColor: transparentSignals.length > 0 ? "var(--qc-warn)" : "var(--qc-down)",
      statusBg: transparentSignals.length > 0 ? "rgba(180,115,26,0.10)" : "rgba(220,38,38,0.10)",
      signals: transparentSignals.map((s) => ({ text: s.label, positive: true })),
    },
    {
      abbr: "GV",
      label: "Governance Signals",
      description: "Audit quality, regulatory compliance, and structural disclosure controls",
      status: hasHighImpact ? "CLEAN" : "REACTIVE",
      statusColor: hasHighImpact ? "var(--qc-up)" : "var(--qc-warn)",
      statusBg: hasHighImpact ? "rgba(31,122,74,0.10)" : "rgba(180,115,26,0.10)",
      signals: [
        { text: govImpact ? `Governance impact: ${govImpact}` : "High impact: 1, Medium: 3, Low: 1", positive: hasHighImpact },
        { text: "Formal transcript protocol observed — Q1 FY2026", positive: true },
      ],
    },
  ];
}

export function LensDetailDisclosure({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const km = lens.key_metrics;
  const dominantMetric = km["dominant_metric"] ?? "capital_allocation_clarity & proactive_disclosure";
  const zScore = km["z_score"] ?? "3.00";
  const signalCount = km["signal_count"] ?? "5 unique signals, 11 total observations";

  const dims = buildDimCards(topSignals, km);

  const statusColor =
    lens.status.toUpperCase() === "STRONG"
      ? "var(--qc-up)"
      : lens.status.toUpperCase() === "WEAK"
        ? "var(--qc-down)"
        : "var(--qc-warn)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header strip */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            DISCLOSURE HONESTY
          </span>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
            color: "var(--qc-ink-3)", background: "var(--qc-section)",
            border: "1px solid var(--qc-hair)", borderRadius: 4, padding: "2px 7px",
          }}>
            Q3 FY26
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: statusColor, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            {lens.status.charAt(0).toUpperCase() + lens.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Summary subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0 }}>
            Dominant signals: {dominantMetric} — procedural compliance with limited strategic transparency
          </p>
        </div>

        {/* 3-column KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Z-SCORE", value: parseFloat(zScore).toFixed(1), sub: "Governance signal aggregate", color: statusColor },
            { label: "TOTAL SIGNALS", value: signalCount.split(" ")[0], sub: signalCount.replace(/^\S+ /, ""), color: "var(--qc-ink)" },
            { label: "DOMINANT METRIC", value: "Dual", sub: dominantMetric.replace(/_/g, " "), color: "var(--qc-warn)" },
          ].map((tile, i, arr) => (
            <div key={i} style={{
              padding: "14px 14px", background: "var(--qc-card)",
              borderRight: i < arr.length - 1 ? "1px solid var(--qc-hair)" : undefined,
              borderTop: "1px solid var(--qc-hair)",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
                {tile.label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, color: tile.color, margin: "2px 0", lineHeight: 1 }}>
                {tile.value}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.35 }}>
                {tile.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Blockquote */}
      <div style={{ borderLeft: "3px solid var(--qc-ink)", paddingLeft: 16, paddingTop: 4, paddingBottom: 4, margin: "0 2px" }}>
        <p style={{
          fontSize: 13, fontStyle: "italic", color: "var(--qc-ink)", margin: "0 0 6px",
          lineHeight: 1.65, fontFamily: "var(--qc-font-serif, Georgia, serif)",
        }}>
          Management scores on process but fails on substance — disclosure infrastructure is present, yet forward-looking commitments on margins and capital allocation remain conspicuously absent.
        </p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
          Quantcase governance analysis · Q3 FY26
        </p>
      </div>

      {/* Dimension score chart */}
      {(() => {
        const dimScores = [
          { name: "Proactive\nDisclosure", score: dims[0].status === "PROACTIVE" ? 7 : 4, color: dims[0].statusColor },
          { name: "Capital\nClarity", score: dims[1].status === "OPAQUE" ? 2 : dims[1].status === "PARTIAL" ? 4 : 7, color: dims[1].statusColor },
          { name: "Transparency\nDepth", score: dims[2].status === "WEAK" ? 2 : dims[2].status === "PROCEDURAL" ? 4 : 7, color: dims[2].statusColor },
          { name: "Governance\nSignals", score: dims[3].status === "CLEAN" ? 7 : 4, color: dims[3].statusColor },
        ];
        return (
          <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
            <div style={{
              padding: "10px 16px", background: "var(--qc-section)",
              borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
                DISCLOSURE DIMENSION SCORES · /10
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                {[["var(--qc-up)", "Strong ≥7"], ["var(--qc-warn)", "Partial 4–6"], ["var(--qc-down)", "Weak ≤3"]].map(([c, label]) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--qc-ink-3)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: c, display: "inline-block" }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: "16px 8px 8px", background: "var(--qc-card)" }}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  data={dimScores}
                  layout="vertical"
                  margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid horizontal={false} stroke="#E9E7E1" strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 9, fill: "#9A9A92" }} axisLine={false} tickLine={false} ticks={[0, 2, 4, 6, 8, 10]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9A9A92" }} axisLine={false} tickLine={false} width={76} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    contentStyle={{ fontSize: 11, border: "1px solid #E9E7E1", borderRadius: 6, background: "#fff" }}
                    formatter={(v: number) => [`${v}/10`, "Score"]}
                  />
                  <Bar dataKey="score" radius={[0, 3, 3, 0]}>
                    {dimScores.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                    <LabelList dataKey="score" position="right" formatter={(v: number) => `${v}/10`} style={{ fontSize: 10, fontWeight: 600, fill: "#5A5A54" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      {/* 2×2 dimension cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {dims.map((dim, i) => (
          <div key={i} style={{
            padding: "14px 14px",
            background: "var(--qc-card)",
            border: `1px solid ${dim.statusColor}30`,
            borderLeft: `3px solid ${dim.statusColor}`,
            borderRadius: 8,
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "var(--qc-ink-3)", letterSpacing: "0.04em",
                }}>
                  {dim.abbr}
                </span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.2 }}>{dim.label}</p>
                  <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.3 }}>{dim.description}</p>
                </div>
              </div>
              <span style={{
                flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                color: dim.statusColor, background: dim.statusBg,
                borderRadius: 4, padding: "3px 7px", textTransform: "uppercase", whiteSpace: "nowrap",
              }}>
                {dim.status}
              </span>
            </div>
            {dim.signals.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 }}>
                {dim.signals.map((sig, j) => (
                  <div key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, marginTop: 4, width: 5, height: 5, borderRadius: "50%", background: sig.positive ? "var(--qc-up)" : "var(--qc-down)" }} />
                    <p style={{ fontSize: 10, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.4 }}>{sig.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Procedural disclosure with limited strategic transparency."
        body={lens.takeaway}
        metrics={[
          { label: "Z-Score", value: parseFloat(zScore).toFixed(1), sub: "Governance signal aggregate" },
          { label: "Dominant Signal", value: "Dual", sub: dominantMetric.replace(/_/g, " ").slice(0, 28) },
          { label: "Disclosure Rhythm", value: "Q1–Q3", sub: "FY26 consistent coverage" },
        ]}
      />
    </div>
  );
}
