"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fmtPrice } from "@/lib/journal-format";

import { ComposerCard } from "./composer-card";
import { prefetchQuantcaseRead } from "../_hooks/useQuantcaseRead";
import { primaryJournal } from "../_lib/diary-derive";
import type { DiaryTicker } from "../_lib/diary-derive";

interface ComposerCarouselProps {
  tickers: DiaryTicker[];
  /** Where to file a ticker that carries no journal membership. The queue is
   *  cross-journal, so each card files against its own journal first. */
  fallbackJournalId: string | null;
  onSaved: () => void;
  /** Position state, owned by the caller so the nav can live in the header. */
  pos: CarouselPos;
}

export interface CarouselPos {
  index: number;
  dir: number;
  go: (d: 1 | -1) => void;
  jumpTo: (i: number) => void;
}

/** Carousel position, held by the page so header and stack stay in step. */
export function useCarouselPos(n: number): CarouselPos {
  const [[index, dir], setPos] = useState<[number, number]>([0, 0]);

  // Saving drops a ticker out of the queue, so the array shrinks under us.
  // Without this the last save lands on an empty index.
  useEffect(() => {
    if (index > n - 1) setPos([Math.max(n - 1, 0), -1]);
  }, [n, index]);

  const go = useCallback(
    (d: 1 | -1) => setPos(([i]) => [Math.min(Math.max(i + d, 0), Math.max(n - 1, 0)), d]),
    [n],
  );
  const jumpTo = useCallback((i: number) => setPos(([cur]) => [i, i > cur ? 1 : -1]), []);

  return { index: Math.min(index, Math.max(n - 1, 0)), dir, go, jumpTo };
}

/** The prev/dots/next cluster — rendered in the section header. */
export function ComposerCarouselNav({ tickers, pos }: { tickers: DiaryTicker[]; pos: CarouselPos }) {
  const reduceMotion = useReducedMotion();
  const n = tickers.length;
  if (n <= 1) return null;

  const { index, go, jumpTo } = pos;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="pill"
        size="icon-sm"
        onClick={() => go(-1)}
        disabled={index === 0}
        aria-label="Previous stock"
      >
        <ArrowLeft className="size-4" />
      </Button>

      <span className="flex items-center gap-1.5">
        {dotWindow(index, n).map((i) => {
          const edge = isEdgeDot(i, index, n);
          return (
            <button
              key={tickers[i].ticker}
              onClick={() => jumpTo(i)}
              aria-label={`Go to ${tickers[i].ticker}`}
              aria-current={i === index ? "true" : undefined}
              className="flex size-6 items-center justify-center"
            >
              <motion.span
                layout={!reduceMotion}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                // Shrunk edge dots read as "the window continues past here".
                className={`rounded-full transition-colors ${edge ? "size-1" : "size-2"} ${
                  i === index ? "bg-ink" : "bg-ink-3"
                }`}
              />
            </button>
          );
        })}
      </span>

      <Button
        variant="pill"
        size="icon-sm"
        onClick={() => go(1)}
        disabled={index >= n - 1}
        aria-label="Next stock"
      >
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

const GHOSTS = 2; // cards visible behind the front one
const DOTS = 5; // dots rendered at once, however long the queue is

// A sliding window of at most DOTS indices, centred on the active one and
// clamped at both ends. With <= DOTS tickers every dot shows and nothing slides.
function dotWindow(active: number, n: number): number[] {
  const size = Math.min(DOTS, n);
  const start = Math.min(Math.max(active - Math.floor(size / 2), 0), n - size);
  return Array.from({ length: size }, (_, k) => start + k);
}

// An edge dot is a window boundary with more queue beyond it — the real first
// and last ticker stay full-size so the ends of the queue feel like ends.
function isEdgeDot(i: number, active: number, n: number): boolean {
  if (n <= DOTS) return false;
  const w = dotWindow(active, n);
  return (i === w[0] && i > 0) || (i === w[w.length - 1] && i < n - 1);
}

// The writing queue: one stock at a time, with the rest stacked behind so the
// work left is visible without being a list.
//
// Index is clamped, never wrapped — a queue has an end, and wrapping would make
// "3 to go" feel like a treadmill.
export function ComposerCarousel({ tickers, fallbackJournalId, onSaved, pos }: ComposerCarouselProps) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  const n = tickers.length;
  const { index: safeIndex, dir, go } = pos;

  // Warm the neighbours' AI reads so stepping feels instant. Both directions:
  // prefetching only forward left every back-step showing a shimmer. The hook
  // caches by ticker and no-ops on a hit, so re-running this is free.
  useEffect(() => {
    prefetchQuantcaseRead(tickers[safeIndex + 1]?.ticker ?? null);
    prefetchQuantcaseRead(tickers[safeIndex - 1]?.ticker ?? null);
  }, [tickers, safeIndex]);

  function onKeyDown(e: React.KeyboardEvent) {
    // Arrow keys belong to the caret while writing.
    const el = e.target as HTMLElement;
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") return;
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  }

  if (n === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-hair bg-card px-6 py-14 text-center">
        <div className="mb-1.5 text-[17px] font-medium text-ink">You&rsquo;re all caught up</div>
        <p className="mx-auto max-w-[300px] text-[13px] leading-[1.5] text-ink-2">
          Every stock you own or track has an entry. Add one to your watchlist and it&rsquo;ll show up
          for writing.
        </p>
      </div>
    );
  }

  const front = tickers[safeIndex];
  const ghosts = tickers.slice(safeIndex + 1, safeIndex + 1 + GHOSTS);

  // The front card files against its own journal. Cross-journal rows carry their
  // membership; a row without any falls back to the active journal.
  const frontJournalId = primaryJournal(front)?.id ?? fallbackJournalId;

  return (
    <div
      ref={wrapRef}
      onKeyDown={onKeyDown}
      role="group"
      aria-roledescription="carousel"
      aria-label="Stocks to write about"
      tabIndex={-1}
      className="flex flex-1 flex-col outline-none"
    >
      {/* The stack. Ghosts are absolute behind; the front card sizes the box —
          and stretches it to fill the column when the column is the taller one. */}
      <div className="relative flex flex-1 flex-col">
        {ghosts.map((g, i) => {
          const depth = i + 1;
          return (
            <motion.div
              key={g.ticker}
              aria-hidden
              // Not just aria-hidden: without inert the hidden card's controls
              // stay tabbable behind the front one.
              // @ts-expect-error — inert is valid HTML; React 19 types lag.
              inert={true}
              initial={false}
              animate={{ y: depth * 10, scale: 1 - depth * 0.04, opacity: 0.55 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-x-0 top-0"
              style={{ zIndex: 10 - depth }}
            >
              <GhostCard t={g} />
            </motion.div>
          );
        })}

        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            // Key by ticker, not index — index keys make framer animate a
            // content swap in place instead of a real enter/exit.
            key={front.ticker}
            custom={dir}
            initial={reduceMotion ? false : { opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -40, scale: 0.95 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex flex-1 flex-col"
            style={{ zIndex: 10 }}
          >
            {frontJournalId ? (
              <ComposerCard t={front} journalId={frontJournalId} onSaved={onSaved} />
            ) : (
              // No journal to file under: showing a composer here would save the
              // entry into whatever journal happened to be active.
              <GhostCard t={front} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Announce position for screen readers without stealing focus. */}
      <span aria-live="polite" className="sr-only">
        {front.ticker}, {safeIndex + 1} of {n}
      </span>

    </div>
  );
}

// A reduced stand-in for the cards behind. Rendering real ComposerCards here
// would fire an AI-read fetch per ghost on every step.
function GhostCard({ t }: { t: DiaryTicker }) {
  return (
    <div className="rounded-xl border border-hair bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="serif text-[26px] leading-none text-ink">{t.ticker}</span>
        <span className="mono text-[16px] font-semibold text-ink">{fmtPrice(t.market.ltp)}</span>
      </div>
      {/* Height only needs to peek out below the front card. */}
      <div className="h-24" />
    </div>
  );
}
