"use client";

import type { InsightData } from "@/types/analysis";
import { SectionPanel } from "@/components/molecules/section-panel";
import { AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

interface InsightThesisProps {
  insight: InsightData;
}

export function InsightThesis({ insight }: InsightThesisProps) {
  return (
    <SectionPanel title="Investment Thesis">
      <div className="space-y-6">

        {/* Main thesis */}
        <div>
          <p style={{ fontSize: 14, color: "var(--qc-ink-2)", lineHeight: 1.7 }}>{insight.thesis}</p>
        </div>

        {/* Evidence */}
        {insight.evidence.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} style={{ color: "var(--qc-ink-2)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Supporting Evidence
              </span>
            </div>
            <div className="space-y-2">
              {insight.evidence.map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: "var(--qc-up)" }} />
                  <p style={{ fontSize: 13, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>{e}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watch-outs */}
        {insight.watch_outs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} style={{ color: "var(--qc-warn)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Watch-Outs
              </span>
            </div>
            <div className="space-y-2">
              {insight.watch_outs.map((w, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--qc-warn)" }} />
                  <p style={{ fontSize: 13, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>{w}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
