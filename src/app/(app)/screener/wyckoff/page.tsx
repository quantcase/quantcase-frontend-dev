"use client";

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { useWyckoff } from "@/hooks/useWyckoff";
import { useScreenerInfo } from "@/hooks/useScreenerInfo";
import type { WyckoffResponse } from "@/types/wyckoff";
import { WyckoffChart } from "./_components/wyckoff-chart";
import {
  CYCLE_DESC,
  DIRECTION_TONE,
  STRUCTURE_COPY,
  SUB_PHASE_COPY,
  VOLUME_BIAS_COPY,
  fmtDate,
  fmtPct,
  fmtPrice,
  currencySymbol,
} from "./_components/presentation";

// ── Motion primitives ──────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const } },
};

// ── Layout primitives ──────────────────────────────────────────────────────────

function Section({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.section variants={fadeUp} className="rounded-[10px] border border-hair bg-card">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hair px-5 py-3.5">
        <h2 className="text-[length:var(--qc-fz-13)] font-[var(--qc-w-semi)] text-ink">{title}</h2>
        {meta && <span className="font-mono text-[length:var(--qc-fz-10)] text-ink-3">{meta}</span>}
      </header>
      <div className="px-5 py-4">{children}</div>
    </motion.section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[length:var(--qc-fz-9)] uppercase tracking-[var(--qc-track-eyebrow)] text-ink-3">
      {children}
    </p>
  );
}

// ── Advisories — meta flags that qualify everything else ───────────────────────

function Advisories({ data }: { data: WyckoffResponse }) {
  const { meta } = data;
  const notes: { tone: "caution" | "info"; title: string; body: string }[] = [];

  if (meta.suspectedSplit) {
    const ev = meta.suspectedSplitEvents[0];
    notes.push({
      tone: "caution",
      title: "Possible stock split in this window — phase may be unreliable",
      body: ev
        ? `${fmtDate(ev.date)}: close moved ${fmtPct(ev.changePct)} (${fmtPrice(ev.prevClose, data.currency, 0)} → ${fmtPrice(ev.close, data.currency, 0)}). Prices are not split-adjusted upstream, so a split reads to the engine as a crash.`
        : "Prices are not split-adjusted upstream, so a split reads to the engine as a crash.",
    });
  }

  if (meta.historyTruncated) {
    notes.push({
      tone: "info",
      title: `Analysed from ${fmtDate(meta.analysisStart)} — ${data.barCount} daily bars`,
      body: `Earlier history is sampled weekly rather than daily, so mixing it would break the volume and spread gates. The engine analyses the most recent contiguous daily run (${meta.droppedLeadingBars} leading bars dropped of ${meta.totalRowsAvailable} available).`,
    });
  }

  if (!notes.length) return null;

  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-2">
      {notes.map((n) => (
        <div
          key={n.title}
          className={`rounded-[10px] border px-4 py-3 ${
            n.tone === "caution" ? "border-warn/25 bg-warn-soft" : "border-hair bg-[var(--qc-section)]"
          }`}
        >
          <p
            className={`text-[length:var(--qc-fz-12)] font-[var(--qc-w-semi)] ${
              n.tone === "caution" ? "text-warn" : "text-ink"
            }`}
          >
            {n.title}
          </p>
          <p className="mt-1 text-[length:var(--qc-fz-12)] leading-relaxed text-ink-2">{n.body}</p>
        </div>
      ))}
    </motion.div>
  );
}

// ── Hero: phase + signal ───────────────────────────────────────────────────────

function PhaseHero({ data }: { data: WyckoffResponse }) {
  const { phase, signal } = data;
  const tone = DIRECTION_TONE[signal.direction];
  const subPhaseCopy = phase.subPhase ? (SUB_PHASE_COPY[phase.subPhase] ?? phase.subPhase) : null;

  return (
    <motion.div variants={fadeUp} className="grid gap-2.5 lg:grid-cols-2">
      {/* Phase */}
      <div className="relative overflow-hidden rounded-[10px] border border-hair bg-card px-6 py-5">
        <motion.span
          className={`absolute inset-x-0 top-0 h-[3px] origin-left ${tone.solid}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <Eyebrow>Wyckoff Phase</Eyebrow>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={`mt-2 text-[length:var(--qc-fz-26)] font-[var(--qc-w-semi)] leading-none tracking-[var(--qc-track-display)] ${tone.text}`}
        >
          {phase.type}
        </motion.p>
        {subPhaseCopy && (
          <p className={`mt-2 font-mono text-[length:var(--qc-fz-10)] tracking-[var(--qc-track-pill)] opacity-75 ${tone.text}`}>
            {subPhaseCopy}
          </p>
        )}
        <p className="mt-3.5 text-[length:var(--qc-fz-13)] leading-relaxed text-ink-2">
          {phase.description}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <span className="whitespace-nowrap font-mono text-[length:var(--qc-fz-10)] text-ink-3">
            Confidence
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-hair">
            <motion.div
              className={`h-full rounded-full ${tone.solid}`}
              initial={{ width: 0 }}
              animate={{ width: `${phase.confidence}%` }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="font-mono text-[length:var(--qc-fz-10)] font-[var(--qc-w-semi)] text-ink-2">
            {phase.confidence}%
          </span>
        </div>
      </div>

      {/* Signal */}
      <div className={`rounded-[10px] border px-6 py-5 ${tone.border} ${tone.bg}`}>
        <Eyebrow>Trading Signal</Eyebrow>
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
          className="mt-2 text-[34px] leading-none"
        >
          {signal.emoji}
        </motion.p>
        <p className="mt-3 text-[length:var(--qc-fz-14)] font-[var(--qc-w-semi)] leading-snug text-ink">
          {signal.title}
        </p>
        <p className="mt-2.5 text-[length:var(--qc-fz-13)] leading-relaxed text-ink-2">
          {signal.body}
        </p>
      </div>
    </motion.div>
  );
}

// ── Metrics ────────────────────────────────────────────────────────────────────

function MetricsStrip({ data }: { data: WyckoffResponse }) {
  const { metrics, currency, meta, tradingRange } = data;

  // r365/r504/r756 collapse to the same number while saturated — show one.
  const longReturn = meta.returnsSaturated.r365
    ? { label: `Since ${fmtDate(meta.analysisStart)}`, value: metrics.returns.rMacro }
    : { label: "1-Year Return", value: metrics.returns.r365 };

  const rangeValue = tradingRange
    ? `${fmtPrice(tradingRange.bottom, currency, 0)}–${fmtPrice(tradingRange.top, currency, 0)}`
    : "None active";

  const tiles = [
    {
      label: "Last Close",
      value: fmtPrice(metrics.lastClose, currency),
      sub: `${fmtPct(metrics.priceChangePct)} overall`,
      tone: metrics.priceChangePct >= 0 ? "text-up" : "text-down",
    },
    {
      label: longReturn.label,
      value: fmtPct(longReturn.value),
      sub: `6M ${fmtPct(metrics.returns.r126)}`,
      tone: longReturn.value >= 0 ? "text-up" : "text-down",
    },
    {
      label: "Swing Structure",
      value: STRUCTURE_COPY[metrics.structure],
      sub: `${metrics.pivotCount} pivots`,
      tone:
        metrics.structure === "uptrend"
          ? "text-up"
          : metrics.structure === "downtrend"
            ? "text-down"
            : "text-ink-2",
    },
    {
      label: "Trading Range",
      value: rangeValue,
      sub: tradingRange ? `${tradingRange.widthPct}% wide · ${tradingRange.barCount} bars` : "no active range",
      tone: "text-ink",
    },
    {
      label: "Volume Bias",
      value: VOLUME_BIAS_COPY[metrics.volumeBias],
      sub: `ratio ${metrics.volumeRatio.toFixed(2)}×${metrics.volumeDrying ? " · drying" : ""}`,
      tone:
        metrics.volumeBias === "bullish"
          ? "text-up"
          : metrics.volumeBias === "bearish"
            ? "text-down"
            : "text-ink-2",
    },
  ];

  return (
    <motion.div variants={fadeUp} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.35 }}
          whileHover={{ y: -2 }}
          className="rounded-[10px] border border-hair bg-card px-4 py-3.5 transition-shadow hover:shadow-[var(--qc-shadow-annot)]"
        >
          <Eyebrow>{t.label}</Eyebrow>
          <p
            className={`mt-1.5 font-mono text-[length:var(--qc-fz-13)] font-[var(--qc-w-semi)] leading-tight ${t.tone}`}
          >
            {t.value}
          </p>
          <p className="mt-1 font-mono text-[length:var(--qc-fz-9)] text-ink-3">{t.sub}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Cycle schematic ────────────────────────────────────────────────────────────

function CycleSchematic({ data }: { data: WyckoffResponse }) {
  const { cycle, signal } = data;
  const tone = DIRECTION_TONE[signal.direction];

  return (
    <div>
      <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {cycle.phases.map((phase, i) => {
          const active = i === cycle.activeIndex;
          return (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
              className={`relative rounded-lg border px-3 py-3 text-center ${
                active ? `${tone.border} ${tone.bg}` : "border-hair bg-card"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="wyckoff-cycle-active"
                  className={`absolute inset-x-3 top-0 h-[2px] rounded-full ${tone.solid}`}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <p
                className={`font-mono text-[length:var(--qc-fz-9)] font-[var(--qc-w-bold)] uppercase tracking-[var(--qc-track-pill)] ${
                  active ? tone.text : "text-ink-3"
                }`}
              >
                {phase}
              </p>
              <p
                className={`mt-1.5 text-[length:var(--qc-fz-9)] leading-snug ${
                  active ? "text-ink-2" : "text-ink-3"
                }`}
              >
                {CYCLE_DESC[i]}
              </p>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[length:var(--qc-fz-9)] leading-relaxed text-ink-3">
        Accumulation → Markup → Re-Accumulation → (back to Markup) → Distribution → Markdown →
        Re-Distribution → (back to Markdown) → next Accumulation
      </p>
    </div>
  );
}

// ── Events checklist ───────────────────────────────────────────────────────────

function EventChecklist({ data }: { data: WyckoffResponse }) {
  return (
    <ul className="flex flex-col">
      {data.events.map((ev, i) => (
        <motion.li
          key={`${ev.tag}-${i}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.3 }}
          className={`flex items-start gap-3 py-2.5 ${
            i < data.events.length - 1 ? "border-b border-hair" : ""
          }`}
        >
          <span
            className={`mt-px shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[length:var(--qc-fz-9)] uppercase tracking-[var(--qc-track-pill)] ${
              ev.ok ? "border-up/25 bg-up-soft text-up" : "border-hair bg-[var(--qc-section)] text-ink-3"
            }`}
          >
            {ev.tag}
          </span>
          <div className="min-w-0">
            <span className="text-[length:var(--qc-fz-12)] font-[var(--qc-w-semi)] text-ink">
              {ev.label}
            </span>
            <span className="ml-1.5 text-[length:var(--qc-fz-12)] leading-relaxed text-ink-2">
              {ev.text}
            </span>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

// ── Structure evidence ─────────────────────────────────────────────────────────

function EvidencePanel({ data }: { data: WyckoffResponse }) {
  const { metrics, meta, detections, tradingRange, currency } = data;
  const sym = currencySymbol(currency);

  const yes = (on: boolean, tone: "up" | "down" = "up") =>
    on ? <b className={tone === "up" ? "text-up" : "text-down"}>✓ Detected</b> : <b className="text-ink-3">✗ None</b>;

  const rows: { tag: string; content: ReactNode }[] = [
    {
      tag: "ZZ",
      content: (
        <>
          Pivots: <b className="text-ink">{metrics.pivotCount}</b> at a{" "}
          <b className="text-ink">{meta.zigzagMinPct.toFixed(2)}%</b> zigzag threshold
          (percentile-of-swings, clamped to 3–15%)
        </>
      ),
    },
    {
      tag: "STR",
      content: (
        <>
          Structure: <b className="text-ink">{STRUCTURE_COPY[metrics.structure]}</b> · Prior trend:{" "}
          <b className="text-ink">
            {metrics.priorStructure} ({fmtPct(metrics.priorPctChg)})
          </b>
        </>
      ),
    },
    {
      tag: "TR",
      content: tradingRange ? (
        <>
          Active range:{" "}
          <b className="text-ink">
            {sym}
            {tradingRange.bottom}–{sym}
            {tradingRange.top} ({tradingRange.widthPct}% wide)
          </b>{" "}
          · price at <b className="text-ink">{Math.round(tradingRange.positionInRange * 100)}%</b> of
          range · <b className="text-ink">{tradingRange.levels.length}</b> nested{" "}
          {tradingRange.levels.length === 1 ? "band" : "bands"}
        </>
      ) : (
        <>
          Active range: <b className="text-ink-3">None — no consolidation detected</b>
        </>
      ),
    },
    {
      tag: "LOC",
      content: (
        <>
          Position in 2yr range:{" "}
          <b
            className={
              metrics.nearSwingHigh2yr
                ? "text-up"
                : metrics.nearSwingLow2yr
                  ? "text-down"
                  : "text-ink"
            }
          >
            {Math.round(metrics.posIn2yrRange * 100)}% —{" "}
            {metrics.nearSwingHigh2yr ? "near highs" : metrics.nearSwingLow2yr ? "near lows" : "mid-range"}
          </b>{" "}
          · {fmtPct(metrics.pctFromATH)} from ATH {fmtPrice(metrics.allTimeHigh, currency, 0)}
        </>
      ),
    },
    {
      tag: "VOL",
      content: (
        <>
          Swing volume bias: <b className="text-ink">{metrics.volumeBias}</b> · SMA20{" "}
          <b className="text-ink">{fmtPrice(metrics.sma20, currency)}</b> ·{" "}
          {metrics.volumeDrying ? (
            <b className="text-ink">volume drying up</b>
          ) : (
            <b className="text-ink-3">volume normal</b>
          )}
        </>
      ),
    },
    {
      tag: "SC/BC",
      content: (
        <>
          Selling Climax: {yes(detections.sc.detected)}
          {detections.sc.detected && detections.sc.date ? ` (${detections.sc.date})` : ""} · Buying
          Climax: {yes(detections.bc.detected, "down")}
          {detections.bc.detected && detections.bc.date ? ` (${detections.bc.date})` : ""}
        </>
      ),
    },
    {
      tag: "EVTS",
      content: (
        <>
          Spring: {yes(detections.spring.detected)} · Upthrust: {yes(detections.upthrust.detected, "down")}{" "}
          · SOW: {yes(detections.sow.detected, "down")}
        </>
      ),
    },
  ];

  return (
    <ul className="flex flex-col">
      {rows.map((row, i) => (
        <motion.li
          key={row.tag}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.3 }}
          className={`flex items-start gap-3 py-2.5 ${i < rows.length - 1 ? "border-b border-hair" : ""}`}
        >
          <span className="mt-px shrink-0 rounded-sm border border-hair bg-[var(--qc-section)] px-1.5 py-0.5 font-mono text-[length:var(--qc-fz-9)] uppercase tracking-[var(--qc-track-pill)] text-ink-2">
            {row.tag}
          </span>
          <div className="min-w-0 text-[length:var(--qc-fz-12)] leading-relaxed text-ink-2">
            {row.content}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────────

function PageHeader({ symbol, data }: { symbol: string; data: WyckoffResponse | null }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex size-9 items-center justify-center rounded-lg bg-ink"
        >
          <span className="font-mono text-[length:var(--qc-fz-14)] font-[var(--qc-w-bold)] text-[var(--qc-on-dark)]">
            W
          </span>
        </motion.div>
        <div>
          <div className="text-[length:var(--qc-fz-16)] font-[var(--qc-w-semi)] tracking-[var(--qc-track-display)] text-ink">
            Wyckoff Analyzer
            <span className="ml-2 text-[length:var(--qc-fz-13)] font-[var(--qc-w-regular)] text-ink-2">
              {symbol}
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[length:var(--qc-fz-9)] uppercase tracking-[var(--qc-track-eyebrow)] text-ink-3">
            Market Phase Detection Engine
          </div>
        </div>
      </div>

      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 font-mono text-[length:var(--qc-fz-9)] uppercase tracking-[var(--qc-track-pill)] text-ink-3"
          >
            <span className="rounded-md border border-hair px-2.5 py-1.5">
              {data.meta.barInterval} · {data.barCount} bars
            </span>
            <span className="rounded-md border border-hair px-2.5 py-1.5">
              As of {fmtDate(data.asOf)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── States ─────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="size-8 rounded-full border-2 border-hair border-t-ink"
      />
      <p className="font-mono text-[length:var(--qc-fz-10)] uppercase tracking-[var(--qc-track-eyebrow)] text-ink-3">
        Loading Wyckoff analysis…
      </p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[10px] border border-hair bg-card px-6 py-12 text-center"
    >
      <p className="text-[length:var(--qc-fz-14)] font-[var(--qc-w-semi)] text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[length:var(--qc-fz-12)] leading-relaxed text-ink-2">
        {body}
      </p>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function WyckoffContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

  const { data, loading, error } = useWyckoff(symbol, { chartYears: 3 });
  const { data: screenerInfo } = useScreenerInfo(symbol);
  const companyInfo = screenerInfo?.company
    ? {
        name: screenerInfo.company.name,
        exchange: screenerInfo.company.exchange,
        sector: screenerInfo.company.sector,
        industry: screenerInfo.company.industry,
      }
    : null;

  if (!symbol) {
    return (
      <ScreenerPageShell navItems={[]} companyInfo={companyInfo}>
        <div className="px-5 py-6 text-[length:var(--qc-fz-13)] text-down">No symbol provided</div>
      </ScreenerPageShell>
    );
  }

  return (
    <ScreenerPageShell navItems={[]} companyInfo={companyInfo}>
      <div className="min-h-screen bg-[var(--qc-bg)] px-5 pb-12 pt-5">
        <PageHeader symbol={symbol} data={data} />

        {loading && <LoadingState />}

        {error && (
          <EmptyState
            title="Couldn’t load Wyckoff analysis"
            body={`${error}. The symbol may not exist upstream, or the engine is unavailable.`}
          />
        )}

        {!loading && !error && data?.meta.insufficientData && (
          <EmptyState
            title={`Not enough daily history for ${symbol}`}
            body={`The engine needs at least ${data.meta.minBarsRequired} contiguous daily bars to classify a phase. Only ${data.barCount} are available in the current window.`}
          />
        )}

        {!loading && !error && data && !data.meta.insufficientData && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2.5"
          >
            <Advisories data={data} />
            <PhaseHero data={data} />
            <MetricsStrip data={data} />

            <Section title="Wyckoff Market Cycle — Current Position">
              <CycleSchematic data={data} />
            </Section>

            {data.chart && data.chart.bars.length > 0 && (
              <Section
                title="Daily Candlestick Chart"
                meta={`${data.chart.years}Y window · SMA20 · zigzag pivots`}
              >
                <WyckoffChart
                  chart={data.chart}
                  pivots={data.pivots}
                  tradingRange={data.tradingRange}
                  priorRange={data.priorRange}
                  localBreakout={data.localBreakout}
                  currency={data.currency}
                  direction={data.signal.direction}
                />
              </Section>
            )}

            <div className="grid gap-2.5 lg:grid-cols-2">
              <Section title="Wyckoff Event Detection">
                <EventChecklist data={data} />
              </Section>
              <Section title="Structure Evidence">
                <EvidencePanel data={data} />
              </Section>
            </div>
          </motion.div>
        )}
      </div>
    </ScreenerPageShell>
  );
}

export default function WyckoffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--qc-bg)]">
          <span className="text-[length:var(--qc-fz-13)] text-ink-3">Loading…</span>
        </div>
      }
    >
      <WyckoffContent />
    </Suspense>
  );
}
