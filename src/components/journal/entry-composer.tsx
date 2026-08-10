"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import { Button } from "@/components/ui/button";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import { DEFAULT_THESIS_PROMPTS } from "@/lib/journal-ideas";
import { CONV_LABELS, SF_HINTS, dimColor, dimBg } from "@/lib/journal-format";
import { SUB_FACTORS, DIMENSION_LABEL } from "@/types/journal";
import type { Dimension, JournalEntry, ThesisHealth } from "@/types/journal";

// ── Step number bubble ────────────────────────────────────────────────────────

function StepNum({ n }: { n: number }) {
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
      style={{ background: "var(--qc-ink)", color: "var(--qc-on-dark)" }}
    >
      {n}
    </span>
  );
}

// ── Composer ─────────────────────────────────────────────────────────────────

type Mode = "note" | "thesis";

interface EntryComposerProps {
  journalId: string;
  ticker: string;
  /** Existing entry to edit; omit for a fresh entry. */
  editEntry?: JournalEntry;
  /** Called after a successful save; carries thesis health/nudge for theses. */
  onSaved: (result?: { thesisHealth: ThesisHealth | null; aiNudge: string | null }) => void;
  onCancel?: () => void;
}

export function EntryComposer({ journalId, ticker, editEntry, onSaved, onCancel }: EntryComposerProps) {
  const { addEntry, editEntry: patchEntry, mutating } = useJournalMutations();
  const isEdit = Boolean(editEntry);

  // In edit mode the type is fixed to what the entry already is.
  const [mode, setMode] = useState<Mode>(editEntry?.type ?? "note");

  // Note state
  const [noteText, setNoteText] = useState(editEntry?.type === "note" ? editEntry.noteText : "");

  // Thesis state
  const [dim, setDim] = useState<Dimension | null>(editEntry?.type === "thesis" ? editEntry.dimension : null);
  const [subFactors, setSubFactors] = useState<string[]>(editEntry?.type === "thesis" ? editEntry.subFactors : []);
  const [thesis, setThesis] = useState(editEntry?.type === "thesis" ? editEntry.thesis : "");
  const [conviction, setConviction] = useState<number>(editEntry?.type === "thesis" ? editEntry.conviction : 1);

  const [error, setError] = useState<string | null>(null);

  const canSaveNote = noteText.trim().length > 0;
  const canSaveThesis = dim !== null && thesis.trim().length > 10 && conviction > 0;
  const canSave = mode === "note" ? canSaveNote : canSaveThesis;

  function handleSaved(entry: JournalEntry) {
    if (entry.type === "thesis") onSaved({ thesisHealth: entry.thesisHealth, aiNudge: entry.aiNudge });
    else onSaved();
  }

  function save() {
    if (!canSave) return;
    setError(null);
    const body =
      mode === "note"
        ? { noteText: noteText.trim() }
        : { dimension: dim as Dimension, subFactors, thesis: thesis.trim(), conviction };

    if (isEdit && editEntry) {
      patchEntry(editEntry.id, body, handleSaved, setError);
    } else {
      addEntry(journalId, ticker, body, handleSaved, setError);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Note | Thesis switch — locked in edit mode (type can't change) */}
      {!isEdit && (
        <TabToggle
          variant="outline"
          options={["note", "thesis"]}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          className="[&_button]:capitalize"
        />
      )}

      {/* ── NOTE ── */}
      {mode === "note" && (
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Jot an observation — a price level, a catalyst, a question to revisit…"
          rows={4}
          className="w-full resize-none rounded-md border border-hair bg-card px-3 py-2.5 text-[14px] leading-[1.55] text-ink outline-none focus:border-hair-strong"
        />
      )}

      {/* ── THESIS ── */}
      {mode === "thesis" && (
        <div className="flex flex-col gap-5">
          {/* Step 1 — dimension */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-2">
              <StepNum n={1} /> Which dimension drove your decision?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["M", "O", "D"] as const).map((d) => {
                const sel = dim === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setDim(d); setSubFactors([]); }}
                    className="flex flex-col gap-1.5 rounded-xl border px-3 py-3 text-left transition-all"
                    style={{
                      borderWidth: 1.5,
                      borderColor: sel ? dimColor(d) : "var(--qc-hair)",
                      background: sel ? dimBg(d) : "var(--qc-card)",
                    }}
                  >
                    <span className="serif text-[26px] italic leading-none" style={{ color: sel ? dimColor(d) : "var(--qc-ink-3)" }}>{d}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-2">{DIMENSION_LABEL[d]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — sub-factors */}
          {dim && (
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: dimColor(dim) }}>
                <StepNum n={2} /> What specifically drove your view?
              </div>
              <TagMultiPicker
                options={SUB_FACTORS[dim]}
                selected={subFactors}
                onChange={setSubFactors}
                uppercase={false}
                placeholder="Pick sub-factors…"
              />
              {subFactors.length > 0 && SF_HINTS[subFactors[subFactors.length - 1]] && (
                <div className="mt-2 rounded-md border border-hair bg-secondary px-3 py-2 text-[11px] leading-[1.4] text-ink-2">
                  {SF_HINTS[subFactors[subFactors.length - 1]]}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — thesis text */}
          {dim && (
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-2">
                <StepNum n={3} /> Write your thesis in one or two sentences
              </div>
              <div className="relative">
                <textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Why do you own this? What has to be true for it to work?"
                  className="serif w-full resize-none rounded-md border border-hair bg-card px-3.5 py-3 text-[15px] italic leading-[1.55] text-ink outline-none focus:border-hair-strong"
                />
                <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-ink-3">
                  {thesis.length}/300
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-ink-2">Prompts:</span>
                {DEFAULT_THESIS_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setThesis(p)}
                    title={p}
                    className="rounded-md border px-2 py-0.5 text-[11px]"
                    style={{ color: "var(--qc-brand-accent)", background: "var(--qc-brand-accent-soft)", borderColor: "var(--qc-brand-accent-edge)" }}
                  >
                    {p.length > 42 ? `${p.slice(0, 41).trimEnd()}…` : p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — conviction */}
          {dim && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-2">
                <StepNum n={4} /> How much conviction do you have?
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {CONV_LABELS.map((c, i) => {
                  const n = i + 1;
                  const sel = conviction === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setConviction(n)}
                      className="rounded-lg border px-1.5 py-2 text-center transition-all"
                      style={{
                        borderWidth: 1.5,
                        borderColor: sel ? "var(--qc-warn)" : "var(--qc-hair)",
                        background: sel ? "var(--qc-warn-soft)" : "var(--qc-card)",
                      }}
                    >
                      <span className="mb-1.5 flex justify-center gap-[3px]">
                        {Array.from({ length: 5 }).map((_, d) => (
                          <span
                            key={d}
                            className="size-2 rounded-full"
                            style={{ background: d < n ? "var(--qc-warn)" : "var(--qc-hair)" }}
                          />
                        ))}
                      </span>
                      <span className="block text-[10px] font-bold text-ink-2">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">{error}</div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={mutating}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={save} disabled={!canSave || mutating}>
          {mutating && <Loader2 className="size-3.5 animate-spin" />}
          {isEdit ? "Save changes" : mode === "note" ? "Add note" : "Save thesis"}
        </Button>
      </div>
    </div>
  );
}
