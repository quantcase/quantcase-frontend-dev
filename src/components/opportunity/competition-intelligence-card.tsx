"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Zap } from "lucide-react";
import type { CompetitionSection } from "@/types/opportunity";
import {
  IntelligenceCardShell,
  IntelligenceCardHeader,
  ScoreSignalsCard,
  IntelligenceSubCard,
} from "./intelligence-card-shared";

// ─── Competitive Metrics row ──────────────────────────────────────────────────

function metricColor(value: string): string {
  const v = value.toLowerCase();
  if (v === "high" || v === "strong") return "var(--qc-up)";
  if (v === "low" || v === "weak" || v === "poor") return "var(--qc-down)";
  if (v === "medium" || v === "moderate") return "var(--qc-warn)";
  return "var(--qc-text-heading)";
}

function MetricRow({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  const [open, setOpen] = useState(false);
  const color = metricColor(value);

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", cursor: "default" }}>
        <span style={{ fontSize: 12, color: "var(--qc-text-body)", flex: 1, lineHeight: 1.2 }}>{label}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color,
          fontFamily: "'IBM Plex Mono', monospace",
          textTransform: "uppercase" as const,
          letterSpacing: ".06em", flexShrink: 0,
        }}>
          {value}
        </span>
      </div>
      {open && sublabel && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 4,
          zIndex: 50, width: 260, borderRadius: 12,
          border: "1px solid var(--qc-border-default)",
          background: "var(--qc-surface-card, var(--qc-surface-white))",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
          padding: "10px 12px",
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--qc-text-body)", lineHeight: 1.6 }}>{sublabel}</p>
        </div>
      )}
    </div>
  );
}

// ─── Pricing Power Dynamics row (mirrors KeyFindingRow) ──────────────────────

const PPD_CONFIG: {
  key: "current_state" | "shifting_dynamics" | "future_trajectory" | "watch_outs";
  label: string;
  dot: string;
}[] = [
  { key: "current_state",     label: "Current State",     dot: "var(--qc-blue, #3A6BEF)" },
  { key: "shifting_dynamics", label: "Shifting Dynamics", dot: "var(--qc-warn)" },
  { key: "future_trajectory", label: "Future Trajectory", dot: "var(--qc-up)" },
  { key: "watch_outs",        label: "Watch-out",         dot: "var(--qc-down)" },
];

function PricingPowerRow({ label, body, dot }: { label: string; body: string; dot: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", cursor: "default" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 4 }} />
        <div style={{ minWidth: 0 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
            color: "var(--qc-text-muted)", textTransform: "uppercase" as const,
            letterSpacing: ".1em", display: "block", marginBottom: 2,
          }}>
            {label}
          </span>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 500,
            color: "var(--qc-text-heading)", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {body}
          </p>
        </div>
      </div>

      {open && (
        <div style={{
          position: "absolute", left: 0, top: "100%", marginTop: 2,
          zIndex: 50, width: 300, borderRadius: 12,
          border: "1px solid var(--qc-border-default)",
          background: "var(--qc-surface-card, var(--qc-surface-white))",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}>
          <div style={{
            padding: "8px 12px", borderBottom: "1px solid var(--qc-border-default)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-text-heading)", lineHeight: 1.3 }}>{label}</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--qc-text-body)", lineHeight: 1.6 }}>{body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  data: CompetitionSection;
}

export function CompetitionIntelligenceCard({ data }: Props) {
  const fs = data.final_scoring;
  if (!fs) return null;

  const score = fs.score ?? 0;
  const maxScore = fs.max_score ?? fs.checks?.length ?? 10;
  const status = fs.status ?? "NEUTRAL";
  const statusColor = fs.color ?? fs.status_color;
  const signals = fs.signal_breakdown ?? [];
  const takeaway = data.text?.takeaway;

  const metrics = data.metrics;
  const metricRows = metrics
    ? [
        metrics.market_position,
        metrics.pricing_power,
        metrics.entry_barriers,
        metrics.competitive_intensity,
        metrics.porters_score,
      ]
        .filter(Boolean)
        .map((m) => ({ label: m!.label ?? "", value: String(m!.value ?? ""), sublabel: m!.sublabel }))
    : [];

  const ppd = data.text?.pricing_power_dynamics;
  const ppdRows = ppd
    ? PPD_CONFIG.map((c) => ({ ...c, body: ppd[c.key] ?? "" })).filter((r) => r.body)
    : [];

  return (
    <IntelligenceCardShell>
      <IntelligenceCardHeader
        icon={<BarChart3 style={{ width: 14, height: 14, color: "var(--qc-text-body)" }} />}
        title="Competition Intelligence"
      />

      <ScoreSignalsCard
        eyebrow="Competitive Position Score"
        score={score}
        maxScore={maxScore}
        status={status}
        statusColor={statusColor}
        takeaway={takeaway}
        signals={signals}
        subLabels={["Weak", "Moderate", "Strong"]}
      />

      {metricRows.length > 0 && (
        <IntelligenceSubCard
          icon={<TrendingUp style={{ width: 10, height: 10, color: "var(--qc-text-body)" }} />}
          eyebrow="Competitive Metrics"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {metricRows.map((r) => (
              <MetricRow key={r.label} label={r.label} value={r.value} sublabel={r.sublabel} />
            ))}
          </div>
        </IntelligenceSubCard>
      )}

      {ppdRows.length > 0 && (
        <IntelligenceSubCard
          icon={<Zap style={{ width: 10, height: 10, color: "var(--qc-text-body)" }} />}
          eyebrow="Pricing Power Dynamics"
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ppdRows.map((r, i) => (
              <div key={r.key} style={{ borderBottom: i < ppdRows.length - 1 ? "1px solid var(--qc-border-default)" : "none" }}>
                <PricingPowerRow label={r.label} body={r.body} dot={r.dot} />
              </div>
            ))}
          </div>
        </IntelligenceSubCard>
      )}
    </IntelligenceCardShell>
  );
}
