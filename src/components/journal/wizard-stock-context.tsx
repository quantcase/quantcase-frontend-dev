"use client";

import { Zap } from "lucide-react";
import { fmtPrice, marketConvictionSentiment } from "@/lib/journal-format";
import { fmtSignedPct } from "@/lib/portfolio-format";
import type { TickerMarket } from "@/types/journal";

interface WizardStockContextProps {
  ticker: string;
  name?: string | null;
  market?: TickerMarket | null;
}

// The per-stock context block shown at the top of each wizard step: a header
// card with logo / price / QC score, plus a "what the data is saying" strip
// derived from the ticker's thesis tags. Everything here comes from real
// TickerMarket data — no fabricated dimension scores.
export function WizardStockContext({ ticker, name, market }: WizardStockContextProps) {
  const changePositive = (market?.change ?? 0) >= 0;
  const tags = market?.thesisTags ?? [];
  const conviction = market?.conviction ?? null;

  const convStyle = conviction
    ? {
        POSITIVE: { color: "var(--qc-up)", bg: "var(--qc-up-soft)", label: "Positive signal" },
        WATCH: { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", label: "On watch" },
        NEUTRAL: { color: "var(--qc-ink-2)", bg: "var(--qc-section)", label: "Neutral" },
      }[conviction]
    : null;

  return (
    <div className="rounded-2xl border border-hair bg-section p-5">
      {/* Header row: logo · name · price · QC */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="serif flex size-11 shrink-0 items-center justify-center rounded-lg text-[22px] italic text-[var(--qc-on-dark)]"
            style={{ background: "var(--qc-ink)" }}
          >
            {ticker.charAt(0)}
          </span>
          <div>
            <div className="text-[19px] font-bold leading-tight tracking-[0.01em] text-ink">
              {name ?? ticker}
            </div>
            <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
              {ticker}
            </div>
          </div>
        </div>

        <div className="text-right">
          {market?.ltp != null && (
            <div className="font-mono text-[22px] font-semibold leading-none text-ink">
              {fmtPrice(market.ltp)}
            </div>
          )}
          {market?.changePercent != null && (
            <div
              className="mt-1 font-mono text-[13px] font-medium"
              style={{ color: changePositive ? "var(--qc-up)" : "var(--qc-down)" }}
            >
              {fmtSignedPct(market.changePercent)}
            </div>
          )}
          {market?.qcScore != null && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-card px-2 py-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-3">QC</span>
              <span className="font-mono text-[13px] font-bold text-ink">{market.qcScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* What the data is saying */}
      {(tags.length > 0 || convStyle) && (
        <div className="mt-5 border-t border-hair pt-4">
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
            What the data is saying about {ticker}
          </div>
          <div className="flex flex-wrap gap-2">
            {convStyle && (
              <span
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium"
                style={{
                  color: convStyle.color,
                  background: convStyle.bg,
                  borderColor: "transparent",
                }}
              >
                <Zap className="size-3.5" style={{ color: convStyle.color }} />
                {convStyle.label}
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-hair bg-card px-2.5 py-1.5 text-[12px] font-medium text-ink-2"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Kept alongside the component so the wizard footer/summary can reuse the same
// derivation if needed later.
export { marketConvictionSentiment };
