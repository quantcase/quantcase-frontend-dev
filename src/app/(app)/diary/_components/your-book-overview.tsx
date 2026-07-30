"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { MonoLabel, RatingBadge, ScoreGauge, ratingTier } from "@/components/ds";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { fmt, brokerLabel } from "@/lib/portfolio-format";
import type { TickerMetrics } from "@/hooks/useTickerMetrics";
import type { ModSynopsis, PortfolioSummary } from "@/types/investor-dashboard";
import type { SmallcaseHoldingsData } from "@/types/smallcase";

import {
  buildBookBlocks,
  brokerAccountCount,
  groupBook,
  pillarSummaries,
  unbackedPct,
} from "../_lib/diary-derive";
import type { BookBlock, BookGroup, BookLens, DiaryTicker, GroupTone, ThesisBucket } from "../_lib/diary-derive";

interface YourBookOverviewProps {
  holdings: SmallcaseHoldingsData | null;
  /** Cross-journal rows — what supplies each holding's thesis health. */
  tickers: DiaryTicker[];
  /** Industry + market cap by uppercased ticker; the cap/industry lenses need it. */
  metrics: Map<string, TickerMetrics>;
  /** Portfolio-level M/O/D. Null → the pillar cards and score clause are omitted. */
  mod: ModSynopsis | null;
  /** Today / YTD / invested, for the header meta line. */
  summary: PortfolioSummary | null;
  loading: boolean;
  notConnected: boolean;
  /** Opens a ticker's entry drawer — every block and every CTA here writes. */
  onPick: (ticker: string) => void;
}

// A group's fill comes from `group.color` (resolved once in diary-derive, so the
// bar segment, the card dot and the tooltip swatch always agree). Only the
// thesis lens has a *tone* on top of that color, and only text reads it.
const TONE_FG: Record<GroupTone, string> = {
  up: "text-up",
  warn: "text-warn",
  down: "text-down",
  neutral: "text-ink-3",
};

// Mirrors `thesisConfig`'s glyphs — the mark exists so health doesn't rest on
// color alone.
const BUCKET_ICON: Record<ThesisBucket, string> = {
  intact: "●",
  pressure: "⚡",
  broken: "✕",
  unwritten: "○",
};

const LENS_TABS: { label: string; lens: BookLens }[] = [
  { label: "Thesis", lens: "thesis" },
  { label: "Market cap", lens: "cap" },
  { label: "Industry", lens: "industry" },
];

/** Below this share of the book a block is too narrow to fit its ticker. */
const LABEL_MIN_PCT = 3;

/**
 * "Your book" — the top-of-diary glance.
 *
 * One block per holding, sized by the money in it, cut by thesis health (or by
 * cap band / industry), then the same cut restated as stat cards, a nudge for
 * whatever has no reasoning behind it, and the three M/O/D pillars.
 *
 * Every block and every CTA opens that ticker's entry drawer: the section's whole
 * argument is that money without a written reason is the thing to fix, so it has
 * to be one click from fixing it.
 */
export function YourBookOverview({
  holdings, tickers, metrics, mod, summary, loading, notConnected, onPick,
}: YourBookOverviewProps) {
  const [tab, setTab] = useState(LENS_TABS[0].label);
  const lens = LENS_TABS.find((t) => t.label === tab)?.lens ?? "thesis";

  const rows = useMemo(() => holdings?.holdings ?? [], [holdings]);
  const blocks = useMemo(() => buildBookBlocks(rows, tickers, metrics), [rows, tickers, metrics]);
  const groups = useMemo(() => groupBook(blocks, lens), [blocks, lens]);
  const pillars = useMemo(() => pillarSummaries(mod), [mod]);

  const totalValue = holdings?.portfolio?.total_value ?? blocks.reduce((s, b) => s + b.value, 0);
  const invested = holdings?.portfolio?.total_invested ?? null;
  const unbacked = unbackedPct(blocks);
  const brokers = brokerAccountCount(rows);
  const broker = rows.find((h) => h.broker)?.broker ?? null;

  if (loading) {
    return (
      <section className="mb-8">
        <div className="skeleton-shimmer h-[420px] rounded-xl" />
      </section>
    );
  }

  // No holdings is not an empty state here — "Everything you own" further down
  // owns the connect prompt, and a second one at the top would just repeat it.
  if (notConnected || blocks.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="rounded-xl border border-hair bg-card px-5 py-5 sm:px-7 sm:py-6">
        {/* ── Header: what the book says, and what it's worth ─────────────── */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 lg:max-w-[620px]">
            <div className="eyebrow">
              Your book · <span className="mono">{blocks.length}</span> holdings
            </div>
            <h2 className="serif m-0 mt-2.5 text-[26px] font-normal leading-[1.3] text-ink">
              <Headline
                overall={mod && !mod.empty ? mod.overall_score : null}
                best={pillars.length > 1 ? [...pillars].sort((a, b) => b.score - a.score)[0].label : null}
                worst={pillars.length > 1 ? [...pillars].sort((a, b) => a.score - b.score)[0].label : null}
                unbacked={unbacked}
              />
            </h2>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 lg:items-end">
            <div className="mono text-[26px] font-medium leading-none text-ink">
              {formatINR(totalValue)}
            </div>

            <div className="flex flex-wrap items-center gap-x-1.5 text-[12px] text-ink-3 lg:justify-end">
              {summary?.today_change_value != null && (
                <span className={`mono ${summary.today_change_value >= 0 ? "text-up" : "text-down"}`}>
                  {summary.today_change_value >= 0 ? "+" : "−"}₹{fmt(Math.abs(summary.today_change_value))} today
                </span>
              )}
              {summary?.ytd_change_pct != null && (
                <>
                  {summary.today_change_value != null && <span>·</span>}
                  <span className={`mono ${summary.ytd_change_pct >= 0 ? "text-up" : "text-down"}`}>
                    {summary.ytd_change_pct >= 0 ? "+" : ""}{summary.ytd_change_pct.toFixed(1)}% YTD
                  </span>
                </>
              )}
              {invested != null && (
                <>
                  {(summary?.today_change_value != null || summary?.ytd_change_pct != null) && <span>·</span>}
                  <span className="mono">{formatINR(invested)} invested</span>
                </>
              )}
            </div>

            {broker && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-up-soft px-2.5 py-1 text-[12px] font-medium text-up">
                <span aria-hidden className="size-1.5 rounded-full bg-up" />
                {brokers > 1 ? `${brokers} brokers connected` : `${brokerLabel(broker)} connected`}
              </span>
            )}

            <TabToggle
              options={LENS_TABS.map((t) => t.label)}
              value={tab}
              onChange={setTab}
              variant="outline"
              className="lg:justify-end"
            />
          </div>
        </div>

        {/* ── The book as one bar ─────────────────────────────────────────── */}
        <BookBar groups={groups} total={totalValue} lens={lens} onPick={onPick} />

        {/* ── The same cut, as numbers ────────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <GroupStat key={g.key} group={g} lens={lens} />
          ))}
        </div>

        {/* ── What the bar is asking you to do ────────────────────────────── */}
        <BookNudge groups={groups} lens={lens} onPick={onPick} />

        {/* ── The three pillars ───────────────────────────────────────────── */}
        {pillars.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-hair pt-6 sm:grid-cols-3">
            {pillars.map((p) => {
              const tier = ratingTier(p.rating);
              return (
                <div key={p.pillar} className="rounded-[10px] border border-hair px-5 pb-5 pt-4">
                  <MonoLabel size={9} tracking="0.14em" color="var(--qc-ink-3)">
                    {p.label}
                  </MonoLabel>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <span className="mono text-[30px] font-medium leading-none text-ink">{p.score}</span>
                    <RatingBadge label={p.rating} />
                  </div>
                  {/* Tier'd fill: a pillar score carries a STRONG/FAIR/WEAK
                      verdict, so here the bar genuinely means good/bad. */}
                  <div className="mt-3.5">
                    <ScoreGauge
                      value={p.score}
                      shape="bar"
                      strokeWidth={3}
                      tier={tier === "neutral" ? undefined : tier}
                    />
                  </div>
                  {p.caption && (
                    <p className="mt-3 text-[12px] leading-[1.5] text-ink-2">{p.caption}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Headline ────────────────────────────────────────────────────────────────

/**
 * The serif claim. Every number in it is derived, so the sentence degrades
 * clause by clause rather than asserting a score the API didn't send.
 */
function Headline({
  overall, best, worst, unbacked,
}: { overall: number | null; best: string | null; worst: string | null; unbacked: number }) {
  const pct = Math.round(unbacked);
  const unbackedClause =
    pct > 0 ? (
      <>
        <i>{pct}%</i> of it has no reason you&rsquo;d still stand behind.
      </>
    ) : (
      <>every rupee in it has a reason behind it.</>
    );

  if (overall == null) {
    return pct > 0 ? (
      <>
        <i>{pct}%</i> of your book has no reason you&rsquo;d still stand behind.
      </>
    ) : (
      <>Every rupee in your book has a reason behind it.</>
    );
  }

  return (
    <>
      Your book scores <i>{overall}</i>
      {best && worst && best !== worst && (
        <> — strong on {best.toLowerCase()}, soft on {worst.toLowerCase()}</>
      )}
      . And {unbackedClause}
    </>
  );
}

// ── Bar ─────────────────────────────────────────────────────────────────────

interface HoverState {
  block: BookBlock;
  group: BookGroup;
  /** Center of the hovered block, in px from the bar's left edge. */
  x: number;
  /** Bar width at hover time — measured here, since the tooltip can't read the
   *  ref during render. */
  barWidth: number;
}

/**
 * The whole book as one bar: a block per holding, width proportional to the
 * money in it, blocks packed into their group.
 *
 * Most blocks are far too narrow for a label — a book's long tail always is — so
 * identifying one is the hover's job, not the label's. The tooltip is built here
 * rather than left to the native `title` because that never fires reliably on a
 * 2px target and can't show the group's color.
 */
function BookBar({
  groups, total, lens, onPick,
}: { groups: BookGroup[]; total: number; lens: BookLens; onPick: (t: string) => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const show = useCallback((block: BookBlock, group: BookGroup, el: HTMLElement) => {
    const bar = barRef.current;
    if (!bar) return;
    const cell = el.getBoundingClientRect();
    const bounds = bar.getBoundingClientRect();
    setHover({ block, group, x: cell.left - bounds.left + cell.width / 2, barWidth: bounds.width });
  }, []);

  const filled = groups.filter((g) => g.blocks.length > 0);

  return (
    <div className="mt-6">
      <div ref={barRef} className="relative" onMouseLeave={() => setHover(null)}>
        {hover && <BlockTooltip hover={hover} total={total} />}

        {/* Groups sit in their own flex box so the wider gap between them reads
            as the cut, and the blocks inside stay hairline-separated. */}
        <div className="flex h-[72px] gap-2">
          {filled.map((g) => (
            <div key={g.key} className="flex min-w-0 gap-[2px]" style={{ flex: `${g.value} 1 0` }}>
              {g.blocks.map((b) => {
                const pct = total > 0 ? (b.value / total) * 100 : 0;
                return (
                  <button
                    key={b.ticker}
                    type="button"
                    onClick={() => onPick(b.ticker)}
                    onMouseEnter={(e) => show(b, g, e.currentTarget)}
                    onFocus={(e) => show(b, g, e.currentTarget)}
                    onBlur={() => setHover(null)}
                    aria-label={`${b.ticker}, ${g.label}, ${formatINR(b.value)} — write an entry`}
                    className="flex min-w-[2px] cursor-pointer items-center justify-center overflow-hidden rounded-[2px] px-1 transition-opacity hover:opacity-85"
                    style={{ flex: `${b.value} 1 0`, background: g.color }}
                  >
                    {/* Narrow blocks stay unlabelled — a clipped ticker reads as
                        a different one. The tooltip names them instead. */}
                    {pct >= LABEL_MIN_PCT && (
                      <span
                        className={`mono truncate text-[9px] font-semibold tracking-[0.06em] ${
                          g.onDark ? "text-[var(--qc-on-dark)]" : "text-ink-2"
                        }`}
                      >
                        {b.ticker}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3 text-[11px] text-ink-3">
        <span>Largest position</span>
        <span className="hidden text-center sm:block">
          Each block = one holding · width = money in it · click to write
        </span>
        <span>Smallest</span>
      </div>
      {lens !== "thesis" && (
        <p className="sr-only">Blocks are grouped by {lens === "cap" ? "market-cap band" : "industry"}.</p>
      )}
    </div>
  );
}

/** Floating label for the hovered block, clamped to stay inside the bar. */
function BlockTooltip({ hover, total }: { hover: HoverState; total: number }) {
  const { block, group, x, barWidth } = hover;
  const pct = total > 0 ? (block.value / total) * 100 : 0;
  // Half the tooltip's max width, so a block at either end doesn't push it off
  // the card.
  const HALF = 110;
  const left = barWidth > 0 ? Math.min(Math.max(x, HALF), Math.max(barWidth - HALF, HALF)) : x;

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-[calc(100%+8px)] z-20 w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-hair bg-card px-3 py-2 shadow-[var(--qc-shadow-shell)]"
      style={{ left }}
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ background: group.color }} />
        <span className="mono truncate text-[12px] font-semibold text-ink">{block.ticker}</span>
      </div>
      {block.name && <div className="mt-0.5 truncate text-[11px] text-ink-2">{block.name}</div>}
      <div className="mono mt-1 text-[12px] text-ink">
        {formatINR(block.value)} <span className="text-ink-3">· {pct.toFixed(1)}%</span>
      </div>
      <div className="mt-0.5 truncate text-[11px] text-ink-2">{group.label}</div>
    </div>
  );
}

// ── Stat cards ──────────────────────────────────────────────────────────────

function GroupStat({ group, lens }: { group: BookGroup; lens: BookLens }) {
  const icon = lens === "thesis" ? BUCKET_ICON[group.key as ThesisBucket] : null;

  return (
    <div className="rounded-[10px] border border-hair px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ background: group.color }} />
        {icon && <span aria-hidden className={`text-[10px] leading-none ${TONE_FG[group.tone]}`}>{icon}</span>}
        <span className="min-w-0 truncate text-[13px] font-medium text-ink">{group.label}</span>
        <span className="mono shrink-0 text-[13px] text-ink-3">· {group.count}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="mono text-[17px] font-medium leading-none text-ink">{formatINR(group.value)}</span>
        <span className="mono text-[12px] leading-none text-ink-3">{Math.round(group.pct)}%</span>
      </div>
    </div>
  );
}

// ── Nudge ───────────────────────────────────────────────────────────────────

/**
 * The one thing to do next: re-write what broke, else write what was never
 * written. Only on the thesis lens — a cap band isn't something you can fix by
 * writing, so the slot would be claiming an action that doesn't exist.
 */
function BookNudge({
  groups, lens, onPick,
}: { groups: BookGroup[]; lens: BookLens; onPick: (t: string) => void }) {
  if (lens !== "thesis") return null;

  const broken = groups.find((g) => g.key === "broken");
  const unwritten = groups.find((g) => g.key === "unwritten");
  const target = broken?.count ? broken : unwritten?.count ? unwritten : null;
  if (!target) return null;

  const isBroken = target.key === "broken";
  const names = target.blocks.slice(0, 3).map((b) => b.ticker);
  const more = target.count - names.length;

  return (
    <div
      className={`mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[10px] px-5 py-4 ${
        isBroken ? "bg-down-soft" : "bg-secondary"
      }`}
    >
      <div className="min-w-0">
        <div className={`text-[14px] font-semibold ${isBroken ? "text-down" : "text-ink"}`}>
          <span className="mono">{formatINR(target.value)}</span>{" "}
          {isBroken ? "is running on a broken reason." : "has no reason written against it."}
        </div>
        <div className={`mt-1 text-[13px] ${isBroken ? "text-down" : "text-ink-2"}`}>
          <span className="mono">{names.join(", ")}</span>
          {more > 0 && ` +${more} more`} —{" "}
          {isBroken
            ? "what you wrote no longer matches what the company is doing."
            : "you own them, but nothing says why."}
        </div>
      </div>
      <Button
        variant={isBroken ? "destructive" : "default"}
        size="sm"
        onClick={() => onPick(target.blocks[0].ticker)}
        className="shrink-0"
      >
        {isBroken ? "Re-write" : "Write"} {target.count}
        <ArrowRight aria-hidden />
      </Button>
    </div>
  );
}
