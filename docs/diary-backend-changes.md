# Backend changes for the `/diary` page

The diary page (`src/app/(app)/diary/page.tsx`) is wired to **existing** endpoints. Everything
below can be delivered by **extending 3 existing endpoints** — no new endpoint is strictly
required. One optional new endpoint is called out for the change feed if you'd rather keep it
separate from the entries payload.

Each section lists: the endpoint, what's missing, the exact field(s) to add, and where the
frontend reads it. All response bodies are wrapped in `{ success: true, data: ... }` (existing
convention) — the shapes below describe `data`.

---

## 1. `GET /api/journal/entries` — extend

Currently returns `JournalEntriesResponse` (`src/types/journal.ts`):

```ts
{
  summary: { intact, partial, broken, none, total },
  entries: JournalEntryItem[]   // each has journal.updatedAt, modScore, thesisHealth, alert, ...
}
```

### 1a. Entry number ("Entry 47")
**Missing:** a monotonic per-user count of journal entries ever written.
**Add to `summary`:**

```ts
summary: {
  intact: number;
  partial: number;
  broken: number;
  none: number;
  total: number;
  entryCount: number;   // NEW — total journal entries this user has ever saved (monotonic, never decrements)
}
```

- Frontend reads: masthead `ENTRY {n}`. Today it falls back to "written entries count", which
  resets if a thesis is deleted. `entryCount` should be a lifetime counter (e.g. count of rows in
  the journal-entries table for the user, including superseded revisions if you want it to climb).

### 1b. Writing streak ("5-day streak" dots)
**Missing:** consecutive-day writing streak.
**Add to `summary`:**

```ts
summary: {
  ...
  streakDays: number;   // NEW — count of consecutive days (up to today) with ≥1 entry saved
}
```

- Frontend reads: the `StreakDots` component (`_components/streak-dots.tsx`). Currently passed
  `filled={0}`, which hides the dots. Wire `streakDays` in and they render.
- Definition suggestion: number of consecutive calendar days ending today (or yesterday, your
  choice of grace) on which the user saved at least one entry. `0` = no active streak → dots stay hidden.

### 1c. Change feed ("Since your last entry · N things changed") — **preferred: extend here**
**Missing:** a real list of what changed since the user's last visit.
Today the frontend derives this from each entry's `alert` string, which is coarse (one alert per
holding, no delta, no timestamp).

**Add a top-level `changes` array to the response:**

```ts
{
  summary: { ... },
  entries: JournalEntryItem[],
  changes: JournalChange[]     // NEW
}

interface JournalChange {
  symbol: string;              // "ASIANPAINT"
  thesisHealth: ThesisHealth;  // "intact" | "partial" | "broken" | "none" — drives the dot color
  description: string;         // "Score downgraded 62→54 · guidance cut · thesis flagged Broken"
  changedAt: string;           // ISO 8601 — when the change was detected
  kind?: "score" | "guidance" | "thesis" | "event" | "news";  // optional, for future filtering
  delta?: number;              // optional signed score delta, e.g. -8
}
```

- "Since your last entry" = changes with `changedAt` after the user's previous session/visit
  timestamp. If you don't track last-visit, return the last ~N changes (e.g. 7 days) and the
  frontend will show them all.
- Frontend reads: `ChangeFeed` (`_components/change-feed.tsx`) via `ChangeItem { symbol, health, description }`.
  I'll map `thesisHealth → health` and `description → description`. `changedAt`/`delta`/`kind` are
  used for ordering/labels once available.

> **Alternative (new endpoint):** if you'd rather not bloat the entries payload, expose
> `GET /api/journal/changes?since=<ISO>` returning `{ changes: JournalChange[] }` with the same
> `JournalChange` shape. Either works; extending `/entries` is one fewer round-trip.

---

## 2. `GET /api/journal/pending` — already sufficient ✓

Returns `JournalPendingResponse` with `holdings: JournalPendingHolding[]`, each carrying
`price`, `priceChange`, `priceChangeDir`, `mod {M,O,D}`, `aiContext {M,O,D}`, `subFactors {M,O,D}`,
`signals[]`, `prompts[]`. **The dimension card ("Keep writing" / RELIANCE card) already has
everything it needs.** No change required.

One thing to confirm: the diary uses `holdings[0]` as the featured card. If you want a specific
holding featured (e.g. highest-conviction-missing, or most-recently-moved), either order the array
accordingly or add an optional `featured: boolean` flag on the holding you want surfaced first.

---

## 3. Holdings for "Everything you own" — extend `Holding` (and/or Smallcase)

The list is sourced two ways:
- **Broker connected:** `GET /api/smallcase/holdings` → `SmallcaseHolding[]`
- **Not connected (uploaded):** `GET /api/portfolio/user` → `UserPortfolio.holdings` (`Holding[]`)

### 3a. Per-holding broker attribution ("Zerodha / Upstox / Groww" chips + "N broker accounts")
**Missing:** which broker each holding sits in.

**Add `broker` to `Holding` (`src/types/investor-portfolio.ts`):**

```ts
interface Holding {
  ...
  broker: string | null;   // NEW — "Zerodha" | "Upstox" | "Groww" | null (display name)
}
```

**And to `SmallcaseHolding` (`src/types/smallcase.ts`):**

```ts
interface SmallcaseHolding {
  ...
  broker: string | null;   // NEW — the broker the smallcase holding is held at
}
```

- Frontend reads: `DiaryHolding.broker` (`_components/holdings-list.tsx`). Renders a colored chip
  per row, and the "across N broker accounts" count is derived as the number of distinct non-null
  brokers. Currently `broker` is `null` everywhere → BROKER column shows "—" and the count is omitted.
- Display name, not an enum, so the chip label is whatever you send.

### 3b. Live value / day-change on uploaded holdings (nice-to-have)
`Holding.market_data` already has `ltp` and `change_percent` but they are optional/nullable, so
uploaded portfolios show `amount_invested` rather than live value.

**No shape change needed** — just **populate** `market_data.ltp` and `market_data.change_percent`
for uploaded holdings so the AMOUNT column and the dimension card can show live numbers. If you
prefer an explicit current value, you can add:

```ts
interface Holding {
  ...
  current_value: number | null;   // OPTIONAL — live value; else frontend uses amount_invested
  quantity: number | null;        // OPTIONAL — enables the QTY column for uploaded holdings
}
```

- Smallcase holdings already carry `quantity` and `current_value`, so the QTY/AMOUNT columns work
  for connected brokers today. These optional fields only matter for the **uploaded** path.

---

## Summary table

| Need (screenshot) | Endpoint | Change | New field(s) |
|---|---|---|---|
| "Entry 47" | `GET /api/journal/entries` | extend `summary` | `summary.entryCount: number` |
| "5-day streak" | `GET /api/journal/entries` | extend `summary` | `summary.streakDays: number` |
| "Since your last entry · N things changed" | `GET /api/journal/entries` (or new `GET /api/journal/changes`) | add array | `changes: JournalChange[]` |
| Dimension / "Keep writing" card | `GET /api/journal/pending` | none ✓ | — (optional `featured: boolean`) |
| Broker chips + "N broker accounts" | `GET /api/portfolio/user` + `GET /api/smallcase/holdings` | add field to each holding | `broker: string \| null` |
| Live value / qty on uploaded holdings | `GET /api/portfolio/user` | populate existing `market_data`, optional new fields | `current_value?`, `quantity?` |

**Net:** no mandatory new endpoint. Extend `/api/journal/entries` (3 additions), add a `broker`
field to both holding shapes, and optionally enrich uploaded-holding market data. The change feed
is the only piece you might choose to split into a new `GET /api/journal/changes` endpoint.
