"use client";

import Link from "next/link";
import { BASKET_CATEGORIES } from "../_data/categories";
import type { SampleBasket } from "../_lib/types";
import {
    concentrationFields,
    fmtInr,
    fundamentalFields,
    scoreFields,
    syntheticSeries,
} from "../_lib/utils";

function riskTone(risk: string) {
  if (risk === "High") return { color: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  if (risk === "Low") return { color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)" };
}

export function BasketDetailView({ basket }: { basket: SampleBasket }) {
  const risk = riskTone(basket.risk);
  const retPos = basket.returnVal >= 0;
  const scores = scoreFields(basket);
  const fund = fundamentalFields(basket);
  const conc = concentrationFields(basket);
  const catDef = BASKET_CATEGORIES.find((c) => c.key === basket.category);

  const chartVals =
    basket.history && basket.history.length >= 2
      ? basket.history.map((h) => h.avgQc)
      : syntheticSeries(basket.slug ?? basket.name, basket.returnVal);

  return (
    <div className="w-full min-w-0 px-4 pb-16 pt-6 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <Link
        href="/basket"
        className="mb-4 inline-flex items-center gap-1 text-[11.5px] underline decoration-dashed underline-offset-4"
        style={{ color: "var(--qc-ink-2)" }}
      >
        ← All Baskets
      </Link>

      <header
        className="mb-5 border-b pb-5 sm:mb-6 sm:pb-6"
        style={{ borderColor: "var(--qc-hair)" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h1
            className="text-[18px] font-semibold sm:text-[20px]"
            style={{ color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif)" }}
          >
            {basket.name}
          </h1>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10.5px]"
            style={{ color: "var(--qc-ink-2)", borderColor: "var(--qc-hair)" }}
          >
            {basket.category}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            style={{ color: risk.color, background: risk.bg }}
          >
            {basket.risk} Risk
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px]"
            style={{
              color:
                basket.health === "Improving"
                  ? "var(--qc-up)"
                  : basket.health === "Weakening"
                    ? "var(--qc-down)"
                    : "var(--qc-ink-3)",
              background:
                basket.health === "Improving"
                  ? "var(--qc-up-soft)"
                  : basket.health === "Weakening"
                    ? "var(--qc-down-soft)"
                    : "var(--qc-section)",
            }}
          >
            {basket.health}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 sm:mt-4 sm:gap-x-8">
          <Meta label="Stocks" value={String(basket.stocks)} />
          <Meta label="Min. Investment" value={fmtInr(basket.minInv)} />
          <Meta
            label={basket.returnLabel}
            value={`${retPos ? "+" : ""}${basket.returnVal}%`}
            valueColor={retPos ? "var(--qc-up)" : "var(--qc-down)"}
          />
          <Meta label="Fee" value={basket.fee} />
        </div>
      </header>

      {/* QC score band */}
      <div
        className="mb-4 flex flex-col gap-5 rounded-[11px] border p-4 sm:mb-5 sm:flex-row sm:items-center sm:gap-7 sm:p-5"
        style={{
          borderColor: "color-mix(in srgb, var(--qc-up) 35%, var(--qc-hair))",
          background: "linear-gradient(135deg, var(--qc-up-soft), transparent)",
        }}
      >
        <div className="flex shrink-0 items-center gap-3.5">
          <div className="text-[32px] font-bold leading-none tabular-nums sm:text-[34px]" style={{ color: "var(--qc-up)" }}>
            {scores.combined}
          </div>
          <div className="text-[11px] leading-snug" style={{ color: "var(--qc-ink-2)" }}>
            Combined QC Score
            <br />
            M.O.D. framework, 0–100
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          <ScoreBar label="Management" value={scores.mgmt} />
          <ScoreBar label="Opportunity" value={scores.opp} />
          <ScoreBar label="Deal" value={scores.deal} />
          <ScoreBar label="Above 200 SMA" value={scores.techBreadth} tone="blue" suffix="%" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-5 xl:gap-6">
        <div className="space-y-4">
          <Section title="Fundamental Valuation">
            <div className="flex flex-col gap-0.5">
              <div
                className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b pb-1.5 text-[9.5px] uppercase tracking-wide"
                style={{ borderColor: "var(--qc-hair)", color: "var(--qc-ink-3)" }}
              >
                <span />
                <span>Basket</span>
                <span>Nifty 50</span>
              </div>
              {(
                [
                  ["P/E (weighted avg)", `${fund.pe}x`, `${fund.niftyPe}x`],
                  ["P/B (weighted avg)", `${fund.pb}x`, `${fund.niftyPb}x`],
                  ["Dividend Yield", `${fund.divYield}%`, `${fund.niftyDivYield}%`],
                  ["ROE", `${fund.roe}%`, `${fund.niftyRoe}%`],
                  ["Debt/Equity", String(fund.de), String(fund.niftyDe)],
                  [
                    "Earnings Growth (YoY)",
                    `${fund.epsGrowth >= 0 ? "+" : ""}${fund.epsGrowth}%`,
                    "—",
                  ],
                ] as const
              ).map(([label, val, bench]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-b py-1.5 last:border-0"
                  style={{ borderColor: "var(--qc-hair)" }}
                >
                  <span className="text-[9.5px] uppercase tracking-wide" style={{ color: "var(--qc-ink-3)" }}>
                    {label}
                  </span>
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--qc-ink)" }}>
                    {val}
                  </span>
                  <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-ink-2)" }}>
                    {bench}
                  </span>
                </div>
              ))}
            </div>
            <Disclaimer>
              Placeholder values — real weighted fundamentals activate once constituent-level data is
              wired in.
            </Disclaimer>
          </Section>

          <Section title="Concentration & Liquidity">
            <div className="grid grid-cols-2 gap-3">
              <Meta
                label="Top 3 Holdings Weight"
                value={`${conc.top3}%`}
                valueColor={conc.top3 > 55 ? "var(--qc-down)" : undefined}
              />
              <Meta label="Constituents" value={String(conc.n)} />
              <Meta
                label="Avg Daily Traded Value"
                value={`₹${conc.adv} Cr`}
                valueColor={conc.adv < 25 ? "var(--qc-down)" : undefined}
              />
              <Meta label="Volatility" value={basket.volatility} />
            </div>
            {conc.adv < 25 && (
              <Disclaimer tone="down">
                Below ₹25 Cr average daily traded value across constituents — larger orders may move
                the price on entry or exit.
              </Disclaimer>
            )}
            {conc.top3 > 55 && (
              <Disclaimer tone="warn">
                Top 3 holdings exceed 55% of the basket — concentration risk is higher than the
                basket&apos;s Risk tag alone shows.
              </Disclaimer>
            )}
          </Section>

          <Section title="Performance Over Time">
            <LineChart values={chartVals} />
            <Disclaimer>
              {basket.history && basket.history.length >= 2
                ? `Avg QC Score across ${basket.history.length} saved snapshots. Real basket history — QC Score itself is still the placeholder scoring engine.`
                : `Illustrative return path ending at the stated ${basket.returnLabel} — not live performance.`}
            </Disclaimer>
          </Section>

          <Section title="How It's Built">
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
              Classified under <strong style={{ color: "var(--qc-ink)" }}>{basket.category}</strong>.{" "}
              {basket.rationale} Stocks are ranked by QC Score under the M.O.D. framework and the top{" "}
              <strong style={{ color: "var(--qc-ink)" }}>{basket.stocks}</strong> names are taken,
              equal-weighted. {catDef?.desc}
            </p>
          </Section>

          <Section title="What It Is">
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
              {basket.rationale}
            </p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Performance Ratios">
            <div className="grid grid-cols-2 gap-3">
              <Meta
                label={basket.returnLabel}
                value={`${basket.returnVal >= 0 ? "+" : ""}${basket.returnVal}%`}
              />
              <Meta label="Volatility" value={basket.volatility} />
              <Meta label="Max Drawdown" value="— needs price history" muted />
              <Meta label="Sharpe Ratio" value="— needs price history" muted />
              <Meta label="Win/Loss Ratio" value="— needs price history" muted />
              <Meta label="vs Nifty 500" value="— needs price history" muted />
            </div>
          </Section>

          <Section title="Constituents">
            {basket.history?.[0]?.symbols?.length ? (
              <div>
                {basket.history[basket.history.length - 1].symbols.map((sym) => {
                  const n = basket.history![basket.history!.length - 1].symbols.length;
                  const wt = (100 / n).toFixed(n > 20 ? 1 : 0);
                  return (
                    <div
                      key={sym}
                      className="flex items-center justify-between border-b py-1.5 text-[12px] last:border-0"
                      style={{ borderColor: "var(--qc-hair)" }}
                    >
                      <span className="font-semibold" style={{ color: "var(--qc-ink)" }}>
                        {sym}
                      </span>
                      <span style={{ color: "var(--qc-ink-2)" }}>{wt}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--qc-ink-3)" }}>
                Constituent list comes from the backend builder once this basket is created there —
                not available in this preview build.
              </p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  valueColor,
  muted,
}: {
  label: string;
  value: string;
  valueColor?: string;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-wide" style={{ color: "var(--qc-ink-3)" }}>
        {label}
      </div>
      <div
        className={`mt-0.5 tabular-nums ${muted ? "text-[11.5px] font-normal" : "text-[13px] font-semibold"}`}
        style={{ color: muted ? "var(--qc-ink-3)" : valueColor ?? "var(--qc-ink)" }}
      >
        {value}
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  tone,
  suffix = "",
}: {
  label: string;
  value: number;
  tone?: "blue";
  suffix?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[9.5px] uppercase tracking-wide" style={{ color: "var(--qc-ink-3)" }}>
        {label}
      </span>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--qc-hair)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: tone === "blue" ? "var(--qc-blue)" : "var(--qc-up)",
          }}
        />
      </div>
      <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--qc-ink)" }}>
        {value}
        {suffix}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[11px] border p-4 sm:p-5"
      style={{ background: "var(--qc-card)", borderColor: "var(--qc-hair)" }}
    >
      <h2
        className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--qc-ink)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Disclaimer({
  children,
  tone = "warn",
}: {
  children: React.ReactNode;
  tone?: "warn" | "down";
}) {
  return (
    <p
      className="mt-2.5 border-t pt-2 text-[10px] leading-relaxed"
      style={{
        borderColor: "var(--qc-hair)",
        color: tone === "down" ? "var(--qc-down)" : "var(--qc-warn)",
      }}
    >
      {children}
    </p>
  );
}

function LineChart({ values }: { values: number[] }) {
  const w = 520;
  const h = 160;
  const pad = 26;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const zeroY = min <= 0 && max >= 0 ? y(0) : null;
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");
  const last = values[values.length - 1];
  const up = last >= values[0];
  const stroke = up ? "var(--qc-up)" : "var(--qc-down)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="block">
      {zeroY != null && (
        <line
          x1={pad}
          y1={zeroY}
          x2={w - pad}
          y2={zeroY}
          stroke="var(--qc-hair)"
          strokeDasharray="3,3"
        />
      )}
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.6} />
      <circle cx={x(values.length - 1)} cy={y(last)} r={3} fill={stroke} />
    </svg>
  );
}
