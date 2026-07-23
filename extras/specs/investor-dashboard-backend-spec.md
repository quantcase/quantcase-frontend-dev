# Investor Dashboard — Backend API Spec

Backend spec for the widgets on `/investor/dashboard` that are currently hardcoded on the
frontend. Hand this to the backend team.

## Conventions (apply to every endpoint below)

- **Base URL:** `https://api-dev.quantcase.ai` (frontend `BACKEND_URL`).
- **Auth:** every request sends `Authorization: Bearer <access_token>`. All endpoints below are
  **user-scoped** — derive the user from the token; do not accept a userId in the path.
- **Response envelope:** all responses MUST be `{ "success": boolean, "data": <payload> }`.
  Errors: `{ "success": false, "error": "<message>" }` with an appropriate HTTP status.
  (Frontend rejects any 2xx body where `success !== true`.)
- **Content-Type:** `application/json`.
- **Empty state:** where the user has no portfolio, return `200` with a payload the frontend can
  detect (see each section). Do NOT 500. `useUserPortfolio` already treats `data.empty === true`
  and HTTP 404 / "no portfolio" as the empty state — follow that pattern.
- **All money is in paise-free rupees as numbers** (e.g. `5680000` for ₹56.8 L). The frontend does
  the `₹`/`L`/`Cr` formatting. Do **not** send pre-formatted strings like `"₹56.8 L"` — send raw
  numbers so the client can format consistently. (Current props take strings only because they're
  hardcoded; we will switch the props to numbers when wiring these up.)

Example curl skeleton used throughout:

```bash
curl -s https://api-dev.quantcase.ai/api/<path> \
  -H "Authorization: Bearer $QC_AT" | jq
```

---

## 1. Portfolio MOD Synopsis  — `GET /api/portfolio/mod-synopsis`

Aggregate **M**anagement / **O**pportunity / **D**eal score for the user's whole book, plus the
names dragging the weakest pillar. Powers the big hero card and the breakdown drawer.

Currently hardcoded at `src/app/(app)/investor/dashboard/page.tsx` (`MODSynopsisCard` + `MODBreakdownDrawer`).

```bash
curl -s https://api-dev.quantcase.ai/api/portfolio/mod-synopsis \
  -H "Authorization: Bearer $QC_AT" | jq
```

### Response `data`

```jsonc
{
  "empty": false,                    // true if user has no holdings — frontend shows shadow/CTA state
  "overall_score": 72,               // 0–100, book-weighted
  "sub_scores": [
    { "pillar": "management",  "score": 81, "rating": "STRONG"    },
    { "pillar": "opportunity", "score": 74, "rating": "FAIR"      },
    { "pillar": "deal",        "score": 58, "rating": "STRETCHED" }
  ],
  "weakest_pillar": "deal",          // which pillar the "dragging" names belong to
  "dragging_symbols": ["ACC", "HFCL"], // holdings pulling the weakest pillar down, worst first, max ~4
  "breakdown": [                     // per-holding rows for the "Open MOD breakdown" drawer
    {
      "symbol": "ACC",
      "name": "ACC Ltd",
      "weight_pct": 12.4,            // % of equity book
      "management": 61,
      "opportunity": 55,
      "deal": 48
    }
    // …one row per equity holding
  ]
}
```

### Field rules
- `pillar` ∈ `"management" | "opportunity" | "deal"`. Always send all three, in that order.
- `rating` ∈ `"STRONG" | "FAIR" | "STRETCHED" | "WEAK"`. Suggested thresholds (confirm with product):
  `>=75 STRONG`, `60–74 FAIR`, `45–59 STRETCHED`, `<45 WEAK`.
- `overall_score` should be book-weighted by `amount_invested`, not a simple average.
- `breakdown[].weight_pct` across all rows should sum to ~100.
- If `empty: true`, other fields may be `0`/`[]`.

---

## 2. Holdings Summary  — `GET /api/portfolio/summary`

Top-line valuation + allocation breakdowns for the Holdings panel. Several of these are
**derivable** from the existing `GET /api/portfolio/user` data, but we want them computed
server-side so client and server agree (and so we can add fund/MF data the portfolio endpoint
doesn't have).

Currently hardcoded (`HoldingsPanel` props + internal chips).

```bash
curl -s https://api-dev.quantcase.ai/api/portfolio/summary \
  -H "Authorization: Bearer $QC_AT" | jq
```

### Response `data`

```jsonc
{
  "empty": false,
  "stock_count": 8,
  "fund_count": 5,                   // mutual funds — NOT in /api/portfolio/user today; new
  "synced_at": "2026-07-09T11:58:00Z", // ISO; frontend renders "2 min ago"
  "equity_value": 5680000,           // current market value, ₹ (number)
  "invested_value": 4960000,         // total cost basis, ₹
  "today_change_value": 38200,       // ₹ P/L today (can be negative)
  "today_change_pct": 0.68,          // % (can be negative)
  "ytd_change_pct": 14.2,
  "return_6m_pct": 38.3,
  "value_trend": [                   // for the equity-value sparkline; ~6–12 points
    { "date": "2026-01-31", "value": 4100000 },
    { "date": "2026-02-28", "value": 4300000 }
    // …monthly close values, oldest → newest
  ],
  "cap_segments": [                  // market-cap allocation
    { "label": "Large cap", "value": 2950000, "count": 6, "pct": 52 },
    { "label": "Mid cap",   "value": 1760000, "count": 4, "pct": 31 },
    { "label": "Small cap", "value": 970000,  "count": 2, "pct": 17 }
  ],
  "industry_segments": [             // sector allocation, largest first, ~top 5 + "Other"
    { "label": "Financials",  "value": 1820000, "count": 3, "pct": 32 },
    { "label": "Technology",  "value": 1250000, "count": 3, "pct": 22 },
    { "label": "Industrials", "value": 910000,  "count": 2, "pct": 16 },
    { "label": "Healthcare",  "value": 850000,  "count": 2, "pct": 15 },
    { "label": "FMCG",        "value": 850000,  "count": 2, "pct": 15 }
  ]
}
```

### Field rules
- Segment `pct` values within `cap_segments` (and within `industry_segments`) should each sum to ~100.
- `count` = number of holdings in that bucket.
- Do **not** send colors — the frontend assigns segment colors from the design system.
- `empty: true` when no holdings; frontend shows the "Connect your portfolio" state.

---

## 3. What's Moving Feed  — `GET /api/portfolio/whats-moving?limit=4`

Personalized feed of score upgrades/downgrades, guidance revisions, and upcoming earnings for
symbols the user holds or watches.

Currently hardcoded as `MOVING_ITEMS`.

```bash
curl -s "https://api-dev.quantcase.ai/api/portfolio/whats-moving?limit=4" \
  -H "Authorization: Bearer $QC_AT" | jq
```

### Query params
- `limit` (optional, default 10) — max items to return.

### Response `data`

```jsonc
{
  "items": [
    {
      "id": "1",
      "symbol": "HINDUNILVR",
      "price": 2318.60,              // number, ₹
      "price_change_pct": 0.9,       // can be negative
      "kind": "score_upgrade",       // enum, see below
      "headline_label": "Management score upgraded",
      "headline_detail": "74 → 79",
      "body": "Q4 concall: rural volume recovery accelerated; pricing power maintained…",
      "qc_score": 79,                // 0–100
      "held": true,                  // does the user hold this?
      "holding_detail": "You hold 14 shares · 5.8% of equity book.", // human string; "Watching · not held." if !held
      "cta_label": "Open",           // "Open" | "Brief" etc.
      "href": "/screener/management?symbol=HINDUNILVR"
    }
  ]
}
```

### Field rules
- `kind` ∈ `"score_upgrade" | "score_downgrade" | "earnings"`. (Frontend colors/icons key off this.)
- `href` should deep-link into the app; `/screener/management?symbol=<SYMBOL>` is the current convention.
- Order = most relevant/recent first. Empty book → `{ "items": [] }`.

---

## 4. Discover Screens  — `GET /api/discover/screens`

Curated screener cards ("Promoter buying", "Cash-rich & growing", "52w lows"…) with counts
personalized to the user's sectors/holdings.

Currently hardcoded as `DISCOVER_SCREENS`.

```bash
curl -s https://api-dev.quantcase.ai/api/discover/screens \
  -H "Authorization: Bearer $QC_AT" | jq
```

### Response `data`

```jsonc
{
  "screens": [
    {
      "id": "promoter-buying",
      "icon": "activity",            // icon key (see below) — NOT raw SVG
      "badge_label": "+12 THIS WEEK", // optional
      "badge_kind": "warning",        // optional: "warning" | "new" | "info"
      "title": "Promoter buying – material disclosures",
      "description": "Promoters bought ₹100 Cr+ of own stock in the last 30 days…",
      "stats": [
        { "value": 23, "label": "NAMES" },
        { "value": 7,  "label": "QC SCORE >75" },
        { "value": 4,  "label": "IN YOUR SECTORS" }  // personalized to this user
      ],
      "href": "/screener/home?screen=promoter-buying"
    }
  ]
}
```

### Field rules
- **`icon` is a string key, not SVG.** The frontend currently inlines raw SVG; we'll map a small
  set of keys (`activity`, `trending-up`, `refresh`, …) to icons client-side. Send the key; if you
  must, agree the key list with frontend. Do NOT send `<svg>` markup.
- `badge_kind` drives badge color from the design system — don't send hex colors.
- `stats[].value` is a number; `label` is a short uppercase string.

---

## 5. Research Library Summary  — `GET /api/research-library/summary`

Counts for the research-library banner.

Currently hardcoded (`ResearchLibraryBanner` props).

```bash
curl -s https://api-dev.quantcase.ai/api/research-library/summary \
  -H "Authorization: Bearer $QC_AT" | jq
```

### Response `data`

```jsonc
{
  "new_ic_notes": 3,                 // new IC/research notes since last visit
  "catalysts_next_30_days": 5,       // upcoming catalysts in user's book/watchlist
  "subtitle": "DRHP verdicts, management commentary & thesis updates" // optional; frontend has a default
}
```

---

## 6. Market Indices  — `GET /api/market/indices`

NIFTY / SENSEX header ticker. **Not user-scoped** (same for everyone) but still behind auth.

Currently hardcoded in the page header.

```bash
curl -s https://api-dev.quantcase.ai/api/market/indices \
  -H "Authorization: Bearer $QC_AT" | jq
```

### Response `data`

```jsonc
{
  "indices": [
    { "symbol": "NIFTY",  "value": 24318, "change_pct": 0.42 },
    { "symbol": "SENSEX", "value": 79712, "change_pct": 0.38 }
  ],
  "as_of": "2026-07-09T11:58:00Z"    // ISO; optional
}
```

### Field rules
- `value` is a number; frontend formats with thousands separators.
- `change_pct` can be negative; sign drives the up/down color (currently hardcoded green).
- This can be lightly cached server-side (e.g. 30–60s) since it's shared across users.

---

## Notes for frontend follow-up (not backend work)

Once these ship, the frontend needs to:
- Add hooks (`useModSynopsis`, `usePortfolioSummary`, `useWhatsMoving`, `useDiscoverScreens`,
  `useResearchLibrarySummary`, `useMarketIndices`) using the existing `apiAuthGet` + envelope pattern.
- Change `HoldingsPanel` / `MODSynopsisCard` props from pre-formatted strings to numbers and format
  in the components.
- Swap `DiscoverScreens` `iconSvg` (raw SVG) for an icon-key mapping.
- Remove the hardcoded `MOVING_ITEMS`, `DISCOVER_SCREENS`, and header index literals.

## Priority order (suggested)
1. **`/api/portfolio/summary`** — highest value, mostly derivable from data you already have.
2. **`/api/portfolio/mod-synopsis`** — the hero card; core to the page.
3. **`/api/market/indices`** — small, shared, quick win.
4. **`/api/portfolio/whats-moving`**, **`/api/discover/screens`**, **`/api/research-library/summary`** —
   richer, can follow.
