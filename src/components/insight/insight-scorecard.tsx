"use client";

import type { InsightData, InsightLens } from "@/types/analysis";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { DarkGradientCard, MonoLabel } from "@/components/ds";

interface InsightScorecardProps {
  insight: InsightData;
  verdictLabel: string;
}

function verdictBandColor(band: string) {
  const b = (band ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH")) return "var(--qc-up)";
  if (b.includes("WEAK") || b.includes("LOW")) return "var(--qc-down)";
  return "var(--qc-warn)";
}

function verdictBandBg(band: string) {
  const b = (band ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH")) return "rgba(31,122,74,0.18)";
  if (b.includes("WEAK") || b.includes("LOW")) return "rgba(220,38,38,0.15)";
  return "rgba(180,115,26,0.15)";
}

function lensBarColor(pct: number) {
  if (pct >= 70) return "var(--qc-up)";
  if (pct >= 40) return "var(--qc-warn)";
  return "var(--qc-down)";
}

function lensStatusLabel(pct: number, status: string) {
  if (status) return status.toUpperCase();
  if (pct >= 70) return "STRONG";
  if (pct >= 40) return "MODERATE";
  return "NEUTRAL";
}

function parseHeadline(headline: string) {
  const match = headline.match(/^([\s\S]*?)\*([\s\S]*?)\*([\s\S]*)$/);
  if (match) return { before: match[1], highlight: match[2], after: match[3] };
  // Try semicolon split as fallback (e.g. "Engine-agnostic moat; margin recovery is the catalyst.")
  const semi = headline.indexOf(";");
  if (semi !== -1) return { before: headline.slice(0, semi + 1), highlight: headline.slice(semi + 1).trim(), after: "" };
  return { before: "", highlight: headline, after: "" };
}

function buildRadarData(lenses: InsightLens[]) {
  return lenses.map((l) => ({
    subject: l.name.toUpperCase(),
    value: l.max_score > 0 ? Math.round((l.score / l.max_score) * 100) : 0,
  }));
}

function WrappedRadarTick({ x, y, payload, textAnchor }: { x: number; y: number; payload: { value: string }; textAnchor: "start" | "middle" | "end" | "inherit" }) {
  const words = payload.value.split(" ");
  const lineHeight = 12;
  const totalHeight = (words.length - 1) * lineHeight;
  const startDy = -(totalHeight / 2);
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="var(--qc-ink-3)" fontSize={9} fontWeight={500} letterSpacing="0.04em">
      {words.map((word, i) => (
        <tspan key={i} x={x} dy={i === 0 ? startDy : lineHeight}>{word}</tspan>
      ))}
    </text>
  );
}

export function InsightScorecard({ insight, verdictLabel }: InsightScorecardProps) {
  const { before, highlight, after } = parseHeadline(insight.headline);
  const bandColor = verdictBandColor(insight.verdict_band ?? insight.verdict);
  const bandBg = verdictBandBg(insight.verdict_band ?? insight.verdict);
  const bandLabel = (insight.verdict_band || insight.verdict || "").toUpperCase();
  const radarData = buildRadarData(insight.lenses);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderRadius: 14, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>

      {/* LEFT — dark verdict panel */}
      <DarkGradientCard radius={0} style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", minHeight: 260 }}>
        {/* Band badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <MonoLabel size={10} tracking="0.14em" color="rgba(255,255,255,0.45)">
            {verdictLabel}
          </MonoLabel>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: bandColor, background: bandBg, border: `1px solid ${bandColor}`,
            borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", whiteSpace: "nowrap",
          }}>
            {bandLabel}
          </span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: 26, fontWeight: 400, lineHeight: 1.35, letterSpacing: "-0.01em",
            margin: 0, color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-serif, Georgia, serif)",
          }}>
            {before && <span>{before} </span>}
            {highlight && (
              <em style={{ color: bandColor, fontStyle: "italic" }}>{highlight}</em>
            )}
            {after && <span> {after}</span>}
          </h2>

          {insight.description && (
            <p style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: "90%" }}>
              {insight.description}
            </p>
          )}
        </div>

        {/* Key signal chips */}
        {insight.key_signals.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {insight.key_signals.map((s, i) => {
              const dotColor = s.sentiment === "positive" ? "var(--qc-up)" : s.sentiment === "negative" ? "var(--qc-down)" : "var(--qc-ink-3)";
              return (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 999, padding: "5px 12px",
                  fontSize: 12, color: "rgba(255,255,255,0.88)",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                  {s.label}
                </span>
              );
            })}
          </div>
        )}
      </DarkGradientCard>

      {/* RIGHT — light radar + score breakdown */}
      <div style={{ background: "var(--qc-card)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        {/* Top: radar chart + score context */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>

          {/* Radar */}
          <div style={{ flex: "0 0 50%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 28, right: 28, bottom: 28, left: 28 }}>
                <PolarGrid stroke="var(--qc-hair)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={(props) => <WrappedRadarTick {...props} />}
                />
                <Radar
                  name="score"
                  dataKey="value"
                  stroke={bandColor}
                  fill={bandColor}
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: bandColor, strokeWidth: 0 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score + thesis label */}
          <div style={{ flex: 1, padding: "20px 20px 20px 8px" }}>
            {/* Band pill */}
            <span style={{
              display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
              color: bandColor, background: bandBg, border: `1px solid ${bandColor}`,
              borderRadius: 4, padding: "2px 10px", textTransform: "uppercase", marginBottom: 12,
            }}>
              {bandLabel}
            </span>

            {/* Thesis / subtitle headline */}
            <h3 style={{
              fontSize: 17, fontWeight: 400, lineHeight: 1.4, margin: 0,
              color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif, Georgia, serif)",
            }}>
              {insight.subtitle && (
                <>
                  {insight.subtitle.split(";")[0]}
                  {insight.subtitle.includes(";") && (
                    <>; <em style={{ color: bandColor, fontStyle: "italic" }}>{insight.subtitle.split(";")[1].trim()}</em></>
                  )}
                </>
              )}
            </h3>

            {/* Context line */}
            {insight.analyzed_at && (
              <p style={{ marginTop: 8, fontSize: 11, color: "var(--qc-ink-3)", lineHeight: 1.5 }}>
                {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} · Analyzed {new Date(insight.analyzed_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: lens score tiles */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(insight.lenses.length, 4)}, 1fr)`, borderTop: "1px solid var(--qc-hair)" }}>
          {insight.lenses.map((lens, i) => {
            const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
            const barColor = lensBarColor(pct);
            const statusLabel = lensStatusLabel(pct, lens.status);
            const isLast = i === insight.lenses.length - 1;
            const isStrong = pct >= 70;
            return (
              <div
                key={lens.slug}
                style={{
                  padding: "14px 16px 12px",
                  borderRight: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  borderTop: "0",
                }}
              >
                <MonoLabel size={9} tracking="0.12em" color="var(--qc-ink-3)" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{lens.name.toUpperCase()}</MonoLabel>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "6px 0 4px" }}>
                  <span style={{ fontSize: 24, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1 }}>{lens.score}</span>
                  <span style={{ fontSize: 12, color: "var(--qc-ink-3)" }}>/{lens.max_score}</span>
                  <span style={{
                    marginLeft: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                    color: isStrong ? "var(--qc-up)" : barColor,
                    textTransform: "uppercase",
                  }}>{statusLabel}</span>
                </div>
                <div style={{ height: 3, borderRadius: 99, background: "var(--qc-hair)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
