"use client";

import { entryStatus, entryExcerpt, relativeTime, primaryJournal, ENTRY_STATUS_CONFIG } from "../_lib/diary-derive";
import type { DiaryTicker } from "../_lib/diary-derive";
import { JournalBadge } from "./journal-badge";

interface EntryStripCardProps {
  t: DiaryTicker;
  onClick: () => void;
}

// One card in the YOUR ENTRIES strip: a rail and label colored by how far along
// the writing is, the last thing you wrote, and when.
//
// Rail and label share one color from ENTRY_STATUS_CONFIG so the card reads at a
// glance — the color IS the status, stated twice. They used to come from
// different axes (health vs. status) and could contradict each other.
export function EntryStripCard({ t, onClick }: EntryStripCardProps) {
  const status = entryStatus(t);
  const excerpt = entryExcerpt(t.latestEntry);
  const { label, color } = ENTRY_STATUS_CONFIG[status];
  const journal = primaryJournal(t);

  return (
    <button
      onClick={onClick}
      aria-label={`Open ${t.ticker} entries`}
      className="group relative flex h-[190px] w-[248px] shrink-0 flex-col overflow-hidden rounded-xl border border-hair bg-card p-4 pt-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--qc-shadow-annot)]"
    >
      {/* Status rail. Full-bleed and pulled out over the 1px border so it meets
          the card's true top edge; the card's own `overflow-hidden` + `rounded-xl`
          then clip it to the corner curve. Insetting it instead (as this first
          did) leaves it floating below the edge with square ends. */}
      <span
        aria-hidden
        className="absolute -inset-x-px -top-px h-[3px]"
        style={{ background: color }}
      />

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="mono text-[13px] font-semibold text-ink">{t.ticker}</span>
        {/* Bare colored text, not a chip: the rail already carries the color, and
            a filled badge on top of it made two competing marks for one fact. */}
        <span
          className="mono shrink-0 text-[10px] font-semibold uppercase tracking-[var(--qc-track-eyebrow)]"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      {excerpt ? (
        <p className="serif line-clamp-4 text-[14px] italic leading-[1.5] text-ink-2">&ldquo;{excerpt}&rdquo;</p>
      ) : (
        <p className="text-[13px] leading-[1.5] text-ink-3">
          Nothing written yet — {t.name ?? t.ticker} is waiting on your reasoning.
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-hair pt-3">
        {journal ? (
          <JournalBadge journal={journal} extraCount={t.journals.length - 1} />
        ) : (
          <span />
        )}
        <span className="mono shrink-0 text-[11px] text-ink-3">
          {relativeTime(t.latestEntry?.createdAt ?? t.addedAt)}
        </span>
      </div>
    </button>
  );
}
