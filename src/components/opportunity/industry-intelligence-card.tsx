"use client";

import { useState } from "react";
import { Factory, Layers } from "lucide-react";
import type { IndustryOverviewSection, IndustryAnalysis } from "@/types/opportunity";
import {
  IntelligenceCardShell,
  IntelligenceCardHeader,
  ScoreSignalsCard,
  IntelligenceSubCard,
} from "./intelligence-card-shared";

// ─── Color dot for key finding sentiment ──────────────────────────────────────

function findingColor(color: string) {
  if (color === "green") return "var(--qc-up)";
  if (color === "red")   return "var(--qc-down)";
  if (color === "amber") return "var(--qc-warn)";
  return "var(--qc-blue, #3A6BEF)";
}

// ─── Key Finding row with hover popover ──────────────────────────────────────

function KeyFindingRow({ theme, body, color }: { theme: string; body: string; color: string }) {
  const [open, setOpen] = useState(false);
  const dot = findingColor(color);

  // Split theme at em-dash to separate category from headline
  const dashIdx = theme.indexOf(" — ");
  const category = dashIdx !== -1 ? theme.slice(0, dashIdx) : null;
  const headline = dashIdx !== -1 ? theme.slice(dashIdx + 3) : theme;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", cursor: "default" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 4 }} />
        <div style={{ minWidth: 0 }}>
          {category && (
            <span style={{
              fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)",
              color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
              letterSpacing: ".1em", display: "block", marginBottom: 2,
            }}>
              {category}
            </span>
          )}
          <p style={{
            margin: 0, fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)",
            color: "var(--qc-ink)", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {headline}
          </p>
        </div>
      </div>

      {open && (
        <div style={{
          position: "absolute", left: 0, top: "100%", marginTop: 2,
          zIndex: 50, width: 300, borderRadius: 12,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-card, var(--qc-card))",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}>
          <div style={{
            padding: "8px 12px", borderBottom: "1px solid var(--qc-hair)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.3 }}>{headline}</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.6 }}>{body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dimension score rows ─────────────────────────────────────────────────────

function DimensionRows({ dimensions }: { dimensions: IndustryAnalysis["score_card"]["dimensions"] }) {
  const LABEL_MAP: Record<string, string> = {
    demand: "Demand",
    growth: "Growth",
    supply: "Supply",
    profit_pool: "Profit Pool",
    global_competition: "Global Competition",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {Object.entries(dimensions).map(([key, dim]) => {
        const pct = dim.max > 0 ? (dim.score / dim.max) * 100 : 0;
        const barColor = pct >= 70 ? "var(--qc-up)" : pct >= 40 ? "var(--qc-warn)" : "var(--qc-down)";
        const label = LABEL_MAP[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", width: 120, flexShrink: 0, lineHeight: 1.2 }}>{label}</span>
            <div style={{ width: 100, flexShrink: 0, height: 4, borderRadius: 999, background: "rgba(0,0,0,0.10)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: barColor, transition: "width .4s" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flex: 1 }}>
              <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-mono)", color: barColor, fontVariantNumeric: "tabular-nums" }}>
                {dim.score}
                <span style={{ color: "var(--qc-ink-3)", fontWeight: "var(--qc-w-regular)" }}>/{dim.max}</span>
              </span>
              <span style={{
                fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink-2)",
                fontFamily: "var(--qc-font-mono)",
                textTransform: "uppercase" as const, letterSpacing: ".06em",
                marginLeft: "auto",
              }}>
                {dim.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  data: IndustryOverviewSection;
  investmentImplications?: IndustryAnalysis;
}

export function IndustryIntelligenceCard({ data, investmentImplications }: Props) {
  const fs = data.final_scoring;
  if (!fs) return null;

  const score = fs.score ?? 0;
  const maxScore = fs.max_score ?? fs.checks?.length ?? 25;
  const status = fs.status ?? "NEUTRAL";
  const statusColor = fs.color ?? fs.status_color;
  const signals = fs.signal_breakdown ?? [];
  const takeaway = data.text?.takeaway;

  const keyFindings = investmentImplications?.key_findings ?? [];
  const dimensions = investmentImplications?.score_card?.dimensions;

  return (
    <IntelligenceCardShell>
      <IntelligenceCardHeader
        icon={<Factory style={{ width: 14, height: 14, color: "var(--qc-ink)" }} />}
        title="Industry Intelligence"
        badge={data.sector ?? undefined}
      />

      <ScoreSignalsCard
        eyebrow="Industry Attractiveness Score"
        score={score}
        maxScore={maxScore}
        status={status}
        statusColor={statusColor}
        takeaway={takeaway}
        signals={signals}
        subLabels={["Low", "Medium", "High"]}
      />

      {dimensions && Object.keys(dimensions).length > 0 && (
        <IntelligenceSubCard
          icon={<Layers style={{ width: 10, height: 10, color: "var(--qc-ink)" }} />}
          eyebrow="Industry Dimensions"
        >
          <DimensionRows dimensions={dimensions} />
        </IntelligenceSubCard>
      )}

      {keyFindings.length > 0 && (
        <IntelligenceSubCard eyebrow="Key Findings">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {keyFindings.map((f, i) => (
              <div key={i} style={{ borderBottom: i < keyFindings.length - 1 ? "1px solid var(--qc-hair)" : "none" }}>
                <KeyFindingRow theme={f.theme} body={f.body} color={f.color} />
              </div>
            ))}
          </div>
        </IntelligenceSubCard>
      )}

      {data.period && (
        <p style={{ margin: 0, fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", textAlign: "right", padding: "0 4px" }}>
          {data.period}
        </p>
      )}
    </IntelligenceCardShell>
  );
}
