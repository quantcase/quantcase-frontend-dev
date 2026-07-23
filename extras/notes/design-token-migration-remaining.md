# Design-Token Migration — Remaining Work (Handoff)

**Status as of this doc:** The QuantCase UI design-system overhaul is ~95% done. All **raw Tailwind palette classes** (`bg-emerald-600`, `text-zinc-500`, `border-red-200`, …) have been removed from the **entire** `src` tree (0 remaining), and all **class-based + top hex** offenders across user-facing + admin pages are migrated onto the `--qc-*` token system. Build is GREEN (48/48 pages), `tsc --noEmit` GREEN.

**What's left:** ~57 files still contain **hardcoded hex colors** that live *only* in inline `style={{}}`, JS constant maps, and chart color arrays (they have **zero** raw palette classes, which is why an earlier class-based sweep missed them). This doc is the complete, self-contained spec to finish them.

---

## Ground rules (read first)

1. **Single source of truth = `src/app/globals.css`.** All colors are `--qc-*` CSS custom properties in `@layer base :root`. Tailwind utilities (`bg-up`, `text-ink-2`, `border-hair`, …) and shadcn tokens are derived from them via `@theme inline`. Never introduce raw hex or raw Tailwind palette colors in app UI.

2. **These files use hex in JS/inline-style, not Tailwind classes.** So the fix is usually:
   - Inline `style={{ color: "#0F172B" }}` → `style={{ color: "var(--qc-ink)" }}`
   - JS map `const C = { foo: "#B23A2F" }` → `{ foo: "var(--qc-down)" }`
   - SVG/Recharts `fill="#1F7A4A"` / `stroke="#..."` → `fill="var(--qc-up)"` (CSS vars ARE valid SVG attribute values)
   - Tailwind arbitrary class `bg-[#F5F5F5]` → the token utility `bg-secondary`

3. **A shared chart-color module already exists: `src/lib/chart-tokens.ts`.** Use it for chart/data-viz files (see the CHART section). It exports:
   - `QC` — `var(--qc-*)` strings (`QC.up`, `QC.ink2`, `QC.blue`, …) for SVG `fill`/`stroke`.
   - `PILLAR` / `PILLAR_MUTED` — the recurring M/O/D dimension palette (M=blue, O=up/green, D=warn/amber).
   - `SEQUENTIAL` — the ONE centralized decorative multi-series ramp (for donuts/stacked bars with no semantic meaning).
   - `readQC(name, fallback)` — reads a `--qc-*` value via `getComputedStyle` for `<canvas>` contexts (which can't resolve `var()`).

4. **Verify after every batch:**
   ```bash
   cd /Users/atul/Documents/Workspace/scratchpad/quantcase/quantcase-frontend
   npx tsc --noEmit            # must stay exit 0
   npm run build               # must stay BUILD exit 0, 48 pages
   ```
   Per-file grep to confirm clean (no non-fallback hex, no raw palette classes):
   ```bash
   grep -nE "#[0-9A-Fa-f]{6}|-\[#[0-9A-Fa-f]" <file>          # should be empty (except var(--qc-x,#fallback) keeps)
   grep -nE "(text|bg|border|ring|from|to|via|divide|fill|stroke)-(emerald|green|red|rose|amber|yellow|orange|zinc|slate|gray|neutral|stone|violet|purple|indigo|sky|teal|cyan)-[0-9]" <file>   # must be empty
   ```

---

## HEX → TOKEN mapping table (apply by value AND intent)

| Hex (and common variants) | Token var | Token utility | Meaning |
|---|---|---|---|
| `#210B2C` `#0F172B` `#1C1917` `#121212` `#17140F` `#1a1a18` | `var(--qc-ink)` | `text-ink` / `bg-ink` | primary ink / navy |
| `#5A5A54` `#4A463D` `#475569` `#78716C` `#44403C` | `var(--qc-ink-2)` | `text-ink-2` | secondary text |
| `#9A9A92` `#888888` `#888` `#a1a1aa` `#aaa` `#A8A29E` | `var(--qc-ink-3)` | `text-ink-3` | tertiary/muted text |
| `#E9E7E1` `#E2E2E2` `#E7E4DC` `#EFEFEF` `#F0F0F0` `#D6D0C4` | `var(--qc-hair)` | `border-hair` | hairline border |
| `#EFEDE7` | `var(--qc-hair-2)` | — | inner/lighter hairline |
| `#FBFAF7` `#F5F5F5` `#f8f8f8` `#F7F5F0` `#FAFAFA` `#F8F8F8` | `var(--qc-section)` | `bg-secondary` | muted surface (= muted/accent) |
| `#FFFFFF` `#fff` (as a **card/panel bg**) | `var(--qc-card)` | `bg-card` | card surface |
| `#FFFFFF` `#fff` (as **text on a dark fill**) | `var(--qc-on-dark)` | `text-[var(--qc-on-dark)]` | on-dark text |
| `#1F7A4A` `#16A34A` `#15803D` `#22C55E` `#059669` | `var(--qc-up)` | `text-up`/`bg-up` | positive (green) |
| `#E3F1E8` `#DCFCE7` `#ECFDF5` `#F0FDF4` | `var(--qc-up-soft)` | `bg-up-soft` | positive soft bg |
| `#B23A2F` `#B91C1C` `#DC2626` `#EF4444` | `var(--qc-down)` | `text-down`/`bg-down` | negative (red) |
| `#F7E6E3` `#FEF2F2` `#FEE2E2` | `var(--qc-down-soft)` | `bg-down-soft` | negative soft bg |
| `#B4731A` `#B45309` `#D97706` `#F59E0B` | `var(--qc-warn)` | `text-warn`/`bg-warn` | caution (amber) |
| `#FAF0D8` `#FFFBEB` `#FEF3C7` | `var(--qc-warn-soft)` | `bg-warn-soft` | caution soft bg |
| `#3A6BEF` `#2563EB` `#3B82F6` | `var(--qc-blue)` | `text-blue`/`bg-blue` | state/pending |
| `#E9EEFE` `#DBEAFE` `#EFF6FF` | `var(--qc-blue-soft)` | `bg-blue-soft` | state soft bg |
| `#7C3AED` `#6D28D9` `#a78bfa` `#4C1D95` | `var(--qc-brand-accent)` | `text-brand-accent`/`bg-brand-accent` | interactive violet |
| `#EDE9FE` `#f5f3ff` | `var(--qc-brand-accent-soft)` | `bg-brand-accent-soft` | accent soft bg |
| `#DDD6FE` | `var(--qc-brand-accent-edge)` | — | accent edge/border |
| `#FFF5CA` | `var(--qc-lime)` | `bg-lime` | decorative lime |
| `#EAF7BC` | `var(--qc-lime-soft)` | `bg-lime-soft` | lime soft |
| `#C6DC8A` | `var(--qc-lime-edge)` | `border-lime-edge` | lime edge |
| `#C8A84B` | `var(--qc-golden-ink)` | `text-golden-ink` | golden text |

**Notes:**
- Where two shades collapse (`text-red-600` + `text-red-400` both → `text-down`), that's expected — the token system has one shade per semantic role.
- **No soft-*border* token exists.** For light alert boxes (`border-red-200 bg-red-50 text-red-600`), the established convention used across the migrated codebase is `border-down-soft bg-down-soft text-down` (soft-on-soft) — reuse it.
- `focus:ring-[#0F172B]` / `focus:border-[#0F172B]` / `accent-[#0F172B]` → keep the arbitrary-value token form: `focus:ring-[var(--qc-ink)]`, `focus:border-[var(--qc-ink)]`, `accent-[var(--qc-ink)]` (there is no bare `ring-ink`/`accent-ink` utility). `border-ink` and `text-ink`/`bg-ink` DO exist as utilities.

---

## EXCLUSIONS — do NOT migrate these (deliberate separate palettes)

- `src/components/landing/*` and `src/app/page.tsx` (landing root) — marketing palette (`.landing-root` vars + bare `'Geist'`/`'Instrument Serif'` fonts).
- `src/app/(app)/essays/*` — uses the landing palette.
- `src/components/signin/*`, `src/components/register/*`, `src/app/(app)/pricing/*` — auth/marketing (their functional error `text-red-600` was already migrated to `text-down`; leave the rest).
- `src/app/(onboarding)/*` **including `onboarding/_components/theme.ts`** — the onboarding flow has its OWN self-contained warm palette (cream `#EDE6D9`, brick `#8C2F27`, olive, Instrument Serif). Confirmed used only within onboarding. Tokenizing it would break the deliberate design. **Leave entirely.**
- `src/components/ui/badge.tsx` — its only "hex" is a code COMMENT (`// was hardcoded #F5F5F5/#90A1B9`); no action (or reword the comment if you want a 100%-clean grep).
- Any `var(--qc-x, #fallback)` — the hex is an intentional SSR/resolver fallback; leave it.
- `rgba(...)` low-alpha values (shading, scrims, `bg-black/40` modal overlays) — no token equivalent; leave them.

---

## Batch E1 — CHROME files (41 files, pure mechanical hex→var swap)

Apply the mapping table above. These are inline-style/JS-map/arbitrary-class chrome (ink, hair, surfaces, and obvious semantic up/down/warn/blue). No chart logic. Suggested parallelization: 3–4 subagents, ~10 files each.

```
src/components/model-builder/stepper-constants.ts          (26)
src/components/investor/connect-portfolio-modal.tsx        (22)
src/app/(app)/screener/technicals/_components/CandlestickChart.tsx  (9)   # NOTE: canvas? verify — if getContext/fillStyle present, use readQC() from chart-tokens.ts
src/components/opportunity/transcript-drivers-card.tsx     (9)
src/components/investor/place-order-modal.tsx              (8)
src/components/insight/insight-tab.tsx                     (6)
src/components/opportunity/investment-implications-card.tsx (6)
src/components/overview/technicals-card.tsx                (6)
src/components/investor/industry-signals-grid.tsx          (5)
src/components/dashboard/rm-portfolio-signal-graph.tsx     (4)   # has recharts — some fills may be CHART, see E2
src/components/fundamentals/cash-flow-waterfall.tsx        (4)
src/components/molecules/app-sidebar.tsx                   (4)
src/components/overview/fundamental-overview-card.tsx      (4)
src/hooks/useRazorpayCheckout.ts                           (4)
src/app/(app)/screener/industry-intelligence/_components/rotation-alerts-tab.tsx (3)
src/components/deal/deal-intelligence-card.tsx             (3)
src/components/management/management-intelligence-card.tsx (3)
src/components/molecules/checkbox-field.tsx                (3)
src/components/opportunity/intelligence-card-shared.tsx    (3)
src/components/overview/technicals/price-ladder-section.tsx (3)
src/lib/wyckoff.ts                                         (3)
src/app/(app)/diary/_components/streak-dots.tsx            (2)
src/app/(app)/wealthos/rms/page.tsx                        (2)
src/components/dashboard/todays-tasks.tsx                  (2)
src/components/fundamentals/balance-sheet-treemap.tsx      (2)   # treemap fills may be CHART
src/components/investor/shadow-portfolio.tsx               (2)
src/components/investor/upload-portfolio-modal.tsx         (2)
src/components/model-builder/step3-sub-classes.tsx         (2)
src/components/model-builder/stepper-header.tsx            (2)
src/components/overview/fundamentals/kpi-grid.tsx          (2)
src/lib/billing.ts                                         (2)
src/components/drhp/proceeds-table.tsx                     (1)
src/components/investor/holdings-tracker.tsx               (1)
src/components/investor/market-view-card.tsx               (1)
src/components/investor/research-library-banner.tsx        (1)
src/components/model-analytics/portfolio-data.ts           (1)
src/components/overview/fundamentals/shareholding-panel.tsx (1)
src/components/overview/fundamentals/valuation-hero-section.tsx (1)
src/components/overview/im-score/weighting-panel.tsx       (1)
src/components/overview/market-view-card.tsx               (1)
src/components/overview/technicals/momentum-volatility-panel.tsx (1)
```
(Counts are real, non-fallback hex per file.)

---

## Batch E2 — CHART / data-viz files (16 files) — use `src/lib/chart-tokens.ts`

Per the product decision: **tokenize semantic series, centralize decorative ramps** (do NOT flatten distinct data series onto one ink color — that hurts legibility).

Rules for these:
1. **Semantic series** (a loss bar, a gain line, a M/O/D dimension) → the matching `QC.*` var or `PILLAR`/`PILLAR_MUTED` from `chart-tokens.ts`. Example: `#B23A2F // interest cost` → `QC.down`; `#1F7A4A` gain → `QC.up`; M/O/D active `#2563EB/#1F7A4A/#B4731A` → `PILLAR.M/O/D`.
2. **Decorative multi-series ramp** (donut slices, stacked composition bars with no semantic meaning, e.g. `SHAREHOLDING_COLORS`, pnl revenue/expense purples) → replace the local array with `SEQUENTIAL` from `chart-tokens.ts` (slice it to the length you need). This keeps them distinct but single-sourced.
3. **Chart chrome** (grid lines, axis ticks, tooltip bg/border, label text) → `QC.hair`/`QC.ink3`/`QC.card` etc.
4. **Recharts** accepts `var(--qc-*)` strings directly in `fill`/`stroke`/`<Cell fill>`. **Canvas** (`getContext`/`fillStyle`) does NOT — use `readQC("--qc-up", "#1F7A4A")` at draw time (see the working example already in `src/app/(app)/screener/wyckoff/page.tsx` → `resolveCanvasColors()`).

```
src/components/opportunity/company-metrics-table.tsx       (15)
src/app/(app)/screener/industry-intelligence/_components/universe-browser-tab.tsx (13)
src/app/(app)/settings/page.tsx                            (8)
src/components/insight/insight-scorecard.tsx               (8)
src/components/opportunity/free-cash-flow-card.tsx         (8)   # recharts
src/components/opportunity/working-capital-card.tsx        (8)   # recharts
src/components/overview/im-score/pillar-pie-chart.tsx      (6)   # M/O/D → PILLAR / PILLAR_MUTED
src/app/(app)/screener/technicals/_components/MAPositionChart.tsx (5)
src/components/fundamentals/pnl-chart.tsx                  (5)   # recharts; revenue/expense purples → SEQUENTIAL, interest/opProfit/netProfit → QC.down/limeEdge/goldenInk
src/components/investor/holdings-panel.tsx                 (5)   # recharts
src/app/(app)/screener/industry-intelligence/_components/industry-ranking-tab.tsx (4)  # recharts
src/components/deal/historical-performance.tsx             (4)   # recharts
src/app/(app)/wealthos/analytics/page.tsx                  (3)   # recharts
src/components/drhp/ofs-donut.tsx                          (3)   # recharts donut → SEQUENTIAL
src/components/fundamentals/shareholding-charts.tsx        (3)   # SHAREHOLDING_COLORS array → SEQUENTIAL
src/components/molecules/multi-line-bar-combo-chart.tsx    (1)   # recharts
```

Also re-check these chart files that appeared with hex but may be pillar/semantic (grep them): `src/components/overview/im-score/pillar-pills.tsx`, `src/components/overview/signal-card.tsx`, `src/components/investor/mod-breakdown-drawer.tsx`, `src/components/overview/investment-conclusion-card.tsx`, `src/components/overview/decision-intelligence-panel.tsx` — if their hex is the M/O/D palette, use `PILLAR`; if chrome, use `QC.*`.

---

## Final verification (when both batches done)

```bash
cd /Users/atul/Documents/Workspace/scratchpad/quantcase/quantcase-frontend

# 1. Zero non-fallback hex in app UI (excluding the deliberate palettes)
grep -rlnE "#[0-9A-Fa-f]{6}|-\[#[0-9A-Fa-f]" src --include="*.tsx" --include="*.ts" \
  | grep -viE "/landing/|/essays/|/signin/|/register/|/pricing/|/onboarding/|onboarding/_components/theme|LandingJournal|LandingPoweredByAi|SignInPreviewCard|app/page\.tsx|chart-tokens\.ts|ui/badge\.tsx"
# For any file still listed, confirm remaining hex are ONLY var(--qc-x,#fallback) / readQC fallbacks / rgba / comments.

# 2. Zero raw palette classes anywhere
grep -rlE "(text|bg|border|ring|from|to|via|divide|fill|stroke)-(emerald|green|red|rose|amber|yellow|orange|zinc|slate|gray|neutral|stone|violet|purple|indigo|sky|teal|cyan)-[0-9]" src --include="*.tsx" --include="*.ts"

# 3. Green gates
npx tsc --noEmit          # exit 0
npm run build             # BUILD exit 0, 48 pages

# 4. Cascade proof (single-source-of-truth): temporarily change one token, e.g. --qc-up in globals.css,
#    to a sentinel like #00A0FF, run `npm run build` or check the dev server, confirm it cascades to
#    badges/charts/admin, then REVERT.
```

---

## Context already completed (so you don't redo it)

- Phases 0–2: `@theme inline` exposes all `--qc-*` as utilities; canonical primitives built (`ui/badge`, `ds/{StatusBadge,RatingBadge,ScoreGauge,ScoreValue,GradientPanel,CtaLink,Display}`); all originally-audited pages migrated; ~7,500 lines of dead `lens-detail-*` deleted.
- Batch A: shared primitives (`lib/utils.ts` dead mappers removed, `ui/tooltip`, `molecules/{metric-tile,expand-toggle,autocomplete-input,report-error-modal}`), and 3 bespoke badges folded into canonical (`opportunity/status-badge` + `wealthos/{priority,segment}-badge` are now thin adapters over `ds/StatusBadge`/`ds/Badge`).
- Batch B/C: all top user-facing files + the hex-in-JS front (`complete-journal-modal`, `PaywallOverlay`, `asset-action-bar` partial) + `#7C3AED`→`--qc-brand-accent` finish + wyckoff canvas resolver.
- Batch D: all 40 admin files migrated.
- **Stale-var fix (in globals.css):** 11 previously-undefined legacy token names (`--qc-text-heading`, `--qc-text-muted`, `--qc-border-default`, `--qc-surface-card`, etc., used across ~20 files and rendering with NO color) are now aliased to the real tokens. Do not remove these aliases.
- **`src/lib/chart-tokens.ts`** created (the shared chart-color module) — USE IT for Batch E2.

## One optional cleanup (nice-to-have)
Several alert boxes were mapped to `border-down`/`border-warn` (solid) because no soft-border token exists — slightly heavier than the original light borders. If desired, add `--qc-*-border` soft tokens (e.g. `--qc-down-border: #EBC5BF`) in globals.css + expose via `@theme`, then swap those solid alert borders. Purely cosmetic; not required for correctness.
