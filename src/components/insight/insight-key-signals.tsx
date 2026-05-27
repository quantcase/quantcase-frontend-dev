"use client";

import type { InsightKeySignal } from "@/types/analysis";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InsightKeySignalsProps {
  signals: InsightKeySignal[];
}

function SignalIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive") return <TrendingUp size={14} style={{ color: "var(--qc-up)" }} />;
  if (sentiment === "negative") return <TrendingDown size={14} style={{ color: "var(--qc-down)" }} />;
  return <Minus size={14} style={{ color: "var(--qc-ink-2)" }} />;
}

export function InsightKeySignals({ signals }: InsightKeySignalsProps) {
  if (!signals.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {signals.map((s, i) => (
        <div
          key={i}
          className="flex items-start gap-2 rounded-md px-3 py-2.5"
          style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
        >
          <div className="mt-0.5 shrink-0">
            <SignalIcon sentiment={s.sentiment} />
          </div>
          <p style={{ fontSize: 13, color: "var(--qc-ink)", lineHeight: 1.4 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
