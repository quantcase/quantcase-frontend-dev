"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

import { useJournalMutations } from "@/hooks/useJournalMutations";
import type { Journal } from "@/types/journal";

interface JournalTabsProps {
  journals: Journal[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onChanged: () => void;
  /** Called with the deleted id so the page can move off it before refetching. */
  onDeleted: (id: string) => void;
}

// The watchlist switcher. Pills are the section's navigation — selecting one
// swaps the active journal inline; nothing routes. Rename/delete live behind a
// menu on the active pill and, as before, only custom journals are editable —
// the backend owns the two defaults.
//
// Renders no heading of its own: it sits directly under "On your watchlist" as
// that section's navigation, so a second title would be naming the same thing
// twice. Holdings are filtered out upstream — they have their own UI.
export function JournalTabs({ journals, activeId, onSelect, onCreate, onChanged, onDeleted }: JournalTabsProps) {
  const { renameJournal, deleteJournal, mutating } = useJournalMutations();

  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuFor) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuFor]);

  function startRename(j: Journal) {
    setMenuFor(null);
    setDraftName(j.name);
    setRenamingId(j.id);
  }

  function saveRename(j: Journal) {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === j.name) { setRenamingId(null); return; }
    setError(null);
    renameJournal(j.id, trimmed, () => { setRenamingId(null); onChanged(); }, setError);
  }

  function doDelete(j: Journal) {
    setError(null);
    // Hand the id up first: the page must move off this journal before the
    // refetch, or useJournalDetail re-fetches a dead id and 404s.
    deleteJournal(j.id, () => { setConfirmId(null); onDeleted(j.id); onChanged(); }, setError);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {journals.map((j) => {
          const active = j.id === activeId;
          const editable = j.kind === "custom";

          if (renamingId === j.id) {
            return (
              <span key={j.id} className="inline-flex items-center gap-1.5 rounded-full border border-hair-strong bg-card py-1 pl-3 pr-1">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename(j);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  maxLength={80}
                  autoFocus
                  aria-label="Watchlist name"
                  className="w-[130px] bg-transparent text-[13px] text-ink outline-none"
                />
                <button
                  onClick={() => saveRename(j)}
                  disabled={mutating}
                  aria-label="Save name"
                  className="flex size-6 items-center justify-center rounded-full bg-ink text-[var(--qc-on-dark)]"
                >
                  {mutating ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                </button>
                <button
                  onClick={() => setRenamingId(null)}
                  aria-label="Cancel rename"
                  className="flex size-6 items-center justify-center rounded-full border border-hair text-ink-2"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          }

          return (
            <span key={j.id} className="relative inline-flex">
              <button
                onClick={() => onSelect(j.id)}
                aria-current={active ? "true" : undefined}
                className={[
                  "inline-flex items-center gap-2 rounded-full border py-1.5 text-[13px] transition-colors",
                  editable ? "pl-4 pr-1.5" : "px-4",
                  active
                    ? "border-ink bg-ink text-[var(--qc-on-dark)]"
                    : "border-hair bg-card text-ink-2 hover:bg-secondary hover:text-ink",
                ].join(" ")}
              >
                {j.name}
                <span className={`mono text-[11px] ${active ? "opacity-70" : "text-ink-3"}`}>{j.tickerCount}</span>

                {editable && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Options for ${j.name}`}
                    onClick={(e) => { e.stopPropagation(); setMenuFor((m) => (m === j.id ? null : j.id)); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuFor((m) => (m === j.id ? null : j.id));
                      }
                    }}
                    className={[
                      "flex size-6 items-center justify-center rounded-full",
                      active ? "hover:bg-[rgba(255,255,255,0.14)]" : "hover:bg-hair",
                    ].join(" ")}
                  >
                    <MoreHorizontal className="size-3.5" />
                  </span>
                )}
              </button>

              {menuFor === j.id && (
                <div ref={menuRef} className="absolute right-0 top-9 z-20 w-36 rounded-lg border border-hair bg-card py-1 shadow-[var(--qc-shadow-annot)]">
                  <button
                    onClick={() => startRename(j)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-ink hover:bg-secondary"
                  >
                    <Pencil className="size-3.5" /> Rename
                  </button>
                  <button
                    onClick={() => { setMenuFor(null); setConfirmId(j.id); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-down hover:bg-down-soft"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              )}
            </span>
          );
        })}

        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-hair px-4 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
        >
          <Plus className="size-3.5" />
          Create new watchlist
        </button>
      </div>

      {/* Delete confirmation — inline, so it can't be missed behind a pill */}
      {confirmId && (() => {
        const j = journals.find((x) => x.id === confirmId);
        if (!j) return null;
        return (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-down/40 bg-down-soft px-4 py-3">
            <span className="text-[13px] text-ink">
              Delete <span className="font-medium">{j.name}</span>? Its tickers and entries go with it.
            </span>
            <span className="ml-auto flex items-center gap-2">
              <button
                onClick={() => { setConfirmId(null); setError(null); }}
                className="rounded-md border border-hair bg-card px-3 py-1.5 text-[12px] text-ink-2"
              >
                Cancel
              </button>
              <button
                onClick={() => doDelete(j)}
                disabled={mutating}
                className="flex items-center gap-1.5 rounded-md bg-down px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] disabled:opacity-60"
              >
                {mutating && <Loader2 className="size-3 animate-spin" />} Delete
              </button>
            </span>
          </div>
        );
      })()}

      {error && (
        <div className="mt-3 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">{error}</div>
      )}
    </div>
  );
}
