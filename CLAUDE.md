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

**Backend URL:** `https://qc-backend.mach33.club` (defined in [src/lib/constants.ts](src/lib/constants.ts))

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
- `molecules/` — Composed reusable components (AppHeader, SearchInput, AutocompleteInput, TabToggle, ResearchCard)
- `management/` — Feature-specific components for the management dashboard

### Path Aliases

`@/*` maps to `src/*` (configured in [tsconfig.json](tsconfig.json)).

### Key Files

- [src/lib/constants.ts](src/lib/constants.ts) — Backend URL, predefined call IDs
- [src/lib/utils.ts](src/lib/utils.ts) — Date formatting, badge variant helpers
- [src/types/management.ts](src/types/management.ts) — Core TypeScript types for the management dashboard
- [src/app/screener/management/page.tsx](src/app/screener/management/page.tsx) — Main dashboard page (~412 lines)
- [docs/page-management.md](docs/page-management.md) — Widget specifications for the management dashboard
- [docs/page-ai-transcript.md](docs/page-ai-transcript.md) — AI transcript analysis flow spec

## Design System

Derived from the opportunity page (`src/app/screener/opportunity/page.tsx`) — the canonical reference for all new UI work.

### Design Philosophy
Minimal, enterprise-grade investment research interface. Data-forward, high contrast, neutral palette. Color is used only for semantic meaning — never for decoration or category differentiation.

### Design Tokens

| Token | Value |
|-------|-------|
| Background | `#FFFFFF` (white), `#F5F5F5` (section/muted bg) |
| Heading text | `#0F172B` |
| Body text | `#121212` |
| Secondary/muted text | `#888888` |
| Tertiary text | `rgba(18,18,18,0.40)` |
| Border | `#E2E2E2` standard, `rgba(226,226,226,0.10)` inner panels |
| Primary / CTA | `#0F172B` (dark navy) |
| Font | IBM Plex Sans (CSS var `--font-ibm-plex-sans`) |

### Typography Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| h1 | 56px | 500 | `#0F172B` |
| h2 | 36px | 500 | `#0F172B` |
| h3 | 28px | 400 | `#0F172B` |
| h4 | 22px | 400 | `#0F172B` |
| h5 | 16px | 500 | `#0F172B` |
| h6 | 12px | 500 | `rgba(18,18,18,0.50)` |
| p / li | 14px | 400 | `#888888` |
| small | 11px | 400 | `#888888` |
| Section label | 14px | 600 | `#0F172B`, uppercase, `letter-spacing: 0.01em` |
| Table header | 10px | 500 | `#888888`, uppercase, wider tracking |

### Semantic Colors (use ONLY for meaning, never decoration)

| Color | Class | Use when |
|-------|-------|----------|
| Emerald | `text-emerald-600` | Positive: ACHIEVED, HIGH trust, gains, buy |
| Red | `text-red-600` | Negative: MISSED, LOW trust, losses, sell |
| Amber | `text-amber-600` | Warning: neutral patterns only |
| Blue | `text-blue-600` | State: PENDING / processing jobs |
| Zinc | `text-zinc-500` | Icons, secondary chrome, decorative elements |

**Rule:** Icons, bullets, category labels, score breakdowns — use neutral zinc. Reserve semantic colors for actual data meaning.

### Component Patterns

**Confidential Banner** (unified across all pages):
```
bg-zinc-900 dark:bg-zinc-700 text-white text-xs font-semibold text-center py-2 px-4 sticky top-0
```

**Section Panel** (`SectionPanel` molecule):
- Outer wrapper: `rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2`
- Header area: `px-2 pt-1 pb-3`
- Inner content box: `rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4`

**Card** (`Card` shadcn/ui):
```
bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg
```

**Metric Tile** (`MetricTile` molecule):
```
rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-2
```
- Icon box: `p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]` (16×16px icon)
- Label: `text-[11px] uppercase tracking-wider text-[#888888]`
- Value: h3 size (28px), `#0F172B`

**Badge** (default):
```
bg-[#F5F5F5] text-[#90A1B9] text-xs font-medium rounded-sm
```

**Status Indicators** (guidance rows, job states):
- ACHIEVED: `text-emerald-600` + `CheckCircle2` icon + `border-l-4 border-l-emerald-600`
- MISSED: `text-red-600` + `XCircle` icon + `border-l-4 border-l-red-600`
- PENDING: `text-blue-600` + `Clock` icon + `border-l-4 border-l-blue-600`

**Scenario Cards** (Bear / Base / Bull):
- All three cards use identical neutral styling: `bg-white border border-zinc-200`
- Icons: `bg-zinc-100 dark:bg-zinc-800` bg, `text-zinc-600 dark:text-zinc-400` color
- Bullets: `bg-zinc-400`
- Labels: uppercase zinc text — differentiate with words, NOT color

**Bar Charts** (Recharts):
- Primary series (Revenue): `fill="#0F172B"` (dark navy)
- Secondary series (EBITDA, etc.): `fill="#d4d4d8"` (zinc-300)

**IM Score Gauge** (SVG tick gauge):
- Filled ticks: `#0F172B` (dark navy, not green)
- Empty ticks: `#d1d5db`
- Rating badge: `bg-zinc-900 text-white rounded-full`
- Score breakdown values: `text-zinc-900 font-semibold` (no per-category colors)

**Price Position Indicator** (range bars):
- Current price marker: `bg-zinc-900` (not indigo or blue)

### Borders & Radius
- Base radius: `--radius: 0.625rem` (10px)
- Cards/panels: 10px
- Icon boxes: 6px
- Buttons: `rounded-md`
- Badges: `rounded-sm`
- Toggle pills: `rounded-full`
