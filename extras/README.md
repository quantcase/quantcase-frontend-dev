# extras/ — archived material

This folder is an **archive**. Nothing here is part of the live QuantCase frontend or its
documentation — it's design mockups, backend/product specs, and one-off notes that used to sit in
`docs/` but don't describe the frontend codebase. Kept for reference; safe to ignore when working in
the app. For real project documentation see [`../docs/`](../docs/README.md).

## `mockups/` — standalone HTML design prototypes

Single-file HTML page mockups / design exports (inline styles, not maintained). Superseded by the
real implementations under `src/`.

| File | What it is |
|------|------------|
| `canara_mqi_redesigned.html` | "Canara Bank · MQI Forensic Brief" redesign prototype |
| `design-sample.html` | Overview page sample (ONGC) — largest export, clipped reference |
| `landing-page-reference.html` | Marketing landing page reference mockup |
| `quantcase-brief.html` | Client brief prototype (persona example) |
| `quantcase-complete-journal.html` | "Complete your journal" modal/page prototype |
| `quantcase-home-v3_4.html` | Home page mockup (versioned iteration) |
| `quantcase-onboarding-v3 (1).html` | Onboarding flow mockup (download duplicate) |
| `quantcase-portfolio_1.html` | Portfolio page prototype |
| `rm_home.html` | RM home page mockup (from the old `docs/design-system/` folder) |
| `wyckoff-analyzer.html` | Wyckoff phase analyzer prototype (now shipped in `src/`) |

## `specs/` — backend / product specifications

API contracts and product docs for backend/adjacent surfaces — not frontend UI documentation.

| File | What it is |
|------|------------|
| `journal-backend-spec.md` | Backend API spec for the Investment Journal feature |
| `investor-dashboard-backend-spec.md` | Backend API spec for `/investor/dashboard` widgets |
| `diary-backend-changes.md` | Backend field additions for the `/diary` page |
| `wealthos-api.md` | WealthOS (advisor CRM) API reference |
| `prd.md` | WealthOS PRD + technical design document |
| `api-wyckoff.md` | Spec to move Wyckoff analysis to the backend (largely shipped) |

## `notes/` — one-off working notes

| File | What it is |
|------|------------|
| `design-token-migration-remaining.md` | Point-in-time hex→token migration handoff/punch-list |
