# Wyckoff Analysis API — Backend Specification

**Goal:** move the entire Wyckoff engine off the browser. Today `/screener/wyckoff?symbol=HDFCBANK` fetches raw OHLCV and runs ~1,100 lines of analysis client-side. The backend should own that computation and return a single ready-to-render payload.

---

## 1. Current frontend flow (as-is)

| Step | Where | What happens |
|---|---|---|
| 1 | `src/app/(app)/screener/wyckoff/page.tsx:759` | `symbol` read from `?symbol=` query param |
| 2 | `src/hooks/usePrices.ts` | `GET {BACKEND_URL}/api/screener/{symbol}/prices` → full daily OHLCV history |
| 3 | `src/hooks/useScreenerInfo.ts` | `GET {BACKEND_URL}/api/screener/{symbol}/` → company name/exchange/sector (header only) |
| 4 | `page.tsx:770-787` | Maps `PriceBar[]` → `WyckoffBar[]`, runs `analyzeWyckoff()` off the main tick via `MessageChannel` |
| 5 | `src/lib/wyckoff.ts` (1068 lines) | **All** analysis: zigzag pivots, trading-range detection, event detection, phase classification, confidence scoring, narrative text generation |
| 6 | `page.tsx` | Renders PhaseCard, MetricsStrip, CycleSchematic, canvas chart, EventsGrid |

**Nothing is mocked.** The only static data is `WYCKOFF_CYCLE` (6 phase names) and `CYCLE_DESC` (6 static strings) — both can stay on the frontend.

Notable: the engine receives **full unfiltered history**; only the chart filters to the last 3 years. ATH/ATL, `r756`, and `posIn2yrRange` all need the full series.

---

## 2. Target API

### Endpoint

```
GET /api/screener/{symbol}/wyckoff
```

### Curl

```bash
curl -s 'https://api-dev.quantcase.ai/api/screener/HDFCBANK/wyckoff' \
  -H 'Accept: application/json'
```

With options:

```bash
curl -s 'https://api-dev.quantcase.ai/api/screener/HDFCBANK/wyckoff?chartYears=3&includeBars=true' \
  -H 'Accept: application/json'
```

### Query params

| Param | Type | Default | Meaning |
|---|---|---|---|
| `chartYears` | int | `3` | Years of OHLCV to include in `chart.bars`. Analysis always uses full history regardless. |
| `includeBars` | bool | `true` | Set `false` to omit `chart` and get just the analysis (lighter payload). |
| `minPct` | float | auto | Override the zigzag significance threshold. Omit to use the adaptive value. |

### Response envelope

Matches the existing backend convention (`{ success, data }` — see `src/lib/api.ts`):

```json
{
  "success": true,
  "data": { /* WyckoffResponse, below */ }
}
```

Errors: `404` unknown symbol, `422` insufficient history (< 20 bars) — return `success: true` with `meta.insufficientData: true` rather than an HTTP error, so the page can render the "Insufficient Data" state gracefully.

---

## 3. Response schema

```jsonc
{
  "symbol": "HDFCBANK",
  "ticker": "HDFCBANK.NS",
  "currency": "INR",              // NEW — drives ₹ vs $ formatting; today hardcoded ₹
  "asOf": "2026-07-17",           // date of the last bar
  "barCount": 2518,

  "meta": {
    "insufficientData": false,
    "minBarsRequired": 20,
    "zigzagMinPct": 4.2,          // the adaptive threshold actually used
    "engineVersion": "1.0.0"
  },

  "phase": {
    "type": "Re-Accumulation",    // Accumulation|Distribution|Re-Accumulation|Re-Distribution|Markup|Markdown
    "subPhase": "Phase C",        // ""|Phase A..D|Spring|SOS Pullback|SOS Breakout|UTAD|LPSY|Insufficient Data
    "confidence": 78,             // 0..95 integer
    "cycleIndex": 2,              // index into the 6-phase cycle, for the schematic
    "score": 4,                   // raw classifier score (transparency; frontend may hide)
    "description": "Price is pausing in a ₹1,580–₹1,720 range mid-uptrend…"
  },

  "signal": {
    "emoji": "⏸️",
    "title": "RE-ACCUMULATION — Next Leg Up Loading",
    "body": "Hold longs. Buy dips to range support ₹1,580 on drying volume…",
    "direction": "bullish"        // NEW — bullish|bearish|neutral, so UI can color without string-matching
  },

  "metrics": {
    "lastClose": 1683.40,
    "priceChangePct": 412.6,      // first bar → last bar, full history
    "structure": "uptrend",       // uptrend|downtrend|transitional|insufficient
    "priorStructure": "up",       // up|down
    "priorPctChg": 12.4,          // r126
    "pivotCount": 14,
    "volumeBias": "bullish",      // bullish|bearish|neutral
    "volumeDrying": false,
    "volumeRatio": 1.14,          // avgVol(10) / avgVol(all)
    "sma20": 1671.22,
    "allTimeHigh": 1794.00,
    "allTimeLow": 143.20,
    "pricePosition": 0.86,        // 0..1 within all-time range
    "posIn2yrRange": 0.91,
    "nearSwingHigh2yr": true,
    "nearSwingLow2yr": false,
    "correctionInUptrend": false,
    "returns": { "r126": 12.4, "r365": 24.1, "r504": 38.9, "r756": 61.2, "rMacro": 61.2 },
    "pctFromATH": -6.2
  },

  "tradingRange": {               // null when no active range
    "top": 1720, "bottom": 1580, "mid": 1650,
    "widthPct": 8.9,              // NUMBER (frontend currently gets a string — normalize here)
    "startBarIdx": 2398, "barCount": 120,
    "positionInRange": 0.74,      // NEW — computed server-side, currently derived in the page
    "density": 0.18, "totalMembers": 22, "lookback": 120,
    "resistanceCount": 11, "supportCount": 11,
    "levels": [                   // was tr.allRanges
      { "label": "Micro",  "lookback": 30,  "top": 1712, "bottom": 1640, "mid": 1676, "widthPct": 4.4, "density": 0.23, "members": 7,  "isPrimary": false },
      { "label": "Inner",  "lookback": 120, "top": 1720, "bottom": 1580, "mid": 1650, "widthPct": 8.9, "density": 0.18, "members": 22, "isPrimary": true }
    ]
  },

  "priorRange": {                 // null unless relevant; was `ptr`
    "top": 1650, "bottom": 1490, "mid": 1570, "widthPct": 10.7,
    "brokeUp": true, "brokeDown": false,
    "peakAfter": 1794, "troughAfter": 1602,
    "returnPct": 8.7, "positionInRange": 1.21,
    "startBarIdx": 2100, "barCount": 180
  },

  "localBreakout": {              // null unless an SOS micro-breakout is live
    "top": 1690, "bottom": 1612, "mid": 1651, "widthPct": 4.8,
    "startBarIdx": 2470, "barCount": 60,
    "breakoutDate": "2026-07-09", "breakoutClose": 1702,
    "breakoutVolume": 18400000, "rangeAvgVolume": 9100000, "volumeRatio": 2.02,
    "priorRallyPct": 21.3
  },

  "detections": {                 // structured; frontend no longer parses prose
    "ps":  { "detected": true,  "date": "2025-11-04", "barIdx": 2210, "price": 1502 },
    "sc":  { "detected": true,  "date": "2025-11-21", "barIdx": 2222, "price": 1466, "arHigh": 1588 },
    "st":  { "detected": true,  "date": "2025-12-18", "barIdx": 2240, "price": 1489 },
    "psy": { "detected": false },
    "bc":  { "detected": false },
    "sow": { "detected": false },
    "spring":   { "detected": true,  "date": "2026-03-11", "barIdx": 2402, "price": 1571 },
    "upthrust": { "detected": false }
  },

  "events": [                     // ordered, ready to render as the checklist
    {
      "tag": "RANGE", "label": "Trading Range", "ok": true,
      "text": "₹1,580–₹1,720 (8.9% wide, 120 bars) | Price at 74% of range",
      "values": { "bottom": 1580, "top": 1720, "widthPct": 8.9, "barCount": 120, "positionPct": 74 }
    },
    {
      "tag": "SC", "label": "Selling Climax", "ok": true,
      "text": "SC: 2025-11-21 — panic selling absorbed",
      "values": { "date": "2025-11-21" }
    }
    // …
  ],

  "pivots": [                     // zigzag, chronological — drives chart dots + labels
    {
      "type": "low", "index": 2222, "date": "2025-11-21", "price": 1466,
      "structureLabel": "HL",     // NEW — HH|LH|EH|HL|LL|EL, currently computed in the canvas draw loop
      "swingPct": -12.4,          // NEW — % change from previous pivot
      "eventBadge": "SC"          // NEW — SC|BC|SPR|UT|null
    }
  ],

  "chart": {                      // omit when includeBars=false
    "years": 3,
    "bars": [
      { "date": "2023-07-19", "open": 1642, "high": 1655, "low": 1631, "close": 1648, "volume": 8213400 }
    ],
    "sma20": [null, null, "…", 1671.22]   // aligned 1:1 with bars
  },

  "cycle": {                      // for the 6-segment schematic
    "phases": ["Accumulation","Markup","Re-Accumulation","Distribution","Markdown","Re-Distribution"],
    "activeIndex": 2
  }
}
```

---

## 4. What the backend must compute

Everything below is currently in `src/lib/wyckoff.ts`. Port it 1:1 — the engine is deterministic and side-effect-free (its only state is a memo cache).

### 4.1 Input

Full daily OHLCV, oldest→newest, **≥756 bars (~3y) strongly preferred**. Guard: if `n < 20`, return the insufficient-data shape (`phase.type = "Accumulation"`, `subPhase = "Insufficient Data"`, `confidence = 0`, empty arrays, all nulls).

> Bug to fix in the port: the current empty-result message says "Need at least 10 bars" while the guard is 20. Make it 20.

### 4.2 Zigzag pivot engine

Four stages:

1. **`detectPivots(bars, k=3)`** — fractal: bar `i` is a high if `high[i]` strictly exceeds all 3 bars either side. Symmetric for lows. A bar may be both.
2. **`alternateFilter`** — enforce strict high/low alternation; on consecutive same-type pivots keep the more extreme.
3. **`significanceFilter(zz, minPct)`** — iterate to a fixed point, dropping swings under `minPct`:
   - same-type collision → keep the extreme
   - opposite-type → keep whichever is further from `out[-2]`
4. **`dynamicMinPct(bars)`** — adaptive threshold. Sort all raw swing magnitudes ascending; walk **downward** from the largest, choosing the largest candidate `>= 3.0` that still yields `>= 6` pivots. Clamp to `[3, 15]`. Returns `3.0` if `n < 20` or fewer than 4 raw pivots.

> The UI labels this "ATR-based dynamic threshold" (`page.tsx:665`). There is no ATR — it is percentile-of-swings. Fix the label when the frontend is rewritten.

### 4.3 Volume analysis

```
swingVolume(bars, zz):
  take last 4 pivots (3 legs)
  per leg: intensity = sum(volume over leg bars) / legBarCount
  bucket into up-legs (ending at a high) vs down-legs (ending at a low)
  bias = avgUp > avgDn*1.2 ? "bullish" : avgDn > avgUp*1.2 ? "bearish" : "neutral"

isVolDrying(bars):
  avg(volume, last 20) < avg(volume, all) * 0.72
```

### 4.4 Event detectors

Common shape: rolling prior-window `avgVol`/`avgSpread`; `closePos = (close - low) / (high - low)`.

| Detector | Scan window | Prior window | Gates |
|---|---|---|---|
| **SC** (Selling Climax) | `i = 5 … n-3` | 60 | down bar; `spread > avgSpread*1.8`; `vol > avgVol*2.0`; `low <= priorLow*1.015` (new low); `closePos >= 0.4`. Forward-confirm over next `min(10, n-1-i)` bars: some close > SC close, and max close > SC close × 1.02. Returns **first** match, plus `arHigh` = max close in the confirm window. |
| **BC** (Buying Climax) | same | 60 | exact mirror: up bar; `high >= priorHigh*0.985`; `closePos <= 0.6`; forward min close < close × 0.98. Returns `arLow`. |
| **PS** (Preliminary Support) | `max(5, n-180) … n-2` | 60 | down bar; `spread > avgSpread*1.3`; `vol > avgVol*1.3`; `closePos >= 0.45`; `low <= priorLow*1.02`. **Excludes climactic bars** (`spread > 1.8× && vol > 2.0×`) so PS ≠ SC. |
| **PSY** (Preliminary Supply) | same | 60 | mirror of PS: up bar; `high >= priorHigh*0.99`; `closePos <= 0.55`. |
| **ST** (Secondary Test) | `scIdx+3 … min(scIdx+80, n)` | — | requires SC. `low <= scLow*1.08`; `vol < scVol*0.8`; `spread < scSpread*0.8`. |
| **SOW** (Sign of Weakness) | last 120 bars | 30 | down bar; `spread > avgSpread*1.3`; `vol > avgVol*1.4`; `posInTR <= 0.30`; `closePos <= 0.35`. |

**Spring** (state, not a bar): `lastClose >= tr.bottom` required. Walk zigzag lows at/after `tr.startBarIdx`, newest first; true if some low's bar **closed** below `tr.bottom * 0.999` and price has since recovered above `tr.bottom` **and** above that pivot's price.

**Upthrust**: mirror, but accepts either a close above `tr.top * 1.001` **or** a wick-only poke (`high > tr.top*1.001 && close <= tr.top`).

**Local breakout (SOS)**: needs `n >= 90`. On last 90 bars, 60-bar window. Gates: net high-drift < 8% and net low-drift < 8% (flat); `lastClose > trTop*1.005`; breakout bar within last 10; `breakoutVol / rangeAvgVol >= 1.5`; `priorRally = (trBottom - preRangeLow)/preRangeLow*100 >= 15`.

### 4.5 Trading-range detection (zone/density method)

Primary finder is **not** zigzag-based:

- 3-candle fractal pivots over a `lookback` window.
- `minZoneMembers = lookback <= 30 ? 2 : <= 60 ? 3 : <= 120 ? 5 : 6`.
- `densestZone(pivots)` — for each pivot price `a`, count pivots within `[a*0.985, a*1.015]`; densest wins. Applied separately to highs (resistance) and lows (support).
- **Rejection gates:** `top <= bottom`; `widthPct < 3 || > 15`; `density = (resMembers+supMembers)/lookback < 0.10`; both index-spans `< 10` (temporal-clustering guard); `lastClose` outside the rounded range.
- **Grid snapping:** `priceStep(p) = p<10 ? 0.1 : p<100 ? 1 : p<1000 ? 5 : p<10000 ? 10 : 50`. Bottom floors, top ceils, mid rounds.
- Run over `lookback ∈ [30, 60, 120, 180]`; sort by density desc; `candidates[0]` is primary.
- Surviving overlapping non-duplicates become `levels[]`. Dedupe when top **and** bottom within 3%, or one within 3% and the other within 5%. Label by width: `<=6 → "Micro"`, `<=12 → "Inner"`, else `"Macro"`.

A **legacy zigzag finder** (net-flat: `|netHigh| <= 5 && |netLow| <= 5` over lookbacks `[60,120,180]`) is used **only** to find `priorRange`.

### 4.6 Prior trend

Anchored at `tr.windowStart` (the trend *before* the range), or `n` if no range.

```
r126 = pctChange over 126 bars back
r365 = pctChange(365) ?? pctChange(252) ?? r126
r504 = pctChange(504) ?? r365
r756 = pctChange(756) ?? r504
rMacro = whichever of [r365, r504, r756] has the largest |value| (seeded with r365)

if      r126 <= -10 && pricePos > 0.65                          → "down"
else if r126 <= -10 && rMacro > 20 && r126 > -22 && pctFromATH > -30 → "up"
else if r126 > 10 && rMacro > -20                               → "up"
else if rMacro < -12                                            → "down"
else if rMacro > 15 && pctFromATH < -35                         → "down"
else if rMacro > 15 && pctFromATH >= -35                        → "up"
else if r126 < -5 && pctFromATH < -25                           → "down"
else if pricePos >= 0.50                                        → "up"
else                                                            → "down"
```

`pricePos` and `pctFromATH` use **full-history** ATH/ATL — hence the ≥756-bar requirement.

### 4.7 Phase classification

**If a trading range exists**, score it:

*Prior trend down — Accumulation vs Re-Distribution:*
```
score = 0
sc            → +2  else -2
spring        → +2
bc            → -1
pricePos < 0.20 → +2 | < 0.35 → +1 | > 0.70 → -2 | > 0.55 → -1
pctFromATH < -60 → +1 ; > -25 → -1
volBias bullish → +1 ; bearish → -1
volDrying     → +1
VETO: if !sc && !spring && pricePos >= 0.20 → score = min(score, 0)
result = score > 0 ? "Accumulation" : "Re-Distribution"
```

*Prior trend up — Distribution vs Re-Accumulation:*
```
score = 0
bc            → +3  else -2
upthrust      → posInTR >= 0.6 ? -1 : +2
pricePos > 0.85 → +2 | > 0.70 → +1 | < 0.40 → -2 | < 0.55 → -1
pctFromATH > -10 → +2 | > -20 → +1 | < -40 → -1
volDrying     → -1
volBias bearish → +1 ; bullish → -1
genuineUTAD = upthrust && posInTR < 0.5 && rMacro <= 50
VETO: if !bc && !genuineUTAD → score = min(score, 0)
result = score > 0 ? "Distribution" : "Re-Accumulation"
```

**If no trading range:** `phase = priorDir === "up" ? "Markup" : "Markdown"`.

**Prior-range override** (only when `priorRange` exists and no active range):

| brokeUp | position | → phase / subPhase |
|---|---|---|
| yes | still above | Re-Accumulation / SOS Pullback |
| yes | back inside | Re-Distribution / UTAD |
| no (brokeDown) | recovered | Re-Accumulation / Spring |
| no (brokeDown) | still weak | Re-Distribution / LPSY |

**A local breakout unconditionally forces** `Re-Accumulation / "SOS Breakout"`.

### 4.8 Sub-phase

```
Accumulation family:  spring → "Phase C" ; else sc → "Phase B" ; else "Phase A"
                      then: spring && posInTR > 0.6 && volBias != "bearish" → "Phase D"
Distribution family:  upthrust → "Phase C" ; else bc → "Phase B" ; else "Phase A"
                      then: upthrust && posInTR < 0.4 && volBias != "bullish" → "Phase D"
```

### 4.9 Confidence

Four mutually exclusive branches, then clamp to `[0, 95]`:

- **Trading range present:** base `55`; `+10` if `totalMembers >= 10`; `+5` if `>= 16`; `+5` if `lookback >= 120`; `+8` if volBias agrees with phase direction; `+8` for SC (accumulation family) or BC (distribution family); `+7` spring; `+7` upthrust; `+5` volDrying.
- **Prior range:** base `65`; `+7` if `returnPct > 10`; `+8` volBias agreement.
- **Local breakout:** `volRatio >= 2.0 ? 78 : 72`.
- **Trendless:** `|r126| > 20 ? 75 : |r126| > 10 ? 65 : 55`.

### 4.10 Narrative generation

`description`, `signal`, and `events[].text` are prose built per phase branch (see `wyckoff.ts:909-1000` for the exact templates). Two decisions for the backend:

1. **Keep generating them server-side** — one place to tune wording, no logic duplication. Recommended.
2. **Also return `values`** on every event and structured `detections` so the frontend never regex-parses prose.

**Currency:** every template currently hardcodes `₹`. Drive it off the new `currency` field so US tickers render `$`.

### 4.11 Chart-support fields to move server-side

The canvas draw loop currently derives these per frame (`page.tsx:253-261`). Precompute them:

- `pivots[].structureLabel` — `HH/LH/EH` and `HL/LL/EL` from consecutive same-type pivot % change, with a **±1.5% dead zone** yielding `EH`/`EL`.
- `pivots[].swingPct` — % change from the previous pivot.
- `pivots[].eventBadge` — `SC`/`BC` on the pivot nearest by index to `sc.barIdx`/`bc.barIdx`; `SPR` on the last low if `< tr.bottom*1.01`; `UT` on the last high if `> tr.top*0.99`.
- `chart.sma20` — aligned array with leading nulls.

---

## 5. Fields to drop or normalize in the port

| Current | Action |
|---|---|
| `failedBreakout`, `expandedRange` (top level) | Always `false`. **Drop.** |
| `TradingRange.failedBreakout`, `.expanded` | Never set true. **Drop.** |
| `width` as a string (`"7.3"`) on TR/levels/priorRange, but a number on localBreakout | **Normalize to `widthPct: number` everywhere.** |
| `priorWasUp` / `priorWasDown` | Redundant with `priorStructure`. **Drop.** |
| `phaseColor()` (`wyckoff.ts:1053`) | Unused by the page — it uses its own `phaseTokens` CSS-var map. Keep frontend-side, don't ship from the API. |
| Dead `avgVol`/`avgSpread` in `detectST` (`wyckoff.ts:325-326`) | Computed, never used. **Delete.** |
| "Need at least 10 bars" message vs the 20-bar guard | **Fix to 20.** |
| "ATR-based dynamic threshold" UI label | Inaccurate — it's percentile-of-swings. **Relabel.** |

---

## 6. Frontend changes once this ships

1. Replace `usePrices` + `analyzeWyckoff` with a single `useWyckoff(symbol)` hook hitting the new endpoint.
2. Delete `src/lib/wyckoff.ts` (keep only `phaseTokens`/`WYCKOFF_CYCLE` presentation constants, or move `CYCLE_DESC` into the API's `cycle` block).
3. Drop the `MessageChannel` deferral and the `analyzing` state — no client-side compute left.
4. Chart draws straight from `chart.bars`, `chart.sma20`, `pivots[]`, `tradingRange.levels[]`, `priorRange` — no derivation in the draw loop.
5. Render `₹`/`$` from `currency`, not a hardcoded symbol.

---

## 7. Performance notes

- The engine is deterministic and pure — safe to cache. Key on `(symbol, lastBarDate)`; invalidate on new EOD data. A daily-refresh cache is sufficient.
- Full-history scans (ATH/ATL, `dynamicMinPct` sorting all swings, 4× lookback range detection) are O(n log n) at worst on ~2,500 bars — milliseconds server-side.
- `dynamicMinPct` uses a memo keyed on `bars.length + "|" + lastClose.toFixed(2)`, capped at 500 entries. Keep an equivalent or drop it in favour of the response cache.
