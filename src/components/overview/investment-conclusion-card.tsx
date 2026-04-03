"use client";

import { TabularCard } from "@/components/molecules/tabular-card";
import type { DFactorResponse } from "@/types/deal";
import type { FinalTakeaways } from "@/types/opportunity";
import type { TechnicalsResponse } from "@/types/technicals";

interface Props {
  dealData: DFactorResponse | null;
  oppTakeaways: FinalTakeaways | null;
  technicalsData: TechnicalsResponse | null;
  rating: string | null;
}

function verdictColor(rating: string | null): string {
  if (!rating) return "text-[#0F172B]";
  const r = rating.toLowerCase();
  if (r === "strong buy" || r === "buy") return "text-emerald-600";
  if (r === "sell" || r === "underperform") return "text-red-600";
  return "text-amber-600";
}

export function InvestmentConclusionCard({ dealData, oppTakeaways, technicalsData, rating }: Props) {
  const verdict = dealData?.overview?.deal_verdict;
  const entryTrigger = dealData?.target_price_matrix?.base?.target_range ?? null;
  const entryPe = dealData?.target_price_matrix?.base?.pe_rationale ?? null;

  // Market context from technicals rule engine
  const re = technicalsData?.ruleEngine;
  const marketSummary = re?.decisionContext.summary ?? null;
  const marketBiasLabel = re?.decisionContext.marketBias ?? null;
  const overallCondition = re?.decisionContext.overallCondition ?? null;
  const marketSignalCounts = marketBiasLabel && overallCondition
    ? `${marketBiasLabel} · ${overallCondition}`
    : marketBiasLabel ?? overallCondition ?? null;

  const investmentThesis = oppTakeaways?.investment_thesis ?? null;
  const keyHighlights = oppTakeaways?.key_highlights ?? [];
  const keyRisks = oppTakeaways?.key_risks ?? [];
  const bestAction = verdict?.description ?? null;
  const verdictTitle = verdict?.title ?? rating;

  const hasContent = verdictTitle || investmentThesis || bestAction;
  if (!hasContent) return null;

  return (
    <TabularCard title="Investment Conclusion">
      <div className="space-y-5">

        {/* Header row: Verdict (narrow) · Entry Trigger · Market Context */}
        <div className="flex gap-0 divide-x divide-[#E2E2E2]">

          {/* Verdict */}
          <div className="flex flex-col gap-1 pr-6" style={{ minWidth: 200 }}>
            <small className="text-[10px] uppercase tracking-wider text-[#888888] font-medium">Verdict</small>
            <p className={`text-sm font-semibold leading-snug ${verdictColor(rating)}`}>
              {verdictTitle ?? "—"}
            </p>
          </div>

          {/* Entry Trigger */}
          <div className="flex flex-col gap-1 flex-1 px-6">
            <small className="text-[10px] uppercase tracking-wider text-[#888888] font-medium">Entry Trigger</small>
            {entryTrigger ? (
              <>
                <p className="text-sm font-semibold text-[#0F172B] leading-snug">{entryTrigger}</p>
                {entryPe && (
                  <small className="text-[11px] text-[#888888]">{entryPe}</small>
                )}
              </>
            ) : (
              <p className="text-sm font-semibold text-[#888888]">—</p>
            )}
          </div>

          {/* Market Context */}
          <div className="flex flex-col gap-1 flex-1 pl-6">
            <small className="text-[10px] uppercase tracking-wider text-[#888888] font-medium">Market Context</small>
            {marketSignalCounts ? (
              <p className={`text-sm font-semibold leading-snug ${
                marketBiasLabel?.toLowerCase().includes("bear") ? "text-red-600" : "text-emerald-600"
              }`}>
                {marketSignalCounts}
              </p>
            ) : (
              <p className="text-sm font-semibold text-[#888888]">—</p>
            )}
            {marketSummary && (
              <small className="text-[11px] text-[#888888] line-clamp-2">{marketSummary}</small>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E2E2E2]" />

        {/* Investment thesis paragraph */}
        {investmentThesis && (
          <p className="text-sm text-[#888888] leading-relaxed">{investmentThesis}</p>
        )}

        {/* Highlights + Risks */}
        {(keyHighlights.length > 0 || keyRisks.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keyHighlights.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#0F172B] uppercase tracking-wider mb-2">Key Highlights</p>
                <ul className="space-y-0">
                  {keyHighlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#888888]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {keyRisks.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#0F172B] uppercase tracking-wider mb-2">Key Risks</p>
                <ul className="space-y-0">
                  {keyRisks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#888888]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Best Action callout box */}
        {bestAction && (
          <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-1">Best Action</p>
            <p className="text-sm font-semibold text-[#0F172B] leading-snug">{bestAction}</p>
          </div>
        )}

      </div>
    </TabularCard>
  );
}
