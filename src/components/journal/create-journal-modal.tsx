"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import type { Journal } from "@/types/journal";

interface Props {
  onClose: () => void;
  /** Called with the newly created journal. */
  onCreated: (journal: Journal) => void;
}

export function CreateJournalModal({ onClose, onCreated }: Props) {
  const { createJournal, mutating } = useJournalMutations();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const canSave = trimmed.length >= 1 && trimmed.length <= 80;

  function handleSubmit() {
    if (!canSave) return;
    setError(null);
    createJournal(trimmed, (journal) => onCreated(journal), (err) => setError(err));
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-2xl border border-hair bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="mb-1 flex items-start justify-between">
          <h2 className="text-[18px] font-medium text-ink">New journal</h2>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-md border border-hair text-ink-2 hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>
        <p className="mb-4 text-[13px] leading-[1.5] text-ink-2">
          A journal tracks a set of tickers. Add notes and theses to any of them.
        </p>

        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ink-3">
          Journal name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          maxLength={80}
          autoFocus
          placeholder="e.g. My Picks"
        />

        {error && (
          <div className="mt-3 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">{error}</div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutating}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSave || mutating}>
            {mutating && <Loader2 className="size-3.5 animate-spin" />}
            Create journal
          </Button>
        </div>
      </div>
    </div>
  );
}
