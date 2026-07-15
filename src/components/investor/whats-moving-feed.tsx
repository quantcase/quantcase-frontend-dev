"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { MonoLabel, LimeCountPip } from "@/components/ds";
import { formatPrice, cn } from "@/lib/utils";
import type { WhatsMovingItem, WhatsMovingKind } from "@/types/investor-dashboard";

interface WhatsMovingFeedProps {
  count: number;
  items: WhatsMovingItem[];
  loading?: boolean;
}

// Kind → semantic text color for the headline label (meaning: up/down/earnings).
const kindTextClass: Record<WhatsMovingKind, string> = {
  score_upgrade: "text-up",
  score_downgrade: "text-down",
  earnings: "text-warn",
};

function scoreDotClass(score: number) {
  if (score >= 70) return "bg-up";
  if (score >= 50) return "bg-warn";
  return "bg-down";
}

// Signed percent for the price delta, e.g. 0.9 → "↑0.9%", -1.4 → "↓1.4%"
function fmtPriceChange(pct: number): string {
  const arrow = pct >= 0 ? "↑" : "↓";
  return `${arrow}${Math.abs(pct).toFixed(1)}%`;
}

export function WhatsMovingFeed({ count, items, loading }: WhatsMovingFeedProps) {
  return (
    <div className="rounded-[10px] border border-hair bg-[var(--qc-section)] p-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3.5 text-ink-2" />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">What&apos;s moving in your stocks</MonoLabel>
          <LimeCountPip count={count} />
        </div>
      </div>

      {/* Subtitle */}
      <div className="-mt-2 px-2 pb-2 text-[12px] text-ink-3">
        Updates on stocks you hold or watch · scored by QC Insight
      </div>

      {/* Inner white card */}
      <div className="overflow-hidden rounded-[10px] bg-card">
        {items.length === 0 && (
          <div className="px-[18px] py-7 text-center text-[12px] text-ink-3">
            {loading ? "Loading…" : "Nothing moving in your stocks right now."}
          </div>
        )}
        {items.map((item, idx) => {
          const up = item.price_change_pct >= 0;
          return (
            <Link key={item.id} href={item.href} className="moving-feed-row block no-underline">
              <div className={cn("px-[18px] py-3.5 transition-colors", idx !== 0 && "border-t border-[var(--qc-hair-2)]")}>
                {/* Mobile: symbol + price inline above body */}
                <div className="mb-2 flex items-start gap-4 sm:hidden">
                  <div className="min-w-[80px] shrink-0">
                    <div className="text-[13px] font-semibold leading-[1.3] tracking-[0.02em] text-ink">{item.symbol}</div>
                    <div className={cn("mt-0.5 font-mono text-[11px] tracking-[0.01em]", up ? "text-up" : "text-down")}>
                      {formatPrice(item.price)}
                      <span className="ml-1 opacity-85">{fmtPriceChange(item.price_change_pct)}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <span className={cn("size-1.5 shrink-0 rounded-full", scoreDotClass(item.qc_score))} />
                    <span className="font-mono text-[14px] font-semibold text-ink">{item.qc_score}</span>
                  </div>
                </div>

                {/* Desktop: symbol · body · score — body no longer stretches to
                    create a dead zone; the QC score sits right after the text. */}
                <div className="hidden items-center gap-5 sm:flex">
                  {/* Symbol + price */}
                  <div className="w-[100px] shrink-0">
                    <div className="text-[13px] font-semibold leading-[1.3] tracking-[0.02em] text-ink">{item.symbol}</div>
                    <div className={cn("mt-0.5 font-mono text-[11px] tracking-[0.01em]", up ? "text-up" : "text-down")}>
                      {formatPrice(item.price)}
                      <span className="ml-1 opacity-85">{fmtPriceChange(item.price_change_pct)}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-baseline gap-1.5">
                      <span className={cn("whitespace-nowrap text-[12px] font-semibold", kindTextClass[item.kind])}>
                        {item.headline_label}
                      </span>
                      {item.headline_detail && (
                        <span className="font-mono text-[12px] font-normal text-ink-2">{item.headline_detail}</span>
                      )}
                    </div>
                    <div className="mb-1.5 line-clamp-2 text-[12px] leading-[1.55] text-ink-2">{item.body}</div>
                    <div className="text-[11px] tracking-[0.01em] text-ink-3">{item.holding_detail}</div>
                  </div>

                  {/* QC Score — fixed narrow column, close to the body */}
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="font-mono text-[9px] font-semibold uppercase tracking-[var(--qc-track-eyebrow-l)] text-ink-3">QC SCORE</div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-1.5 shrink-0 rounded-full", scoreDotClass(item.qc_score))} />
                      <span className="font-mono text-[15px] font-semibold text-ink">{item.qc_score}</span>
                    </div>
                  </div>
                </div>

                {/* Body (mobile only) */}
                <div className="sm:hidden">
                  <div className="mb-1 flex flex-wrap items-baseline gap-1.5">
                    <span className={cn("whitespace-nowrap text-[12px] font-semibold", kindTextClass[item.kind])}>
                      {item.headline_label}
                    </span>
                    {item.headline_detail && (
                      <span className="font-mono text-[12px] font-normal text-ink-2">{item.headline_detail}</span>
                    )}
                  </div>
                  <div className="mb-1.5 line-clamp-2 text-[12px] leading-[1.55] text-ink-2">{item.body}</div>
                  <div className="text-[11px] tracking-[0.01em] text-ink-3">{item.holding_detail}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .moving-feed-row:hover > div {
          background: var(--qc-section, #f5f5f5) !important;
        }
      `}</style>
    </div>
  );
}
