# QuantCase Design System

[← Back to docs hub](README.md) · see also [Components](components.md) and the design-system contract in [`../CLAUDE.md`](../CLAUDE.md)

This document captures the full design language, CSS variables, component patterns, and implementation guidelines for QuantCase — inspired by the lime-green UI visible in the screenshots. Use this as the authoritative reference when redesigning or building new pages.

> [!IMPORTANT]
> The single source of truth for tokens is [`src/app/globals.css`](../src/app/globals.css) — all `--qc-*`
> custom properties are defined there and everything else derives from them. Never hardcode hex or raw
> Tailwind palette colors in app UI.

---

## Philosophy

**Data-forward, enterprise-grade investment research UI.** Every design decision serves legibility and trust.

- **Warmth over cold white**: base backgrounds are warm off-white/cream (#EDECE8), not pure white
- **Lime accent as signal, not decoration**: the acid-lime (#D4F26A / #C7F036) is used only for active states, CTAs, and positive verdicts — never as a background fill for visual interest
- **IBM Plex Mono for all data**: numbers, labels, eyebrows, and verdicts use monospace; prose uses the body font (IBM Plex Sans / Inter)
- **Color means something**: green = up/positive, red = down/negative, amber = neutral/warning. Never use these for categories or decoration
- **Generous radius, tight spacing**: 14–18px radius on hero cards, 10px on panels, 6px on chips/badges. Inner spacing is compact (8–14px padding), not airy

---

## Themes

Five theme variants exist, all driven by `--qc-*` CSS variables. Apply the class to `<html>` or a wrapper element.

| Class | Style | Accent |
|---|---|---|
| *(default)* | Light Modern — warm cream | Lime `#D4F26A` |
| `.theme-dark-modern` | Dark — deep indigo + bright lime | Lime `#C7F036` |
| `.theme-light-enterprise` | Light Enterprise — cool white | Lime `#BFD95A` |
| `.theme-dark-enterprise` | Dark Enterprise — jet black | Gold `#C9A84C` |
| `.theme-luxury` | Luxury — near-black + tan | Tan `#D4AF7F` |

The screenshots reflect **Light Modern** (default) and **Dark Modern**.

---

## CSS Variables — Full Reference

All variables are defined in `src/app/globals.css`. Use `var(--qc-*)` in components instead of raw color values so themes work automatically.

### Text

```css
--qc-text-heading    /* Primary labels, h1–h5, values          Light: #0E0E0C */
--qc-text-body       /* Body copy, secondary labels             Light: #5A5A54 */
--qc-text-muted      /* Captions, eyebrows, table headers       Light: #9A9A92 */
--qc-text-dimmed     /* Ghost text, placeholders                Light: rgba(14,14,12,0.40) */
--qc-text-on-dark    /* Text on dark/filled surfaces            Light: #FFFFFF */
```

### Surfaces

```css
--qc-surface-base    /* Page background                         Light: #EDECE8 */
--qc-surface-white   /* Sidebar, topbar, elevated white         Light: #FBFAF7 */
--qc-surface-card    /* Pure card white                         Light: #FFFFFF */
--qc-surface-panel   /* Section panel fill, chip fill           Light: #F2F1EC */
--qc-surface-row-alt /* Table alternating row                   Light: #EFEDE7 */
--qc-surface-hover   /* Hover state on rows/items               Light: #EFEDE7 */
```

### Borders

```css
--qc-border-default  /* Standard card/panel border              Light: #E9E7E1 */
--qc-border-inner    /* Subtle dividers inside cards            Light: #EFEDE7 */
--qc-border-subtle   /* Very faint, alpha-based                 Light: rgba(14,14,12,0.08) */
--qc-border-active   /* Active tab underline, focus ring        Light: #0E0E0C */
```

### Accents

```css
--qc-accent-primary    /* Primary CTA bg (button, active nav)   Light: #0E0E0C */
--qc-accent-primary-fg /* Text on primary CTA                   Light: #FFFFFF */
--qc-accent-logo       /* Logo/brand mark color                 Light: #0E0E0C */
--qc-accent-lime       /* Lime highlight / progress fills       Light: #D4F26A */
--qc-accent-lime-bg    /* Lime gradient wash background         Light: #E9F4C4 */
```

### Semantic Colors

```css
--qc-up        /* Positive / gain / buy                         Light: #1F7A4A */
--qc-up-soft   /* Soft bg for positive badges                   Light: #E3F1E8 */
--qc-down      /* Negative / loss / sell                        Light: #B23A2F */
--qc-down-soft /* Soft bg for negative badges                   Light: #F7E6E3 */
--qc-warn      /* Neutral / hold / caution                      Light: #B4731A */
--qc-warn-soft /* Soft bg for warning badges                    Light: #FAF0D8 */
--qc-blue      /* Info / processing / secondary action          Light: #3A6BEF */
--qc-blue-soft /* Soft bg for info badges                       Light: #E9EEFE */
```

### UI-Specific

```css
/* Sidebar */
--qc-sidebar-bg
--qc-sidebar-border
--qc-sidebar-icon-active-bg  /* bg of active sidebar icon pill */
--qc-sidebar-icon-active-fg  /* icon color when active */
--qc-sidebar-icon-idle-fg    /* icon color when idle */
--qc-sidebar-icon-hover-bg

/* Topbar */
--qc-topbar-bg
--qc-topbar-border
--qc-topbar-tab-active-fg    /* active tab text (lime in dark mode) */
--qc-topbar-tab-idle-fg
--qc-topbar-separator
--qc-topbar-avatar-bg
--qc-topbar-search-bg
--qc-topbar-search-border

/* Controls */
--qc-range-track             /* range input track fill */
--qc-range-thumb             /* range input thumb */
--qc-icon-box-bg             /* icon box background */
--qc-icon-box-border         /* icon box border */
--qc-chip-bg                 /* chip/badge background */
--qc-chip-border             /* chip/badge border */
--qc-chip-fg                 /* chip/badge text */
```

---

## Typography

Font: **IBM Plex Sans** as body (`--font-ibm-plex-sans`), **IBM Plex Mono** for all data/numeric/label content.

Add `.mono` to any element to switch to monospace: `font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.02em`.

### Scale

| Tag / Role | Size | Weight | Color | Notes |
|---|---|---|---|---|
| h1 | 56px | 500 | `--qc-text-heading` | Landing/hero only |
| h2 | 36px | 500 | `--qc-text-heading` | Section titles |
| h3 | 28px | 400 | `--qc-text-heading` | Large metric values |
| h4 | 22px | 400 | `--qc-text-heading` | Sub-section headings |
| h5 | 16px | 500 | `--qc-text-heading` | Card headings |
| h6 | 12px | 500 | `--qc-text-muted` | Metadata |
| p, li | 14px | 400 | `--qc-text-muted` | Body copy |
| small | 11px | 400 | `--qc-text-muted` | Captions |
| Verdict word | 68px | 500 | Semantic | BUY / SELL / HOLD |
| Section label | 14px | 600 | `--qc-text-heading` | Mono, uppercase, `letter-spacing: 0.01em` |
| Eyebrow | 10px | 600 | `--qc-text-muted` | Mono, uppercase, `letter-spacing: 0.12–0.16em` |
| Table header | 10px | 500 | `--qc-text-muted` | Mono, uppercase, wide tracking |
| Metric value | 22px | 500 | `--qc-text-heading` | `font-variant-numeric: tabular-nums` |
| Metric sub | 11–12px | 400 | `--qc-text-muted` | Unit suffix |

---

## Border Radius

```css
--radius: 0.625rem  /* 10px — base token */

Page section panels:   border-radius: 10px
Card / inner boxes:    border-radius: 14–18px   (use 18px for hero cards)
Tile grids:            border-radius: 14px
Icon boxes:            border-radius: 6px
Buttons:               border-radius: 6–8px (rounded-md)
Chips / badges:        border-radius: 4px (rounded-sm)
Pills / verdict tags:  border-radius: 999px (full)
```

---

## Spacing System

Use these increments consistently. Do not invent arbitrary values.

| Token | px | Use |
|---|---|---|
| 4px | gap-1 | Tight inline gap (dot + label) |
| 6px | gap-1.5 | Tag gap, small icon gap |
| 8px | gap-2 | Standard row gap, panel padding |
| 10px | | Pill padding horizontal |
| 12px | gap-3 | Card section gap |
| 14px | | Column padding, meter padding |
| 16px | gap-4 | Panel content padding |
| 18px | | Hero card padding (default) |
| 20–22px | | Hero card padding (roomy) |
| 24px | gap-6 | Section gap |

---

## Layout Patterns

### Page Shell

Every page wraps in `ScreenerPageShell` which provides:
- Company header with name, ticker badge, sector chips
- Topbar navigation tabs (in-page scroll or route-based)
- Sidebar (collapsible, icon strip)
- Main content area with `max-w` constraint and scroll

### Section Panel

The `SectionPanel` molecule is the standard outer container for all page sections.

```
<outer>  border-radius:10px, border:--qc-border-default, bg:--qc-surface-panel, padding:8px
  <header> px-2 pt-1 pb-3
    - Section title (mono, uppercase, 14px, 600)
    - Optional scoring bar / subtitle
  <content box> border-radius:10px, bg:--qc-surface-white, border:--qc-border-inner, p-4
    [main content]
```

### Hero Row Layout

Two-column layout inside a section: main content + right sidebar (narrative/intelligence card).

```css
display: grid;
grid-template-columns: 1fr 320px;  /* or 1fr 400px for wider sidebar */
gap: 8px;
```

### Tile Grid

For grouped metric tiles (3-up, 4-up):

```css
display: grid;
grid-template-columns: repeat(3, 1fr);  /* or repeat(4, 1fr) */
gap: 1px;
background: var(--qc-border-default);  /* creates hairline grid lines */
border-radius: 14px;
overflow: hidden;
```

Each tile: `background: var(--qc-surface-white); padding: 14px 16px;`

---

## Component Patterns

### Hero Card (`.mv-hero`, `.ic-hero`, `.fx-narr`)

Large rounded-corner card with optional lime gradient wash at the bottom.

```css
background: var(--qc-surface-white);
border: 1px solid var(--qc-border-default);
border-radius: 18px;
padding: 18px 22px 20px;
position: relative;
overflow: hidden;
display: flex;
flex-direction: column;
gap: 14px;
```

**Lime gradient wash** (applied inside hero/narrative cards):
```css
/* Absolute positioned pseudo-element at the bottom */
position: absolute;
inset: auto 0 0 0;
height: 60%;
background: linear-gradient(180deg, transparent 0%, var(--qc-accent-lime-bg) 100%);
pointer-events: none;
```
Content inside goes in a `position: relative; z-index: 1` wrapper.

### Narrative / Intelligence Card (`.fx-narr`)

Used for the right-column "What it means" / thesis cards. Identical structure to the hero card, with lime wash and these inner elements:

```
eyebrow (mono, 10px, uppercase, 0.12em tracking)
title   (15px, weight 500, --qc-text-heading)
body    (12.5px, --qc-text-body, line-height 1.5)
tags    (pill chips: bg:--qc-surface-panel, border:--qc-border-default, 11px)
```

### Metric Tile

```css
.mv-tile / MetricTile molecule:
  background: var(--qc-surface-white);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 170px;
```

Structure:
```
tile-head
  tile-name  (13px, 500, --qc-text-heading)
  tile-tf    (mono, 10px, muted, uppercase)
  tile-verdict (pill — bear/bull/neu)
tile-readings  (list of reading rows)
  reading: [dot] [label] [value]
tile-foot  (mono, dashed-top border, 10.5px, muted)
```

### Verdict / Status Pill

```css
/* Positive */
background: var(--qc-up-soft);
border: 1px solid rgba(31, 122, 74, 0.25);
color: var(--qc-up);

/* Negative */
background: var(--qc-down-soft);
border: 1px solid rgba(178, 58, 47, 0.25);
color: var(--qc-down);

/* Neutral */
background: var(--qc-warn-soft);
border: 1px solid rgba(180, 115, 26, 0.25);
color: var(--qc-warn);

/* Shared pill shape */
display: inline-flex;
align-items: center;
gap: 6px;
padding: 4–5px 10px;
border-radius: 999px;
font-size: 11px;
font-weight: 600;
letter-spacing: 0.04em;
text-transform: uppercase;

/* Dot inside pill */
width: 6px; height: 6px; border-radius: 50%; background: [semantic color];
```

### Eyebrow Label

Used above every card title or section. Always mono + uppercase + muted.

```css
font-family: 'IBM Plex Mono', monospace;
font-size: 10px;
font-weight: 600;
color: var(--qc-text-muted);
text-transform: uppercase;
letter-spacing: 0.12em;  /* 0.10–0.16em depending on density */
```

### Icon Box

Small box behind icons — applies to all metric tile icons, action icons.

```css
padding: 4px;
border-radius: 6px;
background: var(--qc-icon-box-bg);   /* F2F1EC light / rgba(lime,0.08) dark */
border: 1px solid var(--qc-icon-box-border);
width: 24px; height: 24px;           /* contains 16×16 icon */
```

### Chip / Badge

```css
background: var(--qc-chip-bg);      /* --qc-surface-panel */
border: 1px solid var(--qc-chip-border);
color: var(--qc-chip-fg);           /* --qc-text-muted */
font-size: 11–12px;
font-weight: 500;
border-radius: 4px;                 /* rounded-sm */
padding: 2px 8px;
```

### Section Divider (inner cards)

Use dashed borders for row separators inside cards, solid for card edges.

```css
border-top: 1px dashed var(--qc-border-inner);   /* row divider */
border-top: 1px solid var(--qc-border-default);  /* card separator */
```

### PRO / RISK Tag

```css
.ic-item-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 6px;
  border-radius: 4px;
  height: 18px;
  font-weight: 500;
}
/* PRO */  background: var(--qc-up-soft);   color: var(--qc-up);
/* RISK */ background: var(--qc-down-soft); color: var(--qc-down);
```

### Investment Conclusion Dark Bar (`.ic-actions`)

The "If you own / If you don't own" row uses an inverted dark surface:

```css
background: var(--qc-text-heading);   /* near-black in light mode */
color: #FFFFFF;
border-radius: 14px;
padding: 16px 20px;
display: grid;
grid-template-columns: 1fr 1fr;
gap: 24px;
```

Arrow accent inside uses `color: var(--qc-accent-lime)` — the one place lime appears as inline text color.

### Signal Tally Bar (`.mv-tally-bar`)

Stacked horizontal bar representing bull / neutral / bear signal counts.

```css
display: flex;
height: 32px;
border-radius: 8px;
overflow: hidden;
gap: 2px;
```

Segments use `background: var(--qc-up)`, `var(--qc-warn)`, `var(--qc-down)` with white text.

### Score Meter Bar

```css
height: 4px;
background: var(--qc-surface-panel);
border-radius: 999px;
overflow: hidden;
/* fill span */
background: var(--qc-accent-lime);  /* or semantic color */
```

---

## Charts & Data Visualization

All charts use [Recharts](https://recharts.org) or [ApexCharts](https://apexcharts.com) via the `ApexChart` molecule.

### Color Rules

| Series role | Color | Value |
|---|---|---|
| Primary (Revenue, Score) | `--qc-text-heading` | `#0E0E0C` |
| Secondary (EBITDA, etc.) | zinc/muted | `#9A9A92` |
| Positive fill | `--qc-up` | `#1F7A4A` |
| Negative fill | `--qc-down` | `#B23A2F` |
| Accent / highlight | `--qc-accent-lime` | `#D4F26A` |

**Never** use multiple saturated colors to differentiate data series. Use dark + muted, or semantic colors only.

### Gauge (SVG Tick Gauge)

Used for IM Score and pillar gauges.

- Filled ticks: `var(--qc-accent-primary)` — dark navy, **not** green
- Empty ticks: `#d1d5db`
- Center score label: h3 size, heading color
- Rating badge: `bg: --qc-surface-panel; color: --qc-text-heading; border-radius: 999px`

### Price Range Bar

52-week or relative price range:

- Track: `var(--qc-range-track)`
- Current position marker: `var(--qc-accent-primary)` (near-black)
- Low label: `var(--qc-text-muted)` / High label: `var(--qc-text-muted)`

---

## Semantic Color Rules

**Rule: color communicates data meaning, never category or decoration.**

| Situation | Use |
|---|---|
| Positive metric, achieved target, buy signal, gain | `--qc-up` / `--qc-up-soft` |
| Negative metric, missed target, sell signal, loss | `--qc-down` / `--qc-down-soft` |
| Neutral, hold, caution, warning | `--qc-warn` / `--qc-warn-soft` |
| Processing, pending, info | `--qc-blue` / `--qc-blue-soft` |
| Icons, bullets, decorative dots, category labels | `--qc-text-muted` or zinc |
| Bear/Base/Bull scenario cards | All use identical neutral styling |

**Never** color-code pillars, categories, or dimensions. Use text labels to differentiate.

---

## Interactive States

### Hover

Table rows, list items: `background: var(--qc-surface-hover)` — a subtle warm tint, no border change.

### Active / Selected Tab

Topbar tabs: text color switches from `--qc-topbar-tab-idle-fg` to `--qc-topbar-tab-active-fg` + a 2px underline in `--qc-border-active`.

In dark mode, active tab text becomes lime (`--qc-topbar-tab-active-fg: #C7F036`).

### Focus

Input focus: `outline: 2px solid var(--qc-border-active); outline-offset: 2px`.

### Range Input

Track and thumb are styled via `--qc-range-track` and `--qc-range-thumb`. See globals.css for the full cross-browser rules.

---

## Page Section Anatomy

Every page section follows this structure:

```
[Section Panel outer — panel bg, 10px radius, 8px pad]
  [Section header — eyebrow label, optional score bar]
  [Content area — white surface, 10px radius]
    [Hero row]                         ← 1fr + 320px sidebar
      [Main card — 18px radius]
        Eyebrow
        Title / Verdict
        Body content / sub-grid
        Metric row (4 columns, inner dividers)
      [Narrative card — 18px radius]  ← lime gradient wash
        Eyebrow
        Bold title (takeaway)
        Body text
        Chips/tags
    [Tile grid row]                    ← 3 or 4 cols, gap:1px
    [PRO/CON or highlights row]        ← 2-col grid
    [Dark action bar]                  ← inverted surface
```

---

## Implementing a New Page

1. **Wrap in `ScreenerPageShell`** — provides chrome, header, nav
2. **One `SectionPanel` per major logical group** — e.g. Valuation, Technicals, Risk
3. **Hero row first** inside each panel: main card left, narrative right
4. **Tiles below** for secondary metrics in a grid
5. **All text tokens from `--qc-*` vars** — never hardcode colors
6. **Eyebrow every card** — mono, uppercase, 10px, muted
7. **Mono for all numbers** — use `.mono` class or `font-family: 'IBM Plex Mono', monospace`
8. **Semantic color only for data meaning** — neutral zinc for everything else
9. **Dashed inner dividers, solid outer borders**
10. **Lime accent sparingly** — active state, progress fill, arrow icons, verdict pill dot

---

## Common Mistakes to Avoid

- ❌ Using `text-emerald-600` etc. directly — use `var(--qc-up)` so dark theme works
- ❌ Coloring category labels (e.g. "Management is blue, Opportunity is green") — use text only
- ❌ Pure white (`#FFFFFF`) as page background — use `var(--qc-surface-base)`
- ❌ Colored icon box backgrounds per category — use `var(--qc-icon-box-bg)` uniformly
- ❌ Multiple chart colors for different series — dark + muted only
- ❌ Adding lime/green gradients to every card — reserve for narrative/intelligence cards only
- ❌ Decorative use of semantic colors on bullets or dots — use zinc/muted
- ❌ Sans-serif numbers — all tabular data must use `.mono`

---

## Reusable Components — Inventory & Usage Rules

Before writing any new UI, check whether an existing component already covers the need. The codebase has a rich set of composable primitives. Inline HTML or raw `<div>` patterns should only appear when no existing component fits.

### Rule: Always prefer a component over inline markup

| Situation | Use this | Don't do this |
|---|---|---|
| Any page section container | `SectionPanel` | Raw `div` with `bg-panel + border + p-2` |
| Any metric / KPI display | `MetricTile` | `<div><p>label</p><p>value</p></div>` |
| Any narrative / takeaway panel | `TakeawayBox` or `ScoreSignalsCard` | Inline dark `div` with text |
| Any score + signal breakdown | `ScoreSignalsCard` | Custom gauge + bars |
| Any right-sidebar intelligence card | `IntelligenceCardShell` + `IntelligenceCardHeader` | One-off card wrappers |
| Any sub-card inside an intelligence card | `IntelligenceSubCard` | Custom white rounded div |
| Any bullet / evidence list | `BulletList` | Inline `<ul>` with manual dots |
| Any strategy / field rows | `StrategyRows` | Manual label+value divs |
| Any tab/toggle selector | `TabToggle` | Bespoke `<button>` group |
| Any page wrapper with header + nav | `ScreenerPageShell` | Building chrome from scratch |
| Any icon in a bordered box | `IconBox` molecule | `div` with manual padding + border |
| Any text with bold-marked segments | `BoldText` | Regex replace in JSX |

---

### Molecules (`src/components/molecules/`)

These are page-structure primitives — use them for every new page.

#### `ScreenerPageShell`
Full page wrapper: sidebar, topbar, company header, in-page nav, content area.
```tsx
<ScreenerPageShell symbol="AAPL" companyName="Apple Inc." tabs={[...]} activeTab="overview">
  {children}
</ScreenerPageShell>
```

#### `SectionPanel`
Standard outer container for every logical section. Handles the panel bg, header, score bar, and white content box.
```tsx
<SectionPanel
  title="VALUATION"
  subtitle="P/E and peer comparisons"
  scoring={{ score: 7, max_score: 10, status: "Strong" }}
  headerAction={<button>...</button>}
>
  {/* section content */}
</SectionPanel>
```
Props: `title` (string or ReactNode), `subtitle?`, `scoring?` `{ score, max_score, status?, status_color? }`, `headerAction?`, `subHeader?`, `className?`, `contentClassName?`

#### `MetricTile`
Single KPI display: label + value + optional change + sublabel.
```tsx
<MetricTile label="P/E Ratio" value="45.4x" change="+2.1 today" sublabel="vs 38x industry" />
```
Props: `label`, `value`, `sublabel?`, `icon?` (LucideIcon), `change?` (prefix `+`/`-`/`→` drives color), `className?`

#### `TabToggle`
Segmented control for switching views/timeframes.
```tsx
<TabToggle
  options={["1Y", "3Y", "5Y"]}
  value={selected}
  onChange={setSelected}
  variant="outline"  // or "pill"
/>
```
Props: `options`, `value`, `onChange`, `variant?: "pill" | "outline"`, `className?`

#### `IconBox`
Bordered icon container. Use for all icons displayed in metric tiles or card headers.
```tsx
import { IconBox } from "@/components/molecules/icon-box";
<IconBox><TrendingUp size={16} /></IconBox>
```

#### `ApexChart`
Wrapper around ApexCharts with theme-aware defaults.
```tsx
import { ApexChart } from "@/components/molecules/apex-chart";
<ApexChart type="bar" series={[...]} options={{...}} height={200} />
```

#### `MultiLineBarComboChart`
Pre-built combo chart (line + bar) for financial time series. Use for revenue/EBITDA trends.

#### `PeerComparisonTable`
Standardized comparison table with alternating row styling, sortable columns, and semantic coloring.

#### `TabularCard`
Card wrapper with a built-in tab header row. For cards that switch between views internally.

---

### Opportunity Components (`src/components/opportunity/`)

These are feature-level components for the intelligence/analysis pages. Reuse them instead of reinventing card layouts.

#### `IntelligenceCardShell`
Outer wrapper for right-column intelligence cards (row-alt bg, 18px radius, 8px padding).
```tsx
import { IntelligenceCardShell } from "@/components/opportunity/intelligence-card-shared";
<IntelligenceCardShell>
  <IntelligenceCardHeader icon={<Brain size={14} />} title="Industry Intelligence" badge="AI" />
  <ScoreSignalsCard ... />
  <IntelligenceSubCard eyebrow="Key Takeaway">...</IntelligenceSubCard>
</IntelligenceCardShell>
```

#### `IntelligenceCardHeader`
Standard header row for intelligence cards: icon box + title + optional badge chip.
```tsx
<IntelligenceCardHeader
  icon={<BarChart2 size={14} />}
  title="Financial Intelligence"
  badge="Q3 FY25"
/>
```

#### `IntelligenceSubCard`
White sub-card inside an intelligence shell. Has eyebrow, icon, optional verdict pill.
```tsx
<IntelligenceSubCard
  eyebrow="Margin Outlook"
  icon={<TrendingDown size={12} />}
  badge="Bearish"
  badgeColor="var(--qc-down)"
>
  <BulletList items={[...]} />
</IntelligenceSubCard>
```

#### `ScoreSignalsCard`
Full score card with progress bar, signal breakdown rows, and key takeaway. Use for all pillar scoring cards.
```tsx
<ScoreSignalsCard
  eyebrow="Industry Score"
  score={15}
  maxScore={30}
  status="Average"
  statusColor="yellow"
  takeaway="Strong volumes but margin pressure from greenfield drag."
  signals={signalBreakdownItems}
/>
```

#### `SignalRow`
Single signal row with sentiment dot, label, progress bar, score, hover popover.
```tsx
<SignalRow item={{ key: "growth", label: "Revenue Growth", score: 8, max_score: 10, sentiment: "positive", details: [...] }} />
```

#### `BulletList`
Dash-separated clamped bullet list with hover-to-expand popover per item.
```tsx
<BulletList items={["Revenue outpacing industry at 25.5% vs 4% PV growth", "..."]} />
```

#### `StrategyRows`
Vertically stacked label + clamped-text rows. Use for strategy/context fields.
```tsx
<StrategyRows rows={[{ label: "Entry Thesis", value: "..." }, { label: "Exit Condition", value: "..." }]} />
```

#### `TakeawayBox`
Dark inverted box (zinc-900) with a badge title and body text. Used for key insight callouts at the bottom of cards.
```tsx
<TakeawayBox title="KEY RISK" text="Copper cost headwinds and greenfield ramp-up compressing margins." />
// noBleed={true} when outside a padded container
```

#### `StatusBadge`
Dot + label pill in semantic color.
```tsx
<StatusBadge label="Strong" color="green" />  // green | yellow | red
```

#### `SegmentedBar`
Horizontal segmented fill bar. Use for allocation breakdowns, category splits.

#### `SubsectionHeader`
Section divider row with title and optional score pill — for use inside a `SectionPanel` content box when there are multiple sub-sections.

#### `BoldText`
Parses `**bold**` markdown syntax in strings to `<strong>` tags.
```tsx
<BoldText text="Revenue is **up 25%** vs industry." />
```

#### `SectionPanel` (re-export)
`src/components/opportunity/section-panel.tsx` re-exports the molecule version. Import from either path — they're the same.

---

### Overview Components (`src/components/overview/`)

Feature-complete cards for the stock overview page. Reuse sub-components before building custom versions.

#### `primitives.tsx`
Low-level shared primitives scoped to the overview page: `Eyebrow`, `MiniBar`, `SentimentPill`, etc. Import from here for overview-page-specific building blocks.

#### Notable cards to reuse or reference
- `QcScoreHeroCard` — score gauge + pillar pills + weighting panel
- `MarketViewCard` — market condition tiles + signal tally
- `InvestmentConclusionCard` — verdict + meters + pro/con + action bar (implements all `.ic-*` classes)
- `TechnicalsCard` — price ladder, moving averages strip, state cards row, momentum panel
- `FundamentalOverviewCard` — valuation hero, KPI grid, returns panel, shareholding panel

---

### When to create a new reusable component

Extract a new molecule or shared component when **all** of the following are true:

1. The pattern appears (or will appear) in 2+ places
2. It has clear, stable props — not tightly coupled to one page's data shape
3. It's a visual/structural unit, not business logic

Put it in:
- `src/components/molecules/` — if it's structural/layout (no domain knowledge)
- `src/components/opportunity/` — if it's specific to the analysis/intelligence card pattern
- `src/components/overview/` — if it's specific to the stock overview page
- A new `src/components/<feature>/` directory — if it's a new feature domain

**Do not** put one-off page sections in `molecules/` just because they're large. Only extract when the component is genuinely reusable.
