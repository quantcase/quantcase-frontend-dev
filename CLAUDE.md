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
