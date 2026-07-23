# Components

UI follows **atomic design** under [`src/components/`](../src/components/). Layers build upward:
`ui/` (primitives) → `ds/` (the QuantCase design system) → `molecules/` (composed chrome/widgets) →
feature directories. **Build new UI from `ds/`**, dropping to token utilities only when composing
something genuinely new. See [Design system](design-system.md) for the tokens these layers consume.

## `ui/` — shadcn/ui primitives

The base layer: `button`, `card`, `badge`, `input`, `table`, `progress`, `tooltip`. Styled with `cva`
against the shadcn semantic tokens (which themselves derive from `--qc-*`). You rarely import these
directly in feature code — prefer the `ds/` layer.

## `ds/` — the canonical QuantCase design system

[`src/components/ds/`](../src/components/ds/) (barrel export `ds/index.ts`). **This is the layer to
reach for.** It encodes the design contract so semantics stay consistent. Key primitives:

| Primitive | Role |
|-----------|------|
| `Badge` (+ `RatingBadge`, `StatusBadge`) | The one chip/badge. `RatingBadge` = STRONG/FAIR/WEAK (semantic); `StatusBadge` = semantic dot pill. |
| `ScoreGauge` + `ScoreValue` | The one score visualization (`ring \| half-arc \| bar`) and the "N/100" big number. Filled stroke is navy `--qc-ink` (magnitude, not sentiment). |
| `GradientPanel` (+ `DarkGradientCard`, `GoldenCard`, `LimeGradientCard`) | The one dark/accent surface. `tone`: `dark \| golden \| lime \| verdict`. |
| `CardShell`, `CommonCard`, `SectionHeader`, `SignalTile`, `MonoLabel`, `ColorRail`, `Display` | Layout & data building blocks. |
| `CtaLink`, `ActionButton` | Tertiary text+arrow action / action button. |
| `DecisionIntelligenceShell` (+ `DecisionSection`, `Eyebrow`, `Divider`) | The "decision intelligence" section frame. |

The design contract (color = meaning only, serif for hero, mono for data) is enforced here and
documented in [`../CLAUDE.md`](../CLAUDE.md) and [Design system](design-system.md).

## `molecules/` — composed shared chrome & widgets

[`src/components/molecules/`](../src/components/molecules/). App chrome and reusable composites:

- **Chrome:** `top-bar`, `app-sidebar`, `main-content-wrapper`, `user-menu`. (There is **no**
  `AppHeader` — chrome is top-bar + sidebar.)
- **Page frames:** `screener-page-shell` (the standard screener page frame, takes `companyInfo` +
  `navItems`), `asset-action-bar` (the fixed floating action dock), `in-page-nav`.
- **Navigation:** `tab-toggle` (the one tab component — `pill` / `underline`).
- **Search/inputs:** `autocomplete-input`, `stock-search`, `google-signin-button`, `checkbox-field`,
  `tag-multi-picker`, `kpi-abbr-picker`, `expand-toggle`.
- **Data:** chart wrappers (`apex-chart`, `multi-line-bar-combo-chart`), tables
  (`peer-comparison-table`, `tabular-card`), plus `metric-tile`, `section-panel`, `icon-box`,
  `screener-scorecard`, `similar-stocks`, `report-error-modal`.

## Feature directories

Feature UI is grouped by surface. The notable ones:

- [`insight/`](../src/components/insight/) — **the shared engine** for the management / opportunity /
  deal factor pages. [`insight-tab.tsx`](../src/components/insight/insight-tab.tsx) is the core:
  `<InsightTab type={InsightType} />`, so each of the three pages is a one-line delegator. It composes
  `useAnalysis` + screener data + lenses and renders the scorecard, lenses, signal map, thesis, key
  signals, and lens drawer. (On the Deal page it clones the Opportunity page's `industry-analysis`
  lens — frontend-only, no extra fetch.)
- [`management/`](../src/components/management/) — the management dashboard widgets (analyze/reanalyze,
  intelligence card, score breakdown, guidance track, thesis, red flags, promoter, decision
  intelligence).
- [`overview/`](../src/components/overview/) — the company overview page (IM score, fundamentals,
  key ratios, technicals card, decision-intelligence panel).
- [`deal/`](../src/components/deal/) — deal/valuation widgets (EPS engine, quality of earnings,
  PE-rerating, target-price matrix, valuation-vs-peers, risk/reward).
- [`investor/`](../src/components/investor/) — the investor dashboard (research hero, holdings,
  shadow portfolio, portfolio connect/upload modals, MOD synopsis, industry signals).

Other feature dirs: `dashboard/`, `wealthos/`, `opportunity/` (the largest), `model-builder/`,
`model-analytics/`, `fundamentals/`, `journal/`, `landing/`, `drhp/`, `portfolio/`, `paywall/`,
`signin/`, `register/`, `ic-report/`, and `providers/` (`AuthGuard`, `UserContext`, `ThemeProvider`,
`PaywallProvider`, `OnboardingGuard`, `IntercomProvider`).

## Types

Component/data shapes live in [`src/types/`](../src/types/). The hub is
[`analysis.ts`](../src/types/analysis.ts) (`InsightType`, `InsightData`, `InsightLens`, and the layered
wire shapes `L3*` / `L4*`). Other notable files: `management.ts` (scores + job/pipeline types),
`overview.ts`, `deal.ts`, `opportunity.ts`, `screener.ts`, `technicals.ts`, `wyckoff.ts`,
`industry-intelligence.ts`, `journal.ts`, `wealthos.ts`, `auth.ts`. A small older set of models is in
[`src/models/`](../src/models/) (`summary.ts`, `call.ts`).
