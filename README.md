# QuantCase Frontend

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-new--york-000000)

AI-powered investment-research terminal for Indian equities. QuantCase turns company disclosures
(earnings-call transcripts, filings) into structured, scored research across analysis pillars —
management quality, opportunity, deal/valuation — and delivers it through a stock screener, investor
dashboards, a journal, and an advisor (WealthOS) workspace.

Built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, and
**shadcn/ui**. It talks to a separate QuantCase backend over a simple REST API.

```mermaid
flowchart LR
    DISC["Company disclosures<br/>transcripts · filings · financials"] --> PIPE["AI pipeline<br/>L1 → L2 → L3 → L4"]
    PIPE --> SCR["Screener terminal"]
    PIPE --> INV["Investor dashboard"]
    PIPE --> DJ["Diary / Journal"]
    PIPE --> WOS["WealthOS (advisor)"]
    ADMIN["Admin content-ops<br/>curates + dispatches"] --> PIPE
```

## Quick start

```bash
npm install
npm run dev      # → http://localhost:3000
```

In local dev the app expects a backend on **`http://localhost:8000`** for data-driven pages (the URL
is environment-switched in [`src/lib/constants.ts`](src/lib/constants.ts)). No `.env` file is
required — see [Getting started](docs/getting-started.md) for details.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (HMR) |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run lint` | ESLint |

## Documentation

Full documentation lives in [`docs/`](docs/README.md) — start with the [documentation hub](docs/README.md)
for the visual map. Highlights:

- **Foundations** — [Getting started](docs/getting-started.md) · [Architecture](docs/architecture.md) · [Routing & auth](docs/routing-and-auth.md)
- **Data & AI pipeline** — [Data fetching](docs/data-fetching.md) · [Pipeline & analysis layers](docs/pipeline-layers.md) 🔑 · [Async jobs](docs/async-jobs.md)
- **Feature modules** — [Screener](docs/screener.md) · [Investor](docs/investor.md) · [Diary & Journal](docs/diary-journal.md) · [WealthOS](docs/wealthos.md) · [Model builder](docs/model-builder.md) · [Platform flows](docs/platform-flows.md)
- **Admin & ops** — [Admin & content-ops](docs/admin.md)
- **Design** — [Components](docs/components.md) · [Design system](docs/design-system.md)

For contributor/agent conventions and the design-system contract, see
[`CLAUDE.md`](CLAUDE.md). Archived design mockups and backend/product specs live in
[`extras/`](extras/README.md) (not part of the live frontend).

## Project layout

```
src/
  app/          App Router routes (route groups: (app), (onboarding))
  components/   ui/ · ds/ · molecules/ · feature dirs
  hooks/        data-fetching + job-polling hooks
  lib/          api.ts, constants.ts, adapters, utils
  types/        TypeScript types (models/ holds a small older set)
docs/           this documentation
extras/         archived mockups, specs, notes
```
