"use client";

import { Display } from "@/components/ds";
import { mastheadDate } from "../_lib/diary-derive";
import { StockSearch } from "@/components/molecules/stock-search";

interface DiaryMastheadProps {
  /** Running entry count for the active journal; hidden while unknown. */
  entryCount: number | null;
}

export function DiaryMasthead({ entryCount }: DiaryMastheadProps) {
  return (
    <header className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <div className="eyebrow">
          {mastheadDate()}
          {entryCount != null && entryCount > 0 && (
            <>
              {" · "}
              <span className="mono">ENTRY {entryCount}</span>
            </>
          )}
        </div>

        <Display as="h1" italic className="mt-3 text-[44px] leading-[1.05]">
          Your investment diary
        </Display>

        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.5] text-ink-2">
          A quiet place to keep your reasoning. Everything you own, everything you&rsquo;re watching, and the
          words you&rsquo;d want to hear back a year from now.
        </p>
      </div>

      {/* Leaves the sidebar avatar clear while staying the page's top-right action. */}
      <div className="shrink-0 sm:pt-1">
        <StockSearch />
      </div>
    </header>
  );
}
