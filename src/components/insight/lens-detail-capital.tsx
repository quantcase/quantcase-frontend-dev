"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList,
} from "recharts";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

const C_REV = "#1F7A4A";
const C_EBITDA = "#B4731A";
const C_HAIR = "#E9E7E1";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

interface MetricRow {
  key: string;
  label: string;
  value: string;
  delta: string | null;
  deltaColor: string;
  borderColor: string;
  positive: boolean;
}

function buildMetricRows(topSignals: TopSignal[], km: Record<string, string>): MetricRow[] {
  const rows: MetricRow[] = [];

  const revYoY = topSignals.find((s) => s.metric === "MSWIL_REV" && s.label.includes("Year-on-Year"));
  const revAbs = topSignals.find((s) => s.metric === "MSWIL_REV" && s.label.includes("Absolute"));
  const gfRev = topSignals.find((s) => s.metric === "SEG_GREENFIELD_REV" && s.label.includes("Q3"));
  const gfRevYtd = topSignals.find((s) => s.metric === "SEG_GREENFIELD_REV" && s.label.includes("YTD"));
  const ebitdaAbs = topSignals.find((s) => s.metric === "MSWIL_EBITDA" && s.label.includes("Absolute"));
  const ebitdaYoY = topSignals.find((s) => s.metric === "MSWIL_EBITDA" && s.label.includes("Year-on-Year"));
  const ebitdaMargin = topSignals.find((s) => s.metric === "EBITDA_MARGIN_REP");
  const pat = topSignals.find((s) => s.metric === "MSWIL_PAT");
  const gfEbitda = topSignals.find((s) => s.metric === "SEG_GREENFIELD_EBITDA" && s.label.includes("YTD"));
  const gfEbitdaQ3 = topSignals.find((s) => s.metric === "SEG_GREENFIELD_EBITDA" && s.label.includes("Q3"));

  if (revAbs) {
    rows.push({
      key: "rev", label: "MSWIL Revenue", value: `₹${revAbs.actual_value?.toLocaleString("en-IN") ?? km["MSWIL_REV_Q3"] ?? "2,887"} Cr`,
      delta: revYoY ? `+${revYoY.actual_value}% YoY` : "+25.5% YoY",
      deltaColor: "var(--qc-up)", borderColor: "var(--qc-up)", positive: true,
    });
  }
  if (ebitdaAbs) {
    rows.push({
      key: "ebitda", label: "EBITDA", value: `₹${ebitdaAbs.actual_value} Cr`,
      delta: ebitdaYoY ? `+${ebitdaYoY.actual_value}% YoY` : "+10.5% YoY",
      deltaColor: "var(--qc-up)", borderColor: "var(--qc-up)", positive: true,
    });
  }
  if (ebitdaMargin) {
    rows.push({
      key: "margin", label: "Reported EBITDA Margin", value: `${ebitdaMargin.actual_value}%`,
      delta: km["Reported_EBITDA_Margin_Q3"] ? null : "Q3 FY26",
      deltaColor: "var(--qc-ink-3)", borderColor: "var(--qc-warn)", positive: true,
    });
  }
  if (pat) {
    rows.push({
      key: "pat", label: "Profit After Tax", value: `₹${pat.actual_value} Cr`,
      delta: "Q3 FY26", deltaColor: "var(--qc-ink-3)", borderColor: "var(--qc-ink-3)", positive: true,
    });
  }
  if (gfRev) {
    rows.push({
      key: "gf_rev", label: "Greenfield Revenue Growth", value: `+${gfRev.actual_value}%`,
      delta: gfRevYtd ? `+${gfRevYtd.actual_value}% YTD` : "+13.1% YTD",
      deltaColor: "var(--qc-up)", borderColor: "var(--qc-up)", positive: true,
    });
  }
  if (gfEbitda) {
    rows.push({
      key: "gf_ebitda", label: "Greenfield EBITDA Growth", value: `+${gfEbitda.actual_value}%`,
      delta: gfEbitdaQ3 ? `+${gfEbitdaQ3.actual_value}% Q3` : "+7.6% Q3",
      deltaColor: (gfEbitda.actual_value ?? 0) > (gfEbitdaQ3?.actual_value ?? 0) ? "var(--qc-up)" : "var(--qc-warn)",
      borderColor: "var(--qc-warn)", positive: true,
    });
  }

  return rows;
}

export function LensDetailCapital({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const km = lens.key_metrics;
  const rows = buildMetricRows(topSignals, km);

  const statusColor =
    lens.status.toUpperCase() === "STRONG"
      ? "var(--qc-up)"
      : lens.status.toUpperCase() === "WEAK"
        ? "var(--qc-down)"
        : "var(--qc-warn)";

  const revYoY = topSignals.find((s) => s.metric === "MSWIL_REV" && s.label.includes("Year-on-Year"))?.actual_value ?? 25.5;
  const ebitdaYoY = topSignals.find((s) => s.metric === "MSWIL_EBITDA" && s.label.includes("Year-on-Year"))?.actual_value ?? 10.5;
  const margin = topSignals.find((s) => s.metric === "EBITDA_MARGIN_REP")?.actual_value ?? 12.5;
  const gfRev = topSignals.find((s) => s.metric === "SEG_GREENFIELD_REV" && s.label.includes("Q3"))?.actual_value ?? 18.8;

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
            CAPITAL ALLOCATION
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

        {/* Subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0 }}>
            Greenfield-led organic growth with margin discipline — EBITDA growth lagging revenue signals ramp-up absorption
          </p>
        </div>

        {/* 4-column KPI tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "REV YoY GROWTH", value: `+${revYoY}%`, sub: "MSWIL Q3 FY26 revenue expansion", color: "var(--qc-up)" },
            { label: "EBITDA YoY GROWTH", value: `+${ebitdaYoY}%`, sub: "Controlled margin expansion", color: "var(--qc-up)" },
            { label: "EBITDA MARGIN", value: `${margin}%`, sub: "Reported Q3 FY26 EBITDA margin", color: "var(--qc-warn)" },
            { label: "GREENFIELD REV", value: `+${gfRev}%`, sub: "Q3 organic growth from new capacity", color: "var(--qc-up)" },
          ].map((tile, i, arr) => (
            <div key={i} style={{
              padding: "14px 14px", background: "var(--qc-card)",
              borderRight: i < arr.length - 1 ? "1px solid var(--qc-hair)" : undefined,
              borderTop: "1px solid var(--qc-hair)",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: tile.color, margin: 0 }}>
                {tile.label}
              </p>
              <p style={{ fontSize: 24, fontWeight: 600, color: tile.color, margin: "2px 0", lineHeight: 1 }}>
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
          25.5% revenue growth with controlled EBITDA expansion signals capital deployed productively — but margin discipline will be tested as greenfield capacity matures into steady-state operations.
        </p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
          Quantcase capital analysis · Q3 FY26
        </p>
      </div>

      {/* Growth comparison chart */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            REVENUE vs EBITDA GROWTH · YoY %
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--qc-ink-3)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: C_REV, display: "inline-block" }} /> Revenue
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--qc-ink-3)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: C_EBITDA, display: "inline-block" }} /> EBITDA
            </span>
          </div>
        </div>
        <div style={{ padding: "16px 8px 8px", background: "var(--qc-card)" }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={[
                { name: "Consolidated", rev: revYoY, ebitda: ebitdaYoY },
                { name: "Greenfield Q3", rev: gfRev, ebitda: topSignals.find((s) => s.metric === "SEG_GREENFIELD_EBITDA" && s.label.includes("Q3"))?.actual_value ?? 7.6 },
                { name: "Greenfield YTD", rev: topSignals.find((s) => s.metric === "SEG_GREENFIELD_REV" && s.label.includes("YTD"))?.actual_value ?? 13.1, ebitda: topSignals.find((s) => s.metric === "SEG_GREENFIELD_EBITDA" && s.label.includes("YTD"))?.actual_value ?? 9.6 },
              ]}
              barCategoryGap="30%"
              barGap={3}
              margin={{ top: 4, right: 16, left: -16, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={C_HAIR} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9A9A92" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#9A9A92" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 30]} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{ fontSize: 11, border: `1px solid ${C_HAIR}`, borderRadius: 6, background: "#fff" }}
                formatter={(v: number, name: string) => [`${v}%`, name === "rev" ? "Revenue" : "EBITDA"]}
              />
              <ReferenceLine y={0} stroke={C_HAIR} />
              <Bar dataKey="rev" fill={C_REV} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="rev" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 9, fill: C_REV, fontWeight: 600 }} />
              </Bar>
              <Bar dataKey="ebitda" fill={C_EBITDA} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="ebitda" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 9, fill: C_EBITDA, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "4px 16px 0", lineHeight: 1.4 }}>
            Gap between revenue and EBITDA bars = margin compression from greenfield ramp-up absorption
          </p>
        </div>
      </div>

      {/* Signal table */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            CAPITAL SIGNAL BREAKDOWN
          </span>
          <span style={{ fontSize: 9, color: "var(--qc-ink-3)", marginLeft: "auto" }}>
            {topSignals.length} signals
          </span>
        </div>
        {rows.map((row, i) => (
          <div key={row.key} style={{
            padding: "11px 16px",
            background: "var(--qc-card)",
            borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : undefined,
            borderLeft: `3px solid ${row.borderColor}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: 0 }}>
                {row.label}
              </p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--qc-ink)", margin: "2px 0 0", lineHeight: 1 }}>
                {row.value}
              </p>
            </div>
            {row.delta && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: row.deltaColor,
                border: `1px solid ${row.deltaColor}40`, borderRadius: 4, padding: "3px 8px", whiteSpace: "nowrap",
              }}>
                {row.delta}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Robust capital allocation with greenfield-led organic growth."
        body={lens.takeaway}
        metrics={[
          { label: "Rev YoY Growth", value: `+${revYoY}%`, sub: "MSWIL Q3 FY26" },
          { label: "EBITDA YoY", value: `+${ebitdaYoY}%`, sub: "Margin absorption phase" },
          { label: "Greenfield Rev", value: `+${gfRev}%`, sub: "Q3 organic growth" },
        ]}
      />
    </div>
  );
}
