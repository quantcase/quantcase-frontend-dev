# QuantCase Frontend — Documentation

QuantCase is an AI-powered investment-research terminal for Indian equities. It turns raw company
disclosures (earnings-call transcripts, filings) into structured, scored research across a set of
analysis "factors" — management quality, opportunity, deal/valuation — and surfaces them through a
screener, investor dashboards, and an advisor (WealthOS) workspace.

This is the **frontend** — a Next.js 16 (App Router) + React 19 + TypeScript app that talks to a
separate QuantCase backend over a simple REST API.

## Documentation index

| Doc | What's inside |
|-----|---------------|
| [Getting started](getting-started.md) | Prerequisites, install, dev/build/lint scripts, config files, and the local-backend expectation. Start here. |
| [Architecture](architecture.md) | Tech stack, App Router layout, route groups, the full route map, provider stack, and project conventions. |
| [Routing & auth](routing-and-auth.md) | `AuthGuard`, account types and access flows, admin gating, and the URL-param state convention. |
| [Data fetching](data-fetching.md) | The `api.ts` callback pattern, the `{ success, data }` envelope, the hook convention, and the adapter layer. |
| [Async job pipeline](async-jobs.md) | How AI analysis jobs are triggered and polled (the BullMQ flow) and how progress is animated. |
| [Components](components.md) | The atomic-design layers (`ui/` → `ds/` → `molecules/` → feature dirs) and where to build new UI. |
| [Design system](design-system.md) | The authoritative `--qc-*` token language, themes, typography, and primitive patterns. |

### Page specs

Widget-level specifications for individual pages:

- [Management dashboard](page-management.md) — the `/screener/management` factor page.
- [AI transcript](page-ai-transcript.md) — the AI transcript analysis flow.

### Related

- [`../CLAUDE.md`](../CLAUDE.md) — contributor/agent guidance and the design-system contract (the
  rules new UI must follow).
- [`../extras/`](../extras/README.md) — archived design mockups, backend/product specs, and one-off
  notes. Not part of the live frontend.
