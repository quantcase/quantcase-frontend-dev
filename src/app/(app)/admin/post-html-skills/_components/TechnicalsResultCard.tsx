"use client";

import { useState } from "react";
import { ChevronDown, ArrowUp, ArrowDown, Minus, AlertTriangle } from "lucide-react";
import type { TechnicalsResponse } from "@/types/technicals";

function fmtPrice(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** Compact admin view of one ticker's stored technicals insight + raw JSON. */
export function TechnicalsResultCard({ symbol, data }: { symbol: string; data: TechnicalsResponse }) {
  const [open, setOpen] = useState(true);
  const di = data.decisionIntelligence ?? null;
  const scores = data.scores ?? null;
  const cls = data.stockClassification ?? null;

  const finalScore = scores?.final_score ?? null;
  const prevScore = di?.previousScore ?? null;
  // Derive the arrow from the score delta — directionFlag is known-inverted (doc caveat).
  const delta = finalScore != null && prevScore != null ? finalScore - prevScore : null;

  return (
    <div className="rounded-[10px] border border-hair bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
      >
        <span className="text-[13px] font-semibold text-ink font-mono">{symbol}</span>
        {di?.tag && <span className="text-[12px] text-ink-2 truncate">{di.tag}</span>}
        <div className="flex-1" />
        {cls?.stock_type && (
          <span className="text-[10px] font-medium rounded-sm px-2 py-0.5 bg-secondary text-ink-2">{cls.stock_type}</span>
        )}
        {finalScore != null && (
          <span className="flex items-center gap-1 font-mono text-[12px] text-ink">
            {finalScore}
            {scores?.grade && <span className="text-ink-3">/{scores.grade}</span>}
          </span>
        )}
        {delta != null && (
          <span
            className={`flex items-center gap-0.5 text-[10px] font-medium rounded-sm px-1.5 py-0.5 ${
              delta > 0 ? "bg-up-soft text-up" : delta < 0 ? "bg-down-soft text-down" : "bg-secondary text-ink-2"
            }`}
          >
            {delta > 0 ? <ArrowUp className="size-3" /> : delta < 0 ? <ArrowDown className="size-3" /> : <Minus className="size-3" />}
            {Math.abs(delta)}
          </span>
        )}
        <ChevronDown className={`size-3.5 text-ink-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-hair px-4 py-3 space-y-3 bg-secondary">
          {cls?.wyckoff_growth_warning && (
            <div className="flex items-start gap-2 rounded-md border border-warn bg-warn-soft px-3 py-2 text-[12px] text-warn">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" /> {cls.wyckoff_growth_warning}
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-[12px]">
            {di?.convictionLevel && (
              <span className="text-ink-2">Conviction <span className="text-ink font-medium">{di.convictionLevel}</span>{di.convictionScore != null && <span className="font-mono text-ink-3"> ({di.convictionScore})</span>}</span>
            )}
            {scores?.label && <span className="text-ink-2">Grade <span className="text-ink font-medium">{scores.label}</span></span>}
            {di?.lens && <span className="text-ink-2">Lens <span className="text-ink font-medium">{di.lens}</span></span>}
            {di?.idealFor && <span className="text-ink-2">Ideal for <span className="text-ink font-medium">{di.idealFor}</span></span>}
          </div>

          {di?.currentRegime?.label && (
            <div>
              <p className="text-[13px] font-medium text-ink">{di.currentRegime.label}</p>
              {di.currentRegime.description && <p className="text-[12px] text-ink-2 leading-relaxed mt-0.5">{di.currentRegime.description}</p>}
            </div>
          )}

          {di?.levelsToWatch && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
              <span className="text-ink-2">Immediate <span className="font-mono text-ink">{fmtPrice(di.levelsToWatch.immediate?.price)}</span></span>
              <span className="text-ink-2">Structural <span className="font-mono text-ink">{fmtPrice(di.levelsToWatch.structural?.price)}</span></span>
              <span className="text-ink-2">Regime <span className="font-mono text-ink">{fmtPrice(di.levelsToWatch.regime?.price)}</span></span>
            </div>
          )}

          {di?.priorityWatchout && (
            <p className="text-[12px] text-ink leading-relaxed"><span className="text-ink-3">Watchout: </span>{di.priorityWatchout}</p>
          )}

          {!di && (
            <p className="text-[12px] text-ink-3">Insight still generating — no narrative stored yet.</p>
          )}

          <details className="pt-1">
            <summary className="text-[11px] text-ink-3 cursor-pointer hover:text-ink">Raw JSON</summary>
            <pre className="mt-2 rounded-md bg-card border border-hair p-3 text-[11px] text-ink overflow-x-auto whitespace-pre-wrap max-h-[360px] overflow-y-auto">
              {JSON.stringify({ decisionIntelligence: di, scores, stockClassification: cls, ruleEngine: data.ruleEngine ?? null }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
