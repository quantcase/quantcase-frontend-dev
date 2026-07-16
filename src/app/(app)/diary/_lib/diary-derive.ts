// Pure derivations for the unified diary page. No React, no fetching — every
// function here is deterministic given its args so the page can be reasoned
// about (and tested) without a network.
//
// The diary joins four independently-fetched sources onto one view model:
//   journal detail  → the tickers + entries (camelCase API)
//   smallcase       → holdings: name / qty / broker / value (snake_case API)
//   mod synopsis    → bulk ticker→company name + M/O/D scores
//   stocks universe → fallback name + industry
// Beware the naming split: journal is camelCase, portfolio/smallcase snake_case.

import { isPending } from "@/types/journal";
import type { JournalEntry, JournalKind, JournalTicker, TickerMarket, ThesisHealth } from "@/types/journal";
import type { OwnedJournalTicker } from "@/hooks/useAllJournalTickers";
import type { SmallcaseHolding, SmallcaseHoldingsData } from "@/types/smallcase";
import type { ModSynopsis, ModBreakdownRow } from "@/types/investor-dashboard";
import type { StockOption } from "@/hooks/useStocks";

// ── View model ──────────────────────────────────────────────────────────────

/** The journal a ticker sits in — what the strip card's badge names. */
export interface JournalRef {
  id: string;
  name: string;
  kind: JournalKind;
}

export interface DiaryTicker {
  ticker: string;
  /** Company name, joined from mod-synopsis → smallcase → universe. Null until those land. */
  name: string | null;
  /** Single-level industry from the stocks universe. The mockup's multi-level
   *  sector ("Conglomerate · Energy · Retail") has no bulk source — see G2. */
  sector: string | null;
  addedAt: string;
  entryCount: number;
  market: TickerMarket;
  latestEntry: JournalEntry | null;
  latestThesisHealth: ThesisHealth | null;
  /** True when the ticker has no thesis yet — drives the composer queue. */
  pending: boolean;
  /** The matching holding, or null when this is watchlist-only (not owned). */
  holding: SmallcaseHolding | null;
  mod: ModBreakdownRow | null;
  /** Journals this ticker belongs to. Empty for single-journal views that don't
   *  fan out; the strip badge renders the first (see `primaryJournal`). */
  journals: JournalRef[];
}

export type EntryStatus = "needs-entry" | "written";

// ── Joins ───────────────────────────────────────────────────────────────────

const key = (t: string) => t.trim().toUpperCase();

/** Index a list by uppercased ticker. Built once per source so row lookup is
 *  O(1) — `stocks` is the entire universe, so `.find()` per row would be O(n·m). */
function indexBy<T>(rows: T[] | undefined, pick: (row: T) => string | null | undefined): Map<string, T> {
  const map = new Map<string, T>();
  for (const row of rows ?? []) {
    const k = pick(row);
    if (k) map.set(key(k), row);
  }
  return map;
}

/**
 * Join journal tickers against holdings, MOD scores, and the stock universe.
 *
 * Name precedence: mod-synopsis (portfolio-accurate) → smallcase → universe →
 * null. Callers fall back to the ticker itself for display; the universe is a
 * public fetch that often resolves after the journal, so `name` is briefly null.
 */
export function joinTickers(
  tickers: JournalTicker[],
  holdings: SmallcaseHoldingsData | null,
  mod: ModSynopsis | null,
  stocks: StockOption[],
): DiaryTicker[] {
  const byHolding = indexBy(holdings?.holdings, (h) => h.ticker);
  const byMod = indexBy(mod?.breakdown, (r) => r.symbol);
  const byStock = indexBy(stocks, (s) => s.ticker);

  return tickers.map((t) => {
    const k = key(t.ticker);
    const holding = byHolding.get(k) ?? null;
    const modRow = byMod.get(k) ?? null;
    const stock = byStock.get(k) ?? null;

    return {
      ticker: t.ticker,
      name: modRow?.name ?? holding?.name ?? stock?.name ?? null,
      sector: stock?.industry ?? null,
      addedAt: t.addedAt,
      entryCount: t.entryCount,
      market: t.market,
      latestEntry: t.latestEntry,
      latestThesisHealth: t.latestThesisHealth,
      pending: isPending(t),
      holding,
      mod: modRow,
      journals: [],
    };
  });
}

/**
 * The cross-journal join: same enrichment as `joinTickers`, but over rows from
 * every journal at once, collapsed to one row per ticker carrying its full
 * membership.
 *
 * A ticker in both Holdings and Tracking arrives as two rows. They're merged on
 * the ticker, keeping the most-recently-touched row's entry data so the card
 * quotes the newest writing, and unioning the journals for the badge.
 */
export function joinAllTickers(
  rows: OwnedJournalTicker[],
  holdings: SmallcaseHoldingsData | null,
  mod: ModSynopsis | null,
  stocks: StockOption[],
): DiaryTicker[] {
  const merged = new Map<string, DiaryTicker>();

  for (const row of rows) {
    const [joined] = joinTickers([row], holdings, mod, stocks);
    const ref: JournalRef = { id: row.journalId, name: row.journalName, kind: row.journalKind };
    const k = key(row.ticker);
    const prev = merged.get(k);

    if (!prev) {
      merged.set(k, { ...joined, journals: [ref] });
      continue;
    }

    // Keep the fresher row's entry fields; the duplicate only adds membership.
    const base = touchedAt(joined) > touchedAt(prev) ? joined : prev;
    merged.set(k, {
      ...base,
      // Entry counts are per-journal, so the ticker's true total is the sum.
      entryCount: prev.entryCount + joined.entryCount,
      // Pending only if no journal has a thesis for it.
      pending: prev.pending && joined.pending,
      journals: [...prev.journals, ref],
    });
  }

  return [...merged.values()];
}

/**
 * The journal a card badges when a ticker is in several. Holdings wins — that
 * you own it is the more load-bearing fact than which list you filed it under.
 */
export function primaryJournal(t: DiaryTicker): JournalRef | null {
  if (t.journals.length === 0) return null;
  return t.journals.find((j) => j.kind === "holdings") ?? t.journals[0];
}

// ── Status ──────────────────────────────────────────────────────────────────

/**
 * Have you written anything here yet? That's the whole question.
 *
 * Any entry counts, note or thesis: the card quotes the note, so a label saying
 * the entry is missing contradicts what's on screen. Thesis health is a separate
 * axis (is the reasoning still holding up?) and deliberately isn't styled here —
 * a ticker with no thesis has no health to report, and reading one anyway is
 * what gave note-only tickers a thesis-colored rail.
 */
export function entryStatus(t: DiaryTicker): EntryStatus {
  return t.entryCount === 0 ? "needs-entry" : "written";
}

/**
 * Label + color per status — the card's single styling axis, so the rail and the
 * badge are one fact stated twice and can never disagree.
 *
 * Colors carry meaning rather than tinting categories, per the design contract:
 * brand accent is the interactive token (this card is the ask), `up` means the
 * writing is there.
 */
export const ENTRY_STATUS_CONFIG: Record<EntryStatus, { label: string; color: string }> = {
  "needs-entry": { label: "Needs entry", color: "var(--qc-brand-accent)" },
  written: { label: "Written", color: "var(--qc-up)" },
};

/**
 * Which icon a journal badge wears. Two buckets by design: owned (Holdings) vs.
 * merely followed (Tracking/custom) — the distinction the reader cares about.
 * Not a per-kind icon set, which would make the mark decorative.
 */
export type JournalIcon = "holdings" | "list";

export function journalIcon(kind: JournalKind): JournalIcon {
  return kind === "holdings" ? "holdings" : "list";
}

/** The quote shown on a strip card — a thesis if there is one, else the note. */
export function entryExcerpt(entry: JournalEntry | null): string | null {
  if (!entry) return null;
  return entry.type === "thesis" ? entry.thesis : entry.noteText;
}

/**
 * Written first, then most-recently-touched within each group.
 *
 * Keyed on `entryStatus` — the same axis the card's rail and label render — so a
 * card's position and its own label can never disagree. It deliberately is *not*
 * keyed on `pending`, which is thesis-only (`latestThesisHealth === null`): a
 * ticker with notes but no thesis is pending yet reads "Written" and quotes the
 * note, and sorting it as unwritten put it among the blanks.
 */
export function sortForStrip(tickers: DiaryTicker[]): DiaryTicker[] {
  return [...tickers].sort((a, b) => {
    const aWritten = entryStatus(a) === "written";
    const bWritten = entryStatus(b) === "written";
    if (aWritten !== bWritten) return aWritten ? -1 : 1;
    return touchedAt(b) - touchedAt(a);
  });
}

function touchedAt(t: DiaryTicker): number {
  const iso = t.latestEntry?.createdAt ?? t.addedAt;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

// ── Holdings aggregates ─────────────────────────────────────────────────────

/** "across N broker accounts" — distinct non-null brokers. Nothing else in the
 *  app groups by broker today, so this is derived rather than read from the API. */
export function brokerAccountCount(holdings: SmallcaseHolding[]): number {
  const set = new Set<string>();
  for (const h of holdings) if (h.broker) set.add(h.broker.toLowerCase());
  return set.size;
}

// ── Streak ──────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Consecutive days, ending today or yesterday, that have at least one entry.
 *
 * The yesterday-grace is deliberate: without it a real streak reads 0 every
 * morning until the user writes, which punishes them for showing up early.
 *
 * Known limit (G3): JournalDetail exposes only each ticker's `latestEntry`, so
 * days where an older entry was the only one are invisible and the streak can
 * undercount. Exact once the API returns `entryDates[]`.
 */
export function computeStreak(dates: (string | null | undefined)[], now: Date = new Date()): number {
  const days = new Set<string>();
  for (const iso of dates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) days.add(dayKey(d));
  }
  if (days.size === 0) return 0;

  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setTime(cursor.getTime() - DAY_MS); // grace

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  return streak;
}

/** The trailing `length` days as booleans (oldest → newest) for the streak dots. */
export function streakDots(dates: (string | null | undefined)[], length = 7, now: Date = new Date()): boolean[] {
  const days = new Set<string>();
  for (const iso of dates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) days.add(dayKey(d));
  }
  return Array.from({ length }, (_, i) => {
    const d = new Date(now);
    d.setTime(d.getTime() - (length - 1 - i) * DAY_MS);
    return days.has(dayKey(d));
  });
}

/** Every entry date we can see — the streak's input. See G3 on why this is partial. */
export function entryDates(tickers: DiaryTicker[]): string[] {
  return tickers.map((t) => t.latestEntry?.createdAt).filter((d): d is string => Boolean(d));
}

// ── Formatting ──────────────────────────────────────────────────────────────

/** Compact relative time: "just now" / "5h ago" / "2d ago" / "3w ago". */
export function relativeTime(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const diff = now.getTime() - then;
  if (diff < 0) return "just now";

  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(days / 365)}y ago`;
}

/** Masthead eyebrow date: "TUESDAY, 8 JULY". */
export function mastheadDate(now: Date = new Date()): string {
  return now
    .toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

/**
 * The "ENTRY 47" counter (G1): summed across the active journal's tickers,
 * i.e. "entries in this journal". Exact once /api/journal/journals returns
 * `totalEntryCount`.
 */
export function totalEntryCount(tickers: DiaryTicker[]): number {
  return tickers.reduce((sum, t) => sum + t.entryCount, 0);
}
