// Pure derivations for the unified diary page. No React, no fetching — every
// function here is deterministic given its args so the page can be reasoned
// about (and tested) without a network.
//
// The diary joins five independently-fetched sources onto one view model:
//   journal tree    → the journals, their tickers, and every entry (camelCase API)
//   smallcase       → holdings: name / qty / broker / value (snake_case API)
//   mod synopsis    → bulk ticker→company name + M/O/D scores
//   stocks universe → fallback name + industry
//   ticker metrics  → CMP, for any list of tickers
// Beware the naming split: journal is camelCase, portfolio/smallcase snake_case.

import { isPending } from "@/types/journal";
import type { JournalEntry, JournalKind, JournalTicker, TickerMarket, ThesisEntry, ThesisHealth } from "@/types/journal";
import type { OwnedJournalTicker } from "@/hooks/useJournalTree";
import type { SmallcaseHolding, SmallcaseHoldingsData } from "@/types/smallcase";
import type { ModSynopsis, ModBreakdownRow, ModPillar, ModRating } from "@/types/investor-dashboard";
import type { StockOption } from "@/hooks/useStocks";
import type { TickerMetrics } from "@/hooks/useTickerMetrics";

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
  /**
   * Live market row from the bulk ticker API — the CMP column's source. Null
   * until it lands, or if the backend doesn't know the ticker (`notFound`).
   *
   * The journal tree also carries a price (`market.ltp`), but only for tickers
   * in a journal; this covers holdings too, so one column has one source rather
   * than two that can disagree.
   */
  metrics: TickerMetrics | null;
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
  metrics: Map<string, TickerMetrics> = new Map(),
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
      metrics: metrics.get(k) ?? null,
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
  metrics: Map<string, TickerMetrics> = new Map(),
): DiaryTicker[] {
  const merged = new Map<string, DiaryTicker>();

  for (const row of rows) {
    const ref: JournalRef = { id: row.journalId, name: row.journalName, kind: row.journalKind };
    const [joined] = joinTickers([row], ref, holdings, mod, stocks, metrics);
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

  // Include holdings that are not in the journal tree so they appear in the queue
  if (holdings?.holdings) {
    const byMod = indexBy(mod?.breakdown, (r) => r.symbol);
    const byStock = indexBy(stocks, (s) => s.ticker);
    
    for (const h of holdings.holdings) {
      const k = key(h.ticker);
      if (!merged.has(k)) {
        const modRow = byMod.get(k) ?? null;
        const stock = byStock.get(k) ?? null;
        
        merged.set(k, {
          ticker: h.ticker,
          name: modRow?.name ?? h.name ?? stock?.name ?? null,
          sector: stock?.industry ?? null,
          addedAt: h.created_at ?? "1970-01-01T00:00:00.000Z",
          entryCount: 0,
          market: { 
            ltp: null, 
            change: null, 
            changePercent: null, 
            qcScore: null, 
            conviction: null, 
            thesisTags: [] 
          },
          latestEntry: null,
          latestThesisHealth: null,
          entries: [],
          pending: true,
          holding: h,
          mod: modRow,
          metrics: metrics.get(k) ?? null,
          journals: [],
        });
      }
    }
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

// ── "Your book" overview ────────────────────────────────────────────────────
// The top-of-diary glance: one block per holding, sized by the money in it and
// bucketed by whether the reasoning behind it still holds.
//
// The bar, the stat cards, the banner and the headline percentage all read these
// same blocks, so none of them can contradict another. Blocks come from the
// holdings themselves, not the journal tree — "each block is one holding" has to
// mean every holding, including the ones nothing has been written about yet
// (which are the whole point of the "No entry yet" bucket).

/** Which bucket a holding falls in, worst-to-best being the reader's question. */
export type ThesisBucket = "intact" | "pressure" | "broken" | "unwritten";

/** Semantic tone of a group, or `neutral` when the grouping is just a category. */
export type GroupTone = "up" | "warn" | "down" | "neutral";

/** How the book is cut up: by thesis health, market-cap band, or industry. */
export type BookLens = "thesis" | "cap" | "industry";

export interface BookBlock {
  ticker: string;
  name: string | null;
  /** Position value in raw rupees — the block's width and its group's total. */
  value: number;
  bucket: ThesisBucket;
  /** Basic industry from the bulk ticker read; null until that lands. */
  industry: string | null;
  marketCapCr: number | null;
}

export interface BookGroup {
  /** Stable key — the bucket name, cap band, or industry label. */
  key: string;
  label: string;
  count: number;
  value: number;
  /** Share of the book's value, 0–100. */
  pct: number;
  tone: GroupTone;
  /**
   * The group's color, as a CSS value.
   *
   * Resolved here rather than in the component so the bar segment, the stat
   * card's dot and the tooltip swatch are one decision. Semantic tokens on the
   * thesis lens; the categorical palette on the cap/industry lenses, where the
   * color is identity and carries no verdict.
   */
  color: string;
  /** True when `color` is dark enough to carry a white label. */
  onDark: boolean;
  /** Members, largest position first. */
  blocks: BookBlock[];
}

/**
 * Health → bucket.
 *
 * `"none"` folds into the unwritten bucket rather than getting a fifth: it's a
 * thesis that evaluated to no verdict, which `thesisConfig` already renders as
 * "No thesis" — so the two places agree on what it means.
 */
function bucketFor(health: ThesisHealth | null): ThesisBucket {
  if (health === "intact") return "intact";
  if (health === "partial") return "pressure";
  if (health === "broken") return "broken";
  return "unwritten";
}

/** Reader-facing name for each bucket — the diary's words, not the API's enum. */
export const THESIS_BUCKET_LABEL: Record<ThesisBucket, string> = {
  intact: "Reason intact",
  pressure: "Under pressure",
  broken: "Reason broke",
  unwritten: "No entry yet",
};

/**
 * Bucket → semantic tone. The one place thesis health becomes color, so the bar
 * segment, the stat card dot and the banner are a single fact stated thrice.
 * Unwritten is neutral chrome, not amber: nothing is wrong with it yet.
 */
export const THESIS_BUCKET_TONE: Record<ThesisBucket, GroupTone> = {
  intact: "up",
  pressure: "warn",
  broken: "down",
  unwritten: "neutral",
};

const BUCKET_ORDER: ThesisBucket[] = ["intact", "pressure", "broken", "unwritten"];

/** Tone → the token that paints it. Thesis-lens groups only. */
const TONE_COLOR: Record<GroupTone, string> = {
  up: "var(--qc-up)",
  warn: "var(--qc-warn)",
  down: "var(--qc-down)",
  neutral: "var(--qc-ink-3)",
};

/**
 * The categorical palette, rotated across industries.
 *
 * Identity, not verdict — see the `--qc-cat-*` block in globals.css. Seven
 * rotate; the eighth slot is always the neutral "Others" remainder, so a book
 * with more industries than colors never wraps back to color 1 and implies two
 * unrelated industries are the same thing.
 */
const CATEGORY_COLORS = [
  "var(--qc-cat-1)",
  "var(--qc-cat-2)",
  "var(--qc-cat-3)",
  "var(--qc-cat-4)",
  "var(--qc-cat-5)",
  "var(--qc-cat-6)",
  "var(--qc-cat-7)",
  "var(--qc-cat-8)",
];

/** The remainder bucket: neutral, so "Others" reads as leftover, not a category. */
const REMAINDER_COLOR = "var(--qc-ink-3)";

/** Industries shown individually before the tail collapses into "Others". */
const MAX_INDUSTRIES = 8;
const OTHERS_LABEL = "Others";

/**
 * Absolute-value cap bands.
 *
 * SEBI defines large/mid/small by market-cap *rank* (top 100 / 101–250 / rest),
 * which needs the whole universe ranked. The bulk ticker read only carries an
 * absolute cap, so these are the conventional rupee cut-offs that approximate
 * those ranks — near a boundary a name can land a band either side of its rank.
 */
const CAP_BANDS: { label: string; minCr: number; color: string }[] = [
  { label: "Large cap", minCr: 20_000, color: "var(--qc-cat-1)" },
  { label: "Mid cap", minCr: 5_000, color: "var(--qc-cat-3)" },
  { label: "Small cap", minCr: 0, color: "var(--qc-cat-7)" },
];

/** Holdings the bulk read has no market cap for. Named "Others" like the
 *  industry tail — both are the same thing to a reader: the leftover. */
const UNKNOWN_CAP = OTHERS_LABEL;

export function capBand(capCr: number | null): string {
  if (capCr == null) return UNKNOWN_CAP;
  return CAP_BANDS.find((b) => capCr >= b.minCr)?.label ?? "Small cap";
}

/**
 * Every holding as a block, largest first, joined to what's been written about
 * it and to its fundamentals.
 *
 * Health is read off the newest thesis in `entries` rather than
 * `latestThesisHealth`, so a block's color and the quote its card shows come
 * from the same entry.
 */
export function buildBookBlocks(
  holdings: SmallcaseHolding[],
  tickers: DiaryTicker[],
  metrics: Map<string, TickerMetrics> = new Map(),
): BookBlock[] {
  const byTicker = indexBy(tickers, (t) => t.ticker);

  return holdings
    .map((h) => {
      const k = key(h.ticker);
      const row = byTicker.get(k) ?? null;
      const m = metrics.get(k) ?? null;
      return {
        ticker: h.ticker,
        name: h.name ?? row?.name ?? m?.name ?? null,
        // display_value is never null — cost basis when there's no live price.
        value: h.display_value,
        bucket: bucketFor(row ? latestThesis(row)?.thesisHealth ?? null : null),
        industry: m?.basicIndustry ?? row?.sector ?? null,
        marketCapCr: m?.marketCapCr ?? null,
      };
    })
    .sort((a, b) => b.value - a.value);
}

/**
 * Blocks cut into groups by the chosen lens, each carrying its money, share and
 * color.
 *
 * The thesis lens always returns all four buckets, empty ones included: "Reason
 * broke · 0" is the answer to the question the card asks, and hiding it reads as
 * unanswered. Cap comes back in band order (Large→Small is the axis's own
 * order); industry comes back largest money first, capped at `MAX_INDUSTRIES`
 * with the tail merged into a single "Others" — past eight the bar is stripes
 * and the cards are a list, and neither answers anything.
 */
export function groupBook(blocks: BookBlock[], lens: BookLens): BookGroup[] {
  const total = blocks.reduce((s, b) => s + b.value, 0);
  const share = (v: number) => (total > 0 ? (v / total) * 100 : 0);
  const build = (
    k: string,
    label: string,
    tone: GroupTone,
    color: string,
    onDark: boolean,
    members: BookBlock[],
  ): BookGroup => {
    const value = members.reduce((s, b) => s + b.value, 0);
    return { key: k, label, count: members.length, value, pct: share(value), tone, color, onDark, blocks: members };
  };

  if (lens === "thesis") {
    return BUCKET_ORDER.map((b) => {
      const tone = THESIS_BUCKET_TONE[b];
      return build(
        b,
        THESIS_BUCKET_LABEL[b],
        tone,
        TONE_COLOR[tone],
        tone !== "neutral",
        blocks.filter((x) => x.bucket === b),
      );
    });
  }

  const labelOf = (b: BookBlock) =>
    lens === "cap" ? capBand(b.marketCapCr) : b.industry ?? "Unclassified";

  const byLabel = new Map<string, BookBlock[]>();
  for (const b of blocks) {
    const l = labelOf(b);
    const members = byLabel.get(l);
    if (members) members.push(b);
    else byLabel.set(l, [b]);
  }

  if (lens === "cap") {
    const order = [...CAP_BANDS.map((b) => b.label), UNKNOWN_CAP];
    return [...byLabel]
      .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
      .map(([label, members]) => {
        const band = CAP_BANDS.find((b) => b.label === label);
        return build(label, label, "neutral", band?.color ?? REMAINDER_COLOR, Boolean(band), members);
      });
  }

  // Industry: biggest money first, then the tail collapsed.
  const ranked = [...byLabel].sort(
    ([, a], [, b]) => b.reduce((s, x) => s + x.value, 0) - a.reduce((s, x) => s + x.value, 0),
  );
  const named = ranked.length > MAX_INDUSTRIES ? ranked.slice(0, MAX_INDUSTRIES - 1) : ranked;
  const tail = ranked.slice(named.length).flatMap(([, members]) => members);

  const groups = named.map(([label, members], i) =>
    build(label, label, "neutral", CATEGORY_COLORS[i % CATEGORY_COLORS.length], true, members),
  );

  if (tail.length > 0) {
    // Sorted so the merged bucket still reads largest-first internally.
    groups.push(
      build(OTHERS_LABEL, OTHERS_LABEL, "neutral", REMAINDER_COLOR, false, [...tail].sort((a, b) => b.value - a.value)),
    );
  }
  return groups;
}

/**
 * Share of the book (0–100) running on reasoning that broke or was never
 * written — the headline's "no reason you'd still stand behind".
 */
export function unbackedPct(blocks: BookBlock[]): number {
  const total = blocks.reduce((s, b) => s + b.value, 0);
  if (total === 0) return 0;
  const unbacked = blocks
    .filter((b) => b.bucket === "broken" || b.bucket === "unwritten")
    .reduce((s, b) => s + b.value, 0);
  return (unbacked / total) * 100;
}

// ── M/O/D pillars ───────────────────────────────────────────────────────────

/** At or above this a holding is pulling its weight on a pillar. */
const PILLAR_STRONG_AT = 70;
/** Below this it drags the pillar down — what the caption names. */
const PILLAR_WEAK_BELOW = 60;

export interface PillarSummary {
  pillar: ModPillar;
  /** Title-cased display label, e.g. "Management". */
  label: string;
  score: number;
  rating: ModRating;
  /** Holdings dragging this pillar, worst first — at most four are named. */
  weakest: string[];
  /** Share of the book those draggers carry, 0–100. */
  weakWeightPct: number;
  /** One derived sentence-pair: how many are pulling their weight, and who isn't. */
  caption: string;
}

/**
 * The three pillar cards' content, derived from the portfolio MOD synopsis.
 *
 * The captions are computed from `breakdown` rather than written: the API sends
 * per-holding M/O/D scores and weights, so "21 of 32 above 70" and "dragged by
 * GROWW, HUDCO — 22% of the book" are facts the page can state exactly. Returns
 * `[]` when there's no synopsis, so the caller renders nothing rather than zeros.
 */
export function pillarSummaries(mod: ModSynopsis | null): PillarSummary[] {
  if (!mod || mod.empty) return [];

  const order: ModPillar[] = ["management", "opportunity", "deal"];

  return order.flatMap((pillar) => {
    const sub = mod.sub_scores.find((s) => s.pillar === pillar);
    if (!sub) return [];

    const rows = mod.breakdown ?? [];
    const scoreOf = (r: ModBreakdownRow) => r[pillar];
    const dragging = rows
      .filter((r) => scoreOf(r) < PILLAR_WEAK_BELOW)
      .sort((a, b) => scoreOf(a) - scoreOf(b));
    const named = dragging.slice(0, 4).map((r) => r.symbol);
    const weakWeightPct = dragging.reduce((s, r) => s + r.weight_pct, 0);

    const parts: string[] = [];
    if (rows.length > 0) {
      parts.push(`${rows.filter((r) => scoreOf(r) >= PILLAR_STRONG_AT).length} of ${rows.length} above ${PILLAR_STRONG_AT}.`);
      if (dragging.length > 0) {
        const more = dragging.length - named.length;
        parts.push(
          `Dragged by ${named.join(", ")}${more > 0 ? ` +${more} more` : ""} — ${Math.round(weakWeightPct)}% of the book.`,
        );
      } else {
        parts.push(`No holding below ${PILLAR_WEAK_BELOW}.`);
      }
    }

    return [{
      pillar,
      label: pillar.charAt(0).toUpperCase() + pillar.slice(1),
      score: sub.score,
      rating: sub.rating,
      weakest: named,
      weakWeightPct,
      caption: parts.join(" "),
    }];
  });
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
