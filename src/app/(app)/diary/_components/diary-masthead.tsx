"use client";

import { Display } from "@/components/ds";
import { mastheadDate } from "../_lib/diary-derive";

interface DiaryMastheadProps {
  /** Running entry count for the active journal; hidden while unknown. */
  entryCount: number | null;
}

export function DiaryMasthead({ entryCount }: DiaryMastheadProps) {
  return (
    <header className="mb-9">
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
    </header>
  );
}
