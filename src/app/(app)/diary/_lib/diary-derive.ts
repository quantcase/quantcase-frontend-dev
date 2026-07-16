// Pure derivations for the unified diary page. No React, no fetching — every
// function here is deterministic given its args so the page can be reasoned
// about (and tested) without a network.
//
// The diary joins four independently-fetched sources onto one view model:
//   journal tree    → the journals, their tickers, and every entry (camelCase API)
//   smallcase       → holdings: name / qty / broker / value (snake_case API)
//   mod synopsis    → bulk ticker→company name + M/O/D scores
//   stocks universe → fallback name + industry
// Beware the naming split: journal is camelCase, portfolio/smallcase snake_case.

import { isPending } from "@/types/journal";
import type { JournalEntry, JournalKind, JournalTicker, TickerMarket, ThesisEntry, ThesisHealth } from "@/types/journal";
import type { OwnedJournalTicker } from "@/hooks/useJournalTree";
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

/** An entry plus the journal it was filed under — the identity a merged,
 *  cross-journal list would otherwise lose. The drawer badges it. */
export interface SourcedEntry {
  entry: JournalEntry;
  journalId: string;
  journalName: string;
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
  /**
   * Every entry written about this ticker, across every journal it's filed in,
   * newest first and stamped with its journal.
   *
   * The whole history, not a preview: the API nests it, so the drawer reads this
   * instead of fetching per-ticker. `latestEntry` is just `entries[0]`'s entry
   * for a single-journal row, but the two can differ on a merged row — prefer
   * this.
   */
  entries: SourcedEntry[];
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

/** Newest first. The API doesn't promise an order, so every list of entries that
 *  reaches the UI passes through here rather than trusting arrival order. */
function sortEntries(entries: SourcedEntry[]): SourcedEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime(),
  );
}

/**
 * Join one journal's tickers against holdings, MOD scores, and the stock
 * universe, stamping each entry with the journal it was filed under.
 *
 * Name precedence: mod-synopsis (portfolio-accurate) → smallcase → universe →
 * null. Callers fall back to the ticker itself for display; the universe is a
 * public fetch that often resolves after the journal, so `name` is briefly null.
 */
export function joinTickers(
  tickers: JournalTicker[],
  journal: JournalRef,
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
      entries: sortEntries(
        (t.entries ?? []).map((entry) => ({
          entry,
          journalId: journal.id,
          journalName: journal.name,
        })),
      ),
      pending: isPending(t),
      holding,
      mod: modRow,
      journals: [journal],
    };
  });
}

/**
 * The cross-journal join: same enrichment as `joinTickers`, but over rows from
 * every journal at once, collapsed to one row per ticker carrying its full
 * membership and its complete history.
 *
 * A ticker in both Holdings and Tracking arrives as two rows. They're merged on
 * the ticker: entries concatenate (the writing is the ticker's, not the
 * journal's), the journals union for the badge, and the fresher row wins the
 * fields that are genuinely per-row.
 */
export function joinAllTickers(
  rows: OwnedJournalTicker[],
  holdings: SmallcaseHoldingsData | null,
  mod: ModSynopsis | null,
  stocks: StockOption[],
): DiaryTicker[] {
  const merged = new Map<string, DiaryTicker>();

  for (const row of rows) {
    const ref: JournalRef = { id: row.journalId, name: row.journalName, kind: row.journalKind };
    const [joined] = joinTickers([row], ref, holdings, mod, stocks);
    const k = key(row.ticker);
    const prev = merged.get(k);

    if (!prev) {
      merged.set(k, joined);
      continue;
    }

    // Keep the fresher row's per-journal fields; the duplicate adds membership.
    const base = touchedAt(joined) > touchedAt(prev) ? joined : prev;
    const entries = sortEntries([...prev.entries, ...joined.entries]);

    merged.set(k, {
      ...base,
      // Entry counts are per-journal, so the ticker's true total is the sum.
      entryCount: prev.entryCount + joined.entryCount,
      // Pending only if no journal has a thesis for it.
      pending: prev.pending && joined.pending,
      // Health is a per-ticker fact riding on per-journal rows, so it can't come
      // from `base` — the fresher row is fresher by *any* entry, and a note filed
      // in one journal would otherwise mask a thesis written in another, sending
      // the ticker to the watchlist when it has a thesis.
      latestThesisHealth: prev.latestThesisHealth ?? joined.latestThesisHealth,
      entries,
      // The newest entry across every journal — `base`'s own is only the newest
      // within its journal.
      latestEntry: entries[0]?.entry ?? null,
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

/**
 * The newest thesis written about a ticker, across every journal — or null if
 * it only has notes.
 *
 * Derived from `entries` rather than read off a field: the API returns the whole
 * history, so the thesis is always in hand even when a note is the newer entry
 * and `latestEntry` hides it.
 */
export function latestThesis(t: DiaryTicker): ThesisEntry | null {
  // `entries` is newest-first, so the first thesis found is the newest one.
  for (const { entry } of t.entries) {
    if (entry.type === "thesis") return entry;
  }
  return null;
}

// ── Sectioning (thesis vs. watchlist) ───────────────────────────────────────

/**
 * Does this ticker have a thesis at all?
 *
 * Reads the entries rather than `latestThesisHealth`, so the fact that files a
 * ticker under "Your thesis" is the same fact the card quotes — a ticker can't
 * be sectioned as having a thesis it can't show. The two agree in practice
 * (health is non-null exactly when a thesis exists), but only `entries` is
 * load-bearing for both questions.
 */
export function hasThesis(t: DiaryTicker): boolean {
  return latestThesis(t) !== null;
}

/**
 * "Your thesis" — tickers you've reasoned about, plus the ones still waiting.
 *
 * Two buckets by design: a written thesis, or nothing written at all. The blanks
 * belong here because the section is the ask — it's where you go to write, and a
 * needs-entry card is the prompt to. A ticker with only notes is neither: it has
 * writing, so it isn't an ask, but the writing isn't a thesis — so it sits this
 * strip out and appears only in its journal's roster below.
 *
 * This filters the strip, not the page: "On your watchlist" renders its
 * journal's tickers in full, so a ticker shown here can legitimately appear
 * there too. The sections are different views, not a partition.
 */
export function hasThesisOrNeedsEntry(t: DiaryTicker): boolean {
  return hasThesis(t) || entryStatus(t) === "needs-entry";
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
 *
 * Reads `entries`, the same list the card renders from, so "Needs entry" and a
 * visible quote can never appear on the same card.
 */
export function entryStatus(t: DiaryTicker): EntryStatus {
  return t.entries.length === 0 ? "needs-entry" : "written";
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

/** The text of a single entry, whichever type it is. */
export function entryExcerpt(entry: JournalEntry | null): string | null {
  if (!entry) return null;
  return entry.type === "thesis" ? entry.thesis : entry.noteText;
}

/**
 * The quote a ticker's card shows: its thesis whenever it has one, else its
 * latest note.
 *
 * A thesis outranks a newer note. The reasoning is the thing the diary is for,
 * and a card filed under "Your thesis" that quotes a note contradicts the
 * section it sits in — so recency loses to type here, unlike `entryExcerpt`.
 */
export function tickerExcerpt(t: DiaryTicker): string | null {
  return latestThesis(t)?.thesis ?? entryExcerpt(t.latestEntry);
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

/**
 * The writing queue: the strip's "Needs entry" cards, in the strip's own order.
 *
 * Deliberately keyed on `entryStatus`, not `pending` — the queue is the strip
 * filtered to what it labels unwritten, so "3 to go" and the count of amber
 * cards are the same fact. `pending` is the other axis (thesis-only), and using
 * it here is what let a note-only ticker read "Written" and still be queued.
 *
 * Callers pass the cross-journal set: a ticker needs an entry wherever it's
 * filed, so scoping this to the active journal hid work the strip was showing.
 * Uncapped — the strip truncates because it's a glance, but the queue is the
 * backlog, and a cap would make "N to go" understate it.
 */
export function needsEntryQueue(tickers: DiaryTicker[]): DiaryTicker[] {
  return sortForStrip(tickers).filter((t) => entryStatus(t) === "needs-entry");
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

/**
 * Every entry date — the streak's input.
 *
 * Reads all of `entries`, not just each ticker's newest. This used to be limited
 * to `latestEntry` because that was all the API returned, which made the streak
 * undercount: a day whose only writing was later superseded on that same ticker
 * was invisible. The nested payload carries the full history, so it's exact now.
 */
export function entryDates(tickers: DiaryTicker[]): string[] {
  return tickers.flatMap((t) => t.entries.map((e) => e.entry.createdAt));
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
 * The "ENTRY 47" counter: every entry you've written, across every journal.
 *
 * Counts the entries themselves rather than the `entryCount` field so the number
 * is the length of the history the page can actually open — one fact, not two
 * that can drift.
 */
export function totalEntryCount(tickers: DiaryTicker[]): number {
  return tickers.reduce((sum, t) => sum + t.entries.length, 0);
}
