"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

const IMPACT_COLOR: Record<string, string> = {
  high: "#1F7A4A",
  medium: "#B4731A",
  low: "#9A9A92",
};

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

interface SignalRow {
  label: string;
  metric: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  borderColor: string;
  icon: string;
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

function buildSignalRows(topSignals: TopSignal[]): SignalRow[] {
  return topSignals.map((s) => {
    const metric = s.metric.toLowerCase();

    let badge: string;
    let badgeColor: string;
    let badgeBg: string;
    let borderColor: string;
    let icon: string;

    const dir = (s.direction ?? "").toLowerCase();

    if (metric === "proactive_disclosure") {
      badge = "PROACTIVE";
      badgeColor = "var(--qc-up)";
      badgeBg = "rgba(31,122,74,0.10)";
      borderColor = "var(--qc-up)";
      icon = "↑";
    } else if (metric === "capital_allocation_clarity") {
      const isNeg = s.label.toLowerCase().includes("decline") || s.label.toLowerCase().includes("opaque");
      badge = isNeg ? "OPAQUE" : "DISCLOSED";
      badgeColor = isNeg ? "var(--qc-warn)" : "var(--qc-up)";
      badgeBg = isNeg ? "rgba(180,115,26,0.10)" : "rgba(31,122,74,0.10)";
      borderColor = isNeg ? "var(--qc-warn)" : "var(--qc-up)";
      icon = isNeg ? "!" : "✓";
    } else if (metric === "transparent") {
      badge = "TRANSPARENT";
      badgeColor = "var(--qc-up)";
      badgeBg = "rgba(31,122,74,0.10)";
      borderColor = "var(--qc-up)";
      icon = "✓";
    } else if (metric === "guidance_given" || dir === "tracking" || dir === "in_line") {
      badge = dir === "tracking" ? "TRACKING" : dir === "in_line" ? "IN LINE" : "GUIDANCE";
      badgeColor = "var(--qc-blue)";
      badgeBg = "rgba(37,99,235,0.08)";
      borderColor = "var(--qc-blue)";
      icon = "→";
    } else {
      badge = "OBSERVED";
      badgeColor = "var(--qc-ink-3)";
      badgeBg = "var(--qc-section)";
      borderColor = "var(--qc-ink-3)";
      icon = "—";
    }

    return { label: s.label, metric: s.metric.replace(/_/g, " "), badge, badgeColor, badgeBg, borderColor, icon };
  });
}

export function LensDetailPromoter({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const rows = buildSignalRows(topSignals);
  const st = lens.status ?? "";
  const statusColor =
    st.toUpperCase() === "STRONG"
      ? "var(--qc-up)"
      : st.toUpperCase() === "WEAK"
        ? "var(--qc-down)"
        : "var(--qc-warn)";

  const km = lens.key_metrics;

  // Derive KPI tile values from actual API keys
  const rawZScore = getKm(km, "z_aggregate") ?? getKm(km, "z_score") ?? getKm(km, "weighted_z") ?? String(lens.z_score ?? "—");
  const zScore = isNaN(parseFloat(rawZScore)) ? rawZScore : parseFloat(rawZScore).toFixed(1);
  const sampleSize = getKm(km, "total_signals") ?? getKm(km, "signal_sample") ?? String(lens.signal_count ?? "—");
  const proactiveCount = getKm(km, "proactive_disclosure") ?? "—";
  const clarityCount = getKm(km, "transparency_capital") ?? getKm(km, "capital_allocation_clarity") ?? "—";

  const quarterLabel = quarterFromDate(lens.computed_at);

  // Quote: first signal with a statement longer than 80 chars, else takeaway
  const quoteSig = topSignals.find((s) => s.statement && s.statement.length > 80);
  const quoteText = quoteSig?.statement?.slice(0, 220) ?? lens.takeaway?.slice(0, 220) ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header strip */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px",
          background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            PROMOTER ACTIVITY
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

        {/* 4-column KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 0 }}>
          {[
            { label: "Z-SCORE", value: zScore, sub: "Aggregate governance signal score", color: "var(--qc-ink)" },
            { label: "SIGNAL SAMPLE", value: sampleSize, sub: "Unique signals evaluated", color: "var(--qc-ink)" },
            { label: "PROACTIVE DISCLOSE", value: proactiveCount, sub: "Proactive disclosure signals", color: "var(--qc-up)" },
            { label: "CAPITAL CLARITY", value: clarityCount, sub: "Capital allocation clarity signals", color: "var(--qc-warn)" },
          ].map((tile, i, arr) => (
            <div key={i} style={{
              padding: "14px 14px",
              background: "var(--qc-card)",
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

      {/* Signal timeline chart */}
      {(() => {
        const scatterData = topSignals.map((s, i) => {
          const ym = (s.actual_date ?? s.guided_date ?? "").slice(0, 7);
          // Map YYYY-MM to quarter index 1–4 within the fiscal year
          const [yr, mo] = ym ? ym.split("-").map(Number) : [0, 0];
          const q = mo ? (mo < 4 ? 4 : mo < 7 ? 1 : mo < 10 ? 2 : 3) : (i + 1);
          const x = mo ? q : (i % 3) + 1;
          const impact = (s.impact ?? "medium").toLowerCase();
          return { x, y: { high: 3, medium: 2, low: 1 }[impact] ?? 2, impact, label: s.label, metric: s.metric };
        });
        return (
          <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
            <div style={{
              padding: "10px 16px", background: "var(--qc-section)",
              borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
                SIGNAL TIMELINE
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                {(["high", "medium", "low"] as const).map((k) => (
                  <span key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--qc-ink-3)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: IMPACT_COLOR[k], display: "inline-block" }} />
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: "12px 8px 4px", background: "var(--qc-card)" }}>
              <ResponsiveContainer width="100%" height={130}>
                <ScatterChart margin={{ top: 8, right: 20, left: -20, bottom: 4 }}>
                  <XAxis
                    type="number" dataKey="x" domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v) => ["", "Q1", "Q2", "Q3"][v] ?? ""}
                    tick={{ fontSize: 10, fill: "#9A9A92" }} axisLine={false} tickLine={false}
                  />
                  <YAxis
                    type="number" dataKey="y" domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v) => ["", "Low", "Med", "High"][v] ?? ""}
                    tick={{ fontSize: 9, fill: "#9A9A92" }} axisLine={false} tickLine={false} width={32}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{ fontSize: 11, border: "1px solid #E9E7E1", borderRadius: 6, background: "#fff", maxWidth: 220 }}
                    formatter={(_v, _n, props) => [props.payload.label, props.payload.metric.replace(/_/g, " ")]}
                  />
                  <Scatter data={scatterData} shape="circle">
                    {scatterData.map((entry, i) => (
                      <Cell key={i} fill={IMPACT_COLOR[entry.impact] ?? "#9A9A92"} fillOpacity={0.85} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 16px 8px", lineHeight: 1.4 }}>
                Each dot is a governance signal — vertical axis shows materiality, horizontal shows the quarter it was observed
              </p>
            </div>
          </div>
        );
      })()}

      {/* Signal rows */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            SIGNAL BREAKDOWN
          </span>
          <span style={{ fontSize: 9, color: "var(--qc-ink-3)", marginLeft: "auto" }}>
            {topSignals.length} signals
          </span>
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{
            padding: "12px 16px",
            background: "var(--qc-card)",
            borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : undefined,
            borderLeft: `3px solid ${row.borderColor}`,
            display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
              <span style={{ flexShrink: 0, marginTop: 1, fontSize: 13, fontWeight: 700, color: row.borderColor, lineHeight: 1 }}>
                {row.icon}
              </span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.3 }}>
                  {row.label}
                </p>
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {row.metric}
                </p>
              </div>
            </div>
            <span style={{
              flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              color: row.badgeColor, background: row.badgeBg,
              borderRadius: 4, padding: "3px 8px", textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              {row.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway}
        metrics={[
          { label: "Z-Score", value: zScore, sub: "Aggregate governance score" },
          { label: "Proactive Disclose", value: proactiveCount, sub: "Proactive disclosure signals" },
          { label: "Capital Clarity", value: clarityCount, sub: "Capital allocation signals" },
        ]}
      />
    </div>
  );
}
