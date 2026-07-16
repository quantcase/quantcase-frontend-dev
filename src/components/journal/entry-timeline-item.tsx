"use client";

import { useState } from "react";
import { Pencil, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { renderMd } from "@/lib/render-md";
import { timeAgo } from "@/lib/utils";
import { ThesisHealthBadge } from "./thesis-health-badge";
import { EntryComposer } from "./entry-composer";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import { dimColor, dimBg } from "@/lib/journal-format";
import { DIMENSION_LABEL } from "@/types/journal";
import type { JournalEntry } from "@/types/journal";

interface Props {
  entry: JournalEntry;
  journalId: string;
  /** The journal this entry is filed under. Set only when the surrounding list
   *  spans several — null keeps the badge off a single-journal timeline. */
  journalName?: string | null;
  ticker: string;
  onChanged: () => void;
}

export function EntryTimelineItem({ entry, journalId, journalName, ticker, onChanged }: Props) {
  const { deleteEntry, evaluateEntry, mutating } = useJournalMutations();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"delete" | "evaluate" | null>(null);

  if (editing) {
    return (
      <div className="rounded-lg border border-hair bg-card p-3">
        <EntryComposer
          journalId={journalId}
          ticker={ticker}
          editEntry={entry}
          onSaved={() => { setEditing(false); onChanged(); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const isThesis = entry.type === "thesis";

  return (
    <div
      className="rounded-lg border bg-card p-3.5"
      style={{ borderColor: "var(--qc-hair)" }}
    >
      {/* Header row — type/dimension + timestamp + actions */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isThesis ? (
            <span
              className="rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]"
              style={{ color: dimColor(entry.dimension), background: dimBg(entry.dimension) }}
            >
              {DIMENSION_LABEL[entry.dimension]}
            </span>
          ) : (
            <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-2">
              Note
            </span>
          )}
          {isThesis && <ThesisHealthBadge health={entry.thesisHealth} />}
          {/* Which journal this is filed under — neutral chrome, not a semantic
              color: health is the only meaning this row carries. */}
          {journalName && (
            <span className="text-[10px] text-ink-3">{journalName}</span>
          )}
        </div>
        <span className="shrink-0 font-mono text-[10px] text-ink-3">{timeAgo(entry.createdAt)}</span>
      </div>

      {/* Body */}
      {isThesis ? (
        <>
          <p className="serif mb-2 text-[14px] italic leading-[1.5] text-ink-2">
            &ldquo;{renderMd(entry.thesis)}&rdquo;
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Conviction dots */}
            <span className="flex gap-[3px]">
              {Array.from({ length: 5 }).map((_, d) => (
                <span
                  key={d}
                  className="size-2 rounded-full"
                  style={{ background: d < entry.conviction ? "var(--qc-warn)" : "var(--qc-hair)" }}
                />
              ))}
            </span>
            {entry.subFactors.length > 0 && (
              <span className="text-[10px] text-ink-3">{entry.subFactors.join(" · ")}</span>
            )}
          </div>
          {entry.aiNudge && (
            <div
              className="mt-2.5 rounded-md border px-3 py-2 text-[11px] leading-[1.5]"
              style={
                entry.thesisHealth === "broken"
                  ? { background: "var(--qc-down-soft)", borderColor: "var(--qc-down)", color: "var(--qc-down)" }
                  : { background: "var(--qc-warn-soft)", borderColor: "var(--qc-warn)", color: "var(--qc-warn)" }
              }
            >
              <span className="mr-1.5 text-[10px] font-bold uppercase tracking-[0.08em]">🤖 AI check:</span>
              {entry.aiNudge}
            </div>
          )}
        </>
      ) : (
        <p className="text-[14px] leading-[1.55] text-ink">{renderMd(entry.noteText)}</p>
      )}

      {/* Footer actions */}
      <div className="mt-3 flex items-center gap-1 border-t border-hair pt-2.5">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-2 hover:bg-secondary"
        >
          <Pencil className="size-3" /> Edit
        </button>
        {isThesis && (
          <button
            onClick={() => { setBusy("evaluate"); evaluateEntry(entry.id, () => { setBusy(null); onChanged(); }, () => setBusy(null)); }}
            disabled={mutating}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-2 hover:bg-secondary disabled:opacity-50"
          >
            {busy === "evaluate" ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />} Re-evaluate
          </button>
        )}
        <div className="ml-auto">
          {confirmDelete ? (
            <span className="flex items-center gap-1.5">
              <span className="text-[11px] text-ink-3">Delete?</span>
              <button
                onClick={() => { setBusy("delete"); deleteEntry(entry.id, () => { setBusy(null); onChanged(); }, () => setBusy(null)); }}
                disabled={mutating}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-down hover:bg-down-soft disabled:opacity-50"
              >
                {busy === "delete" ? <Loader2 className="size-3 animate-spin" /> : null} Yes
              </button>
              <button onClick={() => setConfirmDelete(false)} className="rounded-md px-2 py-1 text-[11px] text-ink-2 hover:bg-secondary">
                No
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-3 hover:bg-down-soft hover:text-down"
            >
              <Trash2 className="size-3" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
