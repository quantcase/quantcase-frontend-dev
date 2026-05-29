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
  score: number;
  signals: { text: string; positive: boolean }[];
}

function getKm(km: Record<string, string>, ...fragments: string[]): string | null {
  const key = Object.keys(km).find((k) =>
    fragments.every((f) => k.toLowerCase().includes(f.toLowerCase()))
  );
  return key ? km[key] : null;
}

function quarterFromDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const m = d.getMonth();
  const q = m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4;
  const fy = m < 3 ? d.getFullYear() : d.getFullYear() + 1;
  return `Q${q} FY${String(fy).slice(2)}`;
}

function buildDimCards(topSignals: TopSignal[], km: Record<string, string>): DimCard[] {
  const proactiveSignals = topSignals.filter((s) => s.metric === "proactive_disclosure");
  const claritySignals = topSignals.filter((s) => s.metric === "capital_allocation_clarity");
  const transparentSignals = topSignals.filter((s) => s.metric === "transparent");

  // GV dimension: look at high_impact_signals key
  const highImpactCount = parseInt(getKm(km, "high_impact") ?? "0", 10);
  const govImpactText = [
    highImpactCount ? `High impact: ${highImpactCount}` : "",
    getKm(km, "medium_impact") ? `Medium: ${getKm(km, "medium_impact")}` : "",
  ].filter(Boolean).join(", ");

  return [
    {
      abbr: "PD",
      label: "Proactive Disclosure",
      description: "Voluntary surfacing of material headwinds before analyst questioning",
      status: proactiveSignals.length >= 2 ? "PROACTIVE" : "REACTIVE",
      statusColor: proactiveSignals.length >= 2 ? "var(--qc-up)" : "var(--qc-warn)",
      statusBg: proactiveSignals.length >= 2 ? "rgba(31,122,74,0.10)" : "rgba(180,115,26,0.10)",
      score: proactiveSignals.length >= 2 ? 7 : 4,
      signals: proactiveSignals.slice(0, 3).map((s) => ({ text: s.label, positive: (s.actual_value ?? 0) > 0 })),
    },
    {
      abbr: "CA",
      label: "Capital Allocation Clarity",
      description: "Quantitative specificity on capex, margins, and deployment timelines",
      status: claritySignals.some((s) => s.label.toLowerCase().includes("decline")) ? "OPAQUE" : claritySignals.length > 0 ? "PARTIAL" : "UNSCORED",
      statusColor: claritySignals.some((s) => s.label.toLowerCase().includes("decline")) ? "var(--qc-down)" : "var(--qc-warn)",
      statusBg: claritySignals.some((s) => s.label.toLowerCase().includes("decline")) ? "rgba(220,38,38,0.10)" : "rgba(180,115,26,0.10)",
      score: claritySignals.some((s) => s.label.toLowerCase().includes("decline")) ? 2 : 4,
      signals: claritySignals.slice(0, 3).map((s) => ({ text: s.label, positive: !s.label.toLowerCase().includes("decline") })),
    },
    {
      abbr: "TR",
      label: "Transparency Depth",
      description: "Quantitative vs vague qualitative language in management commentary",
      status: transparentSignals.length > 0 ? "PROCEDURAL" : "WEAK",
      statusColor: transparentSignals.length > 0 ? "var(--qc-warn)" : "var(--qc-down)",
      statusBg: transparentSignals.length > 0 ? "rgba(180,115,26,0.10)" : "rgba(220,38,38,0.10)",
      score: transparentSignals.length > 0 ? 4 : 2,
      signals: transparentSignals.slice(0, 3).map((s) => ({ text: s.label, positive: true })),
    },
    {
      abbr: "GV",
      label: "Governance Signals",
      description: "Audit quality, regulatory compliance, and structural disclosure controls",
      status: highImpactCount >= 1 ? "CLEAN" : "REACTIVE",
      statusColor: highImpactCount >= 1 ? "var(--qc-up)" : "var(--qc-warn)",
      statusBg: highImpactCount >= 1 ? "rgba(31,122,74,0.10)" : "rgba(180,115,26,0.10)",
      score: highImpactCount >= 1 ? 7 : 4,
      signals: govImpactText
        ? [{ text: govImpactText, positive: highImpactCount >= 1 }]
        : topSignals.filter((s) => s.metric !== "proactive_disclosure" && s.metric !== "capital_allocation_clarity" && s.metric !== "transparent")
            .slice(0, 2).map((s) => ({ text: s.label, positive: true })),
    },
  ];
}

export function LensDetailDisclosure({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const km = lens.key_metrics;
  const rawZScore = getKm(km, "weighted_z") ?? getKm(km, "z_score") ?? String(lens.z_score ?? "—");
  const zScore = isNaN(parseFloat(rawZScore)) ? rawZScore : parseFloat(rawZScore).toFixed(1);
  const totalSignals = getKm(km, "total_signals") ?? String(lens.signal_count ?? "—");
  const highImpact = getKm(km, "high_impact") ?? "—";

  // Dominant metric: derive from which signal type has the most occurrences
  const metricCounts: Record<string, number> = {};
  topSignals.forEach((s) => { metricCounts[s.metric] = (metricCounts[s.metric] ?? 0) + 1; });
  const topMetrics = Object.entries(metricCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k.replace(/_/g, " "));
  const dominantMetric = topMetrics.length > 0 ? topMetrics.join(" & ") : "—";

  const dims = buildDimCards(topSignals, km);

  const st = lens.status ?? "";
  const statusColor =
    st.toUpperCase() === "STRONG"
      ? "var(--qc-up)"
      : st.toUpperCase() === "WEAK"
        ? "var(--qc-down)"
        : "var(--qc-warn)";

  const quarterLabel = quarterFromDate(lens.computed_at);

  // Quote: first signal with statement > 80 chars, else takeaway
  const quoteSig = topSignals.find((s) => s.statement && s.statement.length > 80);
  const quoteText = quoteSig?.statement?.slice(0, 220) ?? lens.takeaway?.slice(0, 220) ?? "";

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
          {quarterLabel && (
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
              color: "var(--qc-ink-3)", background: "var(--qc-section)",
              border: "1px solid var(--qc-hair)", borderRadius: 4, padding: "2px 7px",
            }}>
              {quarterLabel}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: statusColor, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            {st.charAt(0).toUpperCase() + st.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Summary subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0 }}>
            {lens.description}
          </p>
        </div>

        {/* 3-column KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 0 }}>
          {[
            { label: "Z-SCORE", value: zScore, sub: "Governance signal aggregate", color: statusColor },
            { label: "TOTAL SIGNALS", value: totalSignals, sub: "Signals evaluated", color: "var(--qc-ink)" },
            { label: "HIGH IMPACT", value: highImpact, sub: "High-impact signal count", color: "var(--qc-warn)" },
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
      {quoteText && (
        <div style={{ borderLeft: "3px solid var(--qc-ink)", paddingLeft: 16, paddingTop: 4, paddingBottom: 4, margin: "0 2px" }}>
          <p style={{
            fontSize: 13, fontStyle: "italic", color: "var(--qc-ink)", margin: "0 0 6px",
            lineHeight: 1.65, fontFamily: "var(--qc-font-serif, Georgia, serif)",
          }}>
            {quoteText}
          </p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
            Quantcase governance analysis{quarterLabel ? ` · ${quarterLabel}` : ""}
          </p>
        </div>
      )}

      {/* Dimension score chart */}
      {(() => {
        const dimScores = dims.map((d) => ({ name: d.abbr, fullName: d.label, score: d.score, color: d.statusColor }));
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
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9A9A92" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    contentStyle={{ fontSize: 11, border: "1px solid #E9E7E1", borderRadius: 6, background: "#fff" }}
                    formatter={(v: number, _n, props) => [`${v}/10`, props.payload.fullName]}
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
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
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
        title={lens.name}
        body={lens.takeaway}
        metrics={[
          { label: "Z-Score", value: zScore, sub: "Governance signal aggregate" },
          { label: "Dominant Signal", value: topMetrics[0] ?? "—", sub: dominantMetric.slice(0, 28) },
          { label: "Total Signals", value: totalSignals, sub: "Signals evaluated" },
        ]}
      />
    </div>
  );
}
