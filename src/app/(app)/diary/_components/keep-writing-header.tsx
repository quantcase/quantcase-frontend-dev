"use client";

import { useMemo } from "react";

import { computeStreak } from "../_lib/diary-derive";

interface KeepWritingHeaderProps {
  /** Tickers still without a thesis. */
  pendingCount: number;
  /** Entry timestamps we can see — see G3 on why this is partial. */
  dates: string[];
  /** Carousel position controls, rendered here to mirror the holdings header. */
  nav?: React.ReactNode;
}

export function KeepWritingHeader({ pendingCount, dates, nav }: KeepWritingHeaderProps) {
  const streak = useMemo(() => computeStreak(dates), [dates]);

  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="eyebrow">
          Keep writing
          {/* Suppress rather than render "0 to go" — done is done, not a target */}
          {pendingCount > 0 && <> · {pendingCount} to go</>}
        </div>

        {/* Streak sits under the title, the way the holdings total sits under
            its own — the eyebrow names the section, the line below measures it. */}
        <div className="mt-1 text-[13px] text-ink-2">
          {streak > 0 && <span>{streak}-day streak</span>}
        </div>
      </div>

      {nav}
    </div>
  );
}
