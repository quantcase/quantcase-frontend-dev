"use client";

import { motion, useReducedMotion } from "framer-motion";

interface QuantcaseReadBoxProps {
  read: string | null;
}

// The AI's take on the active dimension. Deliberately quiet chrome — it informs
// the entry, it doesn't compete with it.
//
// There is no loading state on purpose. The box takes no space until a read
// exists, then fades in; it never reserves height for a read that may not be
// coming. A skeleton here had to occupy the slot before we knew whether the
// ticker even had an analysis, which either left a dead gap between the
// dimension tabs and the lenses or shoved the lenses down mid-step. The
// carousel prefetches both neighbours, so a read is usually already cached and
// arrives with the card anyway.
//
// When there's no read (no analysis for the ticker, or the fetch failed) this
// renders nothing rather than an error: a missing read must never look like a
// reason not to write.
export function QuantcaseReadBox({ read }: QuantcaseReadBoxProps) {
  const reduceMotion = useReducedMotion();

  if (!read) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
      className="rounded-lg bg-secondary px-4 py-3"
    >
      {/* `interpretation` is long-form and unbounded — clamped so one verbose
          read can't make the card tower over its neighbours. */}
      <p className="line-clamp-3 text-[13px] leading-[1.55] text-ink-2">
        <span className="mono mr-1 text-[10px] font-semibold uppercase tracking-[var(--qc-track-eyebrow)] text-ink-3">
          Quantcase read ·
        </span>
        {read}
      </p>
    </motion.div>
  );
}
