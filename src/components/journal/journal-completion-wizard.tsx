"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Flame } from "lucide-react";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import { WizardStockContext } from "./wizard-stock-context";
import {
  WizardThesisFields,
  isThesisComplete,
  type ThesisFieldsState,
} from "./wizard-thesis-fields";
import type { JournalTicker, ThesisBody } from "@/types/journal";

// ── Per-stock draft state ──────────────────────────────────────────────────────

const EMPTY_DRAFT: ThesisFieldsState = { dim: null, subFactors: [], thesis: "", conviction: 0 };

interface Props {
  journalId: string;
  /** The tickers to walk through — typically the journal's pending (no-thesis) tickers. */
  tickers: JournalTicker[];
  onClose: () => void;
  /** Fired after any successful save so the parent table can refetch. */
  onChanged?: () => void;
}

// A multi-stock guided drawer that walks the user through writing a thesis for
// each pending ticker in a journal, one stock per step. Matches the
// "Complete your investment journal" flow: a stock stepper header, a per-stock
// context block, four thesis questions, and Skip / Save-for-later / Save & next
// controls in the footer.
export function JournalCompletionWizard({ journalId, tickers, onClose, onChanged }: Props) {
  const { addEntry, mutating } = useJournalMutations();

  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, ThesisFieldsState>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const total = tickers.length;
  const current = tickers[index] ?? null;
  const currentDraft = current ? drafts[current.ticker] ?? EMPTY_DRAFT : EMPTY_DRAFT;
  const complete = isThesisComplete(currentDraft);
  const isLast = index >= total - 1;

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setDraft = (next: ThesisFieldsState) => {
    if (!current) return;
    setDrafts((prev) => ({ ...prev, [current.ticker]: next }));
  };

  const goTo = (next: number) => {
    if (next < 0 || next >= total) return;
    setError(null);
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  // Advance to the next unsaved stock, or close if this was the last one.
  const advanceOrClose = () => {
    const nextPending = tickers.findIndex((t, i) => i > index && !saved.has(t.ticker));
    if (nextPending === -1) onClose();
    else goTo(nextPending);
  };

  const saveCurrent = () => {
    if (!current || !complete) return;
    setError(null);
    const body: ThesisBody = {
      dimension: currentDraft.dim!,
      subFactors: currentDraft.subFactors,
      thesis: currentDraft.thesis.trim(),
      conviction: currentDraft.conviction,
    };
    addEntry(
      journalId,
      current.ticker,
      body,
      () => {
        setSaved((prev) => new Set(prev).add(current.ticker));
        onChanged?.();
        advanceOrClose();
      },
      (err) => setError(err),
    );
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
  };

  if (total === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="wizard"
        className="fixed inset-0 z-[200] flex justify-end"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          className="relative flex h-full w-full max-w-[640px] flex-col border-l border-hair bg-card shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        >
          {/* ── Header ── */}
          <div className="shrink-0 border-b border-hair px-6 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
                  <Flame className="size-3.5" style={{ color: "var(--qc-warn)" }} />
                  Complete your investment journal
                </div>
                <div className="serif text-[24px] italic leading-tight text-ink">
                  {index + 1} of {total} — {current?.ticker}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex size-8 shrink-0 items-center justify-center rounded-md border border-hair text-ink-2 hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Stock stepper ── */}
          <div className="shrink-0 overflow-x-auto border-b border-hair bg-section px-6 py-4">
            <div className="flex min-w-max items-center">
              {tickers.map((t, i) => {
                const done = saved.has(t.ticker);
                const active = i === index;
                return (
                  <div key={t.ticker} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      className="flex flex-col items-center gap-1.5 px-1"
                    >
                      <span
                        className="flex size-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors"
                        style={{
                          background: active
                            ? "var(--qc-brand-accent)"
                            : done
                              ? "var(--qc-ink)"
                              : "var(--qc-card)",
                          color: active || done ? "var(--qc-on-dark)" : "var(--qc-ink-3)",
                          border: active || done ? "none" : "1.5px solid var(--qc-hair)",
                        }}
                      >
                        {done ? <Check className="size-4" /> : i + 1}
                      </span>
                      <span
                        className="max-w-[72px] truncate font-mono text-[10px] font-semibold uppercase tracking-[0.06em]"
                        style={{ color: active ? "var(--qc-brand-accent)" : "var(--qc-ink-3)" }}
                      >
                        {t.ticker}
                      </span>
                    </button>
                    {i < total - 1 && (
                      <span
                        className="mx-1 h-px w-8 shrink-0 sm:w-14"
                        style={{ background: "var(--qc-hair)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={current?.ticker ?? index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col gap-6"
              >
                {current && (
                  <>
                    <WizardStockContext ticker={current.ticker} market={current.market} />
                    <div className="h-px bg-hair" />
                    <WizardThesisFields value={currentDraft} onChange={setDraft} />
                  </>
                )}
                {error && (
                  <div className="rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
                    {error}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 flex items-center justify-between gap-3 border-t border-hair bg-card px-6 py-4">
            <button
              type="button"
              onClick={advanceOrClose}
              disabled={mutating}
              className="text-[13px] text-ink-2 transition-colors hover:text-ink disabled:opacity-40"
            >
              {isLast ? "Skip this stock" : "Skip this stock →"}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={mutating}
                className="rounded-md border border-hair px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-secondary disabled:opacity-40"
              >
                Save for later
              </button>
              <button
                type="button"
                onClick={saveCurrent}
                disabled={!complete || mutating}
                className="inline-flex items-center gap-1.5 rounded-md px-5 py-2 text-[13px] font-semibold text-[var(--qc-on-dark)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "var(--qc-ink)" }}
              >
                {mutating && <Loader2 className="size-3.5 animate-spin" />}
                {isLast ? "Save & finish" : "Save & next →"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
