# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

QuantCase is an AI-powered investment research frontend for analyzing company earnings calls and management quality. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

### Routing

Uses the Next.js App Router. Key routes:
- `/` — Home/landing page
- `/screener/home` — Stock screener with autocomplete search
- `/screener/management` — Management analysis dashboard (main feature)
- `/summary` — Earnings call summary analysis
- `/transcript` — Transcript display

Navigation passes state via URL query params (e.g., `?symbol=AAPL`, `?callId=123`).

### API Layer

**Backend URL:** `https://api-dev.quantcase.ai` (defined in [src/lib/constants.ts](src/lib/constants.ts))

All API calls go through two utility functions in [src/lib/api.ts](src/lib/api.ts):
- `apiCall<T>(url, callbacks)` — GET requests
- `apiPost<T>(url, callbacks, body)` — POST requests

Both use a **callback pattern**: `{ onStart, onSuccess, onError, onComplete }`. The backend returns `{ success: boolean, data: T }`.

### Data Fetching

Custom hooks handle all data fetching:
- `useSummary(callId)` — Fetches summary data for an earnings call
- `useManagementAnalysis(callId, timeframe)` — Fetches management dashboard data; timeframe options: `current_quarter`, `rolling_3_year`, `full_history`
- `useTranscriptCalls(symbol)` — Fetches list of calls for a stock symbol

No global state manager (no Redux/Zustand/Context). State is local to components/hooks.

### Async Job Processing

The backend uses BullMQ for async analysis jobs. The frontend:
1. POSTs to `/api/calls/{callId}/summarize` to trigger analysis
2. Polls `/api/jobs/{jobId}` every 2 seconds until `completed` or `failed`
3. Animates a progress bar to 95% over ~40 seconds while waiting

### Component Structure

Follows atomic design under [src/components/](src/components/):
- `ui/` — Base shadcn/ui primitives (Button, Card, Badge, Table, Progress, etc.)
- `ds/` — QuantCase design-system primitives built on `--qc-*` tokens (Badge, GradientPanel, ScoreGauge, ScoreValue, CtaLink, SignalTile, MonoLabel, CardShell, SectionHeader). **This is the canonical component layer — build new UI from here.**
- `molecules/` — Composed shared components (`top-bar`, `app-sidebar`, `tab-toggle`, `autocomplete-input`, `in-page-nav`, `screener-page-shell`, `asset-action-bar`). Note: there is **no** `AppHeader`/`SearchInput`/`ResearchCard` — chrome is `top-bar` + `app-sidebar`.
- `management/`, `insight/`, `overview/`, `deal/`, `investor/` — Feature-specific components.

### Path Aliases

`@/*` maps to `src/*` (configured in [tsconfig.json](tsconfig.json)).

### Key Files

- [docs/README.md](docs/README.md) — Documentation hub (setup, architecture, flows, pipelines, components)
- [src/lib/constants.ts](src/lib/constants.ts) — Backend URL, predefined call IDs
- [src/lib/utils.ts](src/lib/utils.ts) — Date formatting, badge variant helpers
- [src/types/management.ts](src/types/management.ts) — Core TypeScript types for the management dashboard
- [src/components/insight/insight-tab.tsx](src/components/insight/insight-tab.tsx) — Shared engine for the management/opportunity/deal pages (each page is a thin `<InsightTab type=… />` delegator)
- [docs/page-management.md](docs/page-management.md) — Widget specifications for the management dashboard
- [docs/page-ai-transcript.md](docs/page-ai-transcript.md) — AI transcript analysis flow spec

## Design System

**Single source of truth: [src/app/globals.css](src/app/globals.css).** All design tokens are `--qc-*` CSS custom properties defined once in `@layer base :root`. The shadcn semantic tokens (`--background`, `--primary`, `--border`, …) and the Tailwind utilities exposed via `@theme inline` are all *derived* from `--qc-*`. **Change a `--qc-*` value in globals.css and it cascades everywhere.** Never hardcode hex or reach for raw Tailwind palette colors (`bg-emerald-600`, `text-zinc-500`) in app UI — use the token utilities below.

### Design Philosophy
Minimal, enterprise-grade investment research interface. Serif display + mono data aesthetic. Color is used ONLY for semantic meaning — never for decoration or category differentiation.

### The styling contract (one way to build UI)
Use **Tailwind utility classes mapped to `--qc-*` tokens** (via `@theme inline`), composed with `cva` in the `ds/`/`ui/` primitives. Do **not** use inline `style={{}}` with `var(--qc-*)` in new code — that older pattern is being migrated out. Prefer the canonical primitives (`ds/*`); only drop to token utilities directly when composing something new.

### Tokens → Tailwind utilities
Fonts: `font-sans` (IBM Plex Sans, default), `font-serif` (IBM Plex Serif, **H1/hero display only**), `font-mono` (IBM Plex Mono, **all numeric/data**). Also the `.serif` / `.mono` utility classes (add display/mono letter-spacing).

Semantic data colors (exclusive meaning — see below): `up`/`up-soft`, `down`/`down-soft`, `warn`/`warn-soft`, `blue`/`blue-soft` → e.g. `text-up bg-up-soft`. Ink scale: `text-ink`, `text-ink-2`, `text-ink-3`. Hairline: `border-hair`. Accents: `text-brand`, `bg-lime`/`bg-lime-soft`, `text-golden-ink`.

Raw token vars (for arbitrary values when needed): surfaces `--qc-surface/-section/-card`; type scale `--qc-fz-9…-68`; weights `--qc-w-light…-bold`; tracking `--qc-track-*`; radii `--qc-r-2…-pill`; spacing `--qc-s-1…-14`; shadows `--qc-shadow-shell/-annot`; dark-card gradient `--qc-dark-card-*`.

### Typography
Baked into `@layer base` in globals.css (`h1`–`h6`, `p`, `li`, `small`). **Rule:** serif for H1/hero moments only; sans everywhere else; mono for every numeric/data value (prices, scores, %). Use `.eyebrow` for uppercase labels, `.body-sm` for secondary body, `.status-label` for status text.

### Semantic colors (use ONLY for meaning — exclusive, never decoration)

| Meaning | Token utility | Use when |
|---------|---------------|----------|
| Positive | `text-up` / `bg-up-soft` (`--qc-up` green) | gains, ACHIEVED, HIGH trust, STRONG, buy |
| Negative | `text-down` / `bg-down-soft` (`--qc-down` red) | losses, MISSED, LOW trust, WEAK, sell |
| Caution | `text-warn` / `bg-warn-soft` (`--qc-warn` amber) | warnings/FAIR ONLY — **never** for a strong score |
| State | `text-blue` / `bg-blue-soft` (`--qc-blue`) | PENDING / processing jobs |
| Neutral chrome | `text-ink-2` / `text-ink-3` | icons, bullets, category labels, breakdowns |

**Exclusivity rule (audit fix):** green = positive, red = negative, amber/gold = caution only, brand = interactive. Amber must NOT decorate a strong score, and STRONG ratings render green — enforced by the `Badge` primitive.

### Canonical primitives — reach for these, don't reinvent
- **`Badge`** (`ds/`) — the ONE chip/badge. Variants: `status` (semantic dot pill ✓/✕/⚡), `label` (neutral category tag), `rating` (STRONG/FAIR/WEAK, semantic). Fixed padding/radius/size tokens.
- **`ScoreGauge`** + **`ScoreValue`** (`ds/`) — the ONE score visualization. `ScoreGauge` shapes: `ring | half-arc | bar | radar`. Filled stroke = `--qc-ink` navy (not green), consistent stroke weight. `ScoreValue` = the "N/100" big-number.
- **Buttons** — `ui/button.tsx`: primary = filled navy (`default`), secondary = `outline` pill, tertiary = **`CtaLink`** (`ds/`, text + arrow). Map every action to one tier.
- **`GradientPanel`** (`ds/`) — the ONE dark/accent surface. `tone`: `dark | golden | lime | verdict`. Backed by `.qc-dark-gradient-card` + `--qc-dark-card-*`. Do not hardcode `linear-gradient()` navy/purple ramps.
- **`TabToggle`** (`molecules/`) — the ONE tab component (`pill` / `underline` variants). Top-nav = section level, sub-nav = within-section; no label repeated at both levels.
- **`Card`** (`ui/`), **`SectionHeader`**/**`CardShell`**/**`SignalTile`**/**`MonoLabel`** (`ds/`) — layout/data building blocks.

### Borders & Radius
Base `--radius: 0.625rem` (10px). Radii tokens `--qc-r-2` (4px) … `--qc-r-pill` (999px). Cards/panels 10px, icon boxes 6px, buttons `rounded-md`, badges `rounded-sm`, toggle pills `rounded-full`.

> Historical note: earlier UI used a `#0F172B`/zinc/`text-emerald-600` palette and `SectionPanel`/`MetricTile`/`AppHeader` molecules. Those are legacy — the token system above supersedes them. Migrate such code onto tokens when you touch it.
