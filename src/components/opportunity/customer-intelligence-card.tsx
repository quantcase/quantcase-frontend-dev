"use client";

import { useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import type { CustomerTractionSection } from "@/types/opportunity";
import {
  IntelligenceCardShell,
  IntelligenceCardHeader,
  ScoreSignalsCard,
  IntelligenceSubCard,
} from "./intelligence-card-shared";

const ACQ_CONFIG: { label: string; dot: string }[] = [
  { label: "Current State",     dot: "var(--qc-blue, #3A6BEF)" },
  { label: "Shifting Dynamics", dot: "var(--qc-warn)" },
  { label: "Future Trajectory", dot: "var(--qc-up)" },
  { label: "Watch-out",         dot: "var(--qc-down)" },
];

function AcqRow({ label, body, dot }: { label: string; body: string; dot: string }) {
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-text-heading)" }}>{label}</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--qc-text-body)", lineHeight: 1.6 }}>{body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  data: CustomerTractionSection;
}

export function CustomerIntelligenceCard({ data }: Props) {
  const fs = data.analysis?.final_scoring;
  if (!fs) return null;

  const score = fs.score ?? 0;
  const maxScore = fs.max_score ?? 10;
  const status = fs.status ?? "NEUTRAL";
  const statusColor = fs.color ?? fs.status_color;
  const signals = fs.signal_breakdown ?? [];
  const takeaway = data.core?.text?.takeaway;

  const acqItems = data.core?.text?.customer_growth?.acquisition_dynamics ?? [];
  const acqRows = acqItems.slice(0, 4).map((body, i) => ({ ...ACQ_CONFIG[i], body }));

  return (
    <IntelligenceCardShell>
      <IntelligenceCardHeader
        icon={<Users style={{ width: 14, height: 14, color: "var(--qc-text-body)" }} />}
        title="Customer Intelligence"
      />

      <ScoreSignalsCard
        eyebrow="Customer Traction Score"
        score={score}
        maxScore={maxScore}
        status={status}
        statusColor={statusColor}
        takeaway={takeaway}
        signals={signals}
        subLabels={["Weak", "Moderate", "Strong"]}
      />

      {acqRows.length > 0 && (
        <IntelligenceSubCard
          icon={<TrendingUp style={{ width: 10, height: 10, color: "var(--qc-text-body)" }} />}
          eyebrow="Customer Acquisition Dynamics"
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {acqRows.map((r, i) => (
              <div key={i} style={{ borderBottom: i < acqRows.length - 1 ? "1px solid var(--qc-border-default)" : "none" }}>
                <AcqRow label={r.label} body={r.body} dot={r.dot} />
              </div>
            ))}
          </div>
        </IntelligenceSubCard>
      )}
    </IntelligenceCardShell>
  );
}
