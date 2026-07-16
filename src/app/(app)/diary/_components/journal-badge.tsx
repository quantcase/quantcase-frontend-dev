"use client";

import { Briefcase, List } from "lucide-react";

import { journalIcon } from "../_lib/diary-derive";
import type { JournalRef } from "../_lib/diary-derive";

interface JournalBadgeProps {
  journal: JournalRef;
  /** Journals beyond this one, rendered as "+N" — a ticker can be in several. */
  extraCount?: number;
}

// Names the journal a ticker is filed under. Deliberately neutral chrome
// (`text-ink-3`, no fill): the semantic palette means positive/negative, and
// which list a stock sits in is neither — the card's status label already owns
// the one colored mark. The icon splits owned (briefcase) from followed (list),
// which is the only distinction here worth a glyph.
export function JournalBadge({ journal, extraCount = 0 }: JournalBadgeProps) {
  const Icon = journalIcon(journal.kind) === "holdings" ? Briefcase : List;

  return (
    <span
      className="flex min-w-0 items-center gap-1.5 text-ink-3"
      title={journal.name}
    >
      <Icon aria-hidden className="size-3 shrink-0" strokeWidth={1.75} />
      <span className="mono truncate text-[11px]">{journal.name}</span>
      {extraCount > 0 && (
        <span className="mono shrink-0 text-[11px] text-ink-3">+{extraCount}</span>
      )}
    </span>
  );
}
