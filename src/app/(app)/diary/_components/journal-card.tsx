"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2, Check, X, Loader2, Wallet, Eye, BookOpen } from "lucide-react";
import { Badge } from "@/components/ds";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import type { Journal, JournalKind } from "@/types/journal";

const KIND_META: Record<JournalKind, { label: string; icon: typeof Wallet }> = {
  holdings: { label: "Auto-synced", icon: Wallet },
  tracking: { label: "Watchlist", icon: Eye },
  custom:   { label: "Custom", icon: BookOpen },
};

export function JournalCard({ journal, onChanged }: { journal: Journal; onChanged: () => void }) {
  const { renameJournal, deleteJournal, mutating } = useJournalMutations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(journal.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const meta = KIND_META[journal.kind];
  const KindIcon = meta.icon;
  const editable = journal.kind === "custom"; // defaults can't be renamed/deleted

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function saveRename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === journal.name) { setRenaming(false); setName(journal.name); return; }
    setError(null);
    renameJournal(journal.id, trimmed, () => { setRenaming(false); onChanged(); }, (err) => setError(err));
  }

  function doDelete() {
    setError(null);
    deleteJournal(journal.id, () => { setConfirmDelete(false); onChanged(); }, (err) => setError(err));
  }

  // Rename inline editor replaces the card body header
  const cardInner = (
    <div className="flex h-full flex-col rounded-xl border border-hair bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-ink-2">
            <KindIcon className="size-4" strokeWidth={1.8} />
          </span>
          <Badge variant="muted">{meta.label}</Badge>
        </div>

        {editable && !renaming && (
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-secondary"
            >
              <MoreVertical className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-hair bg-card py-1 shadow-lg">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); setRenaming(true); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-ink hover:bg-secondary"
                >
                  <Pencil className="size-3.5" /> Rename
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); setConfirmDelete(true); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-down hover:bg-down-soft"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {renaming ? (
        <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") { setRenaming(false); setName(journal.name); } }}
            maxLength={80}
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-hair bg-card px-2 py-1 text-[15px] text-ink outline-none focus:border-hair-strong"
          />
          <button onClick={(e) => { e.preventDefault(); saveRename(); }} disabled={mutating} className="flex size-7 items-center justify-center rounded-md bg-ink text-[var(--qc-on-dark)]">
            {mutating ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          </button>
          <button onClick={(e) => { e.preventDefault(); setRenaming(false); setName(journal.name); }} className="flex size-7 items-center justify-center rounded-md border border-hair text-ink-2">
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="text-[19px] font-medium leading-tight text-ink">{journal.name}</div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="font-mono text-[12px] text-ink-3">
          {journal.tickerCount} {journal.tickerCount === 1 ? "ticker" : "tickers"}
        </span>
        {!renaming && <span className="text-[12px] font-medium text-ink transition-transform group-hover:translate-x-0.5">Open →</span>}
      </div>

      {error && <div className="mt-3 rounded-md border border-down bg-down-soft px-2.5 py-1.5 text-[11px] text-down">{error}</div>}
    </div>
  );

  // Delete confirmation overlay (card-scoped)
  if (confirmDelete) {
    return (
      <div className="flex h-full flex-col justify-center rounded-xl border border-down/40 bg-down-soft p-5 text-center">
        <div className="mb-1 text-[15px] font-medium text-ink">Delete “{journal.name}”?</div>
        <div className="mb-4 text-[12px] leading-[1.5] text-ink-2">This removes the journal and all its tickers &amp; entries. Can&apos;t be undone.</div>
        {error && <div className="mb-3 rounded-md border border-down bg-card px-2.5 py-1.5 text-[11px] text-down">{error}</div>}
        <div className="flex justify-center gap-2">
          <button onClick={() => { setConfirmDelete(false); setError(null); }} className="rounded-md border border-hair bg-card px-3 py-1.5 text-[12px] text-ink-2">Cancel</button>
          <button onClick={doDelete} disabled={mutating} className="flex items-center gap-1.5 rounded-md bg-down px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] disabled:opacity-60">
            {mutating && <Loader2 className="size-3.5 animate-spin" />} Delete
          </button>
        </div>
      </div>
    );
  }

  // Not clickable while renaming (the input owns clicks)
  if (renaming) return <div className="group h-full">{cardInner}</div>;

  return (
    <Link href={`/diary/${journal.id}`} className="group h-full">
      {cardInner}
    </Link>
  );
}
