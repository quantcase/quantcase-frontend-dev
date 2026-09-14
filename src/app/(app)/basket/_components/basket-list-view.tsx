"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BASKET_CATEGORIES, GROUP_LABELS, GROUP_ORDER } from "../_data/categories";
import { SAMPLE_BASKETS } from "../_data/sample-baskets";
import type { BasketGroup, BasketListState, SortKey } from "../_lib/types";
import { matchesFilters, normalizeBaskets, sortBaskets } from "../_lib/utils";
import { BasketCard } from "./basket-card";

const ALL_BASKETS = normalizeBaskets(SAMPLE_BASKETS);

export function BasketListView() {
  const [state, setState] = useState<BasketListState>({
    group: "QuantCase Special",
    category: "All",
    risk: "All",
    sort: "popularity",
    search: "",
  });

  const filtered = useMemo(
    () => sortBaskets(ALL_BASKETS.filter((b) => matchesFilters(b, state)), state.sort),
    [state],
  );

  const categoryOptions = useMemo(
    () => ["All", ...BASKET_CATEGORIES.filter((c) => c.group === state.group).map((c) => c.key)],
    [state.group],
  );

  const tickerDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  return (
    <div className="w-full min-w-0 px-4 pb-16 pt-6 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div
        className="mb-4 rounded-lg px-3 py-2 text-center text-[11px] sm:mb-5"
        style={{
          background: "var(--qc-warn-soft)",
          color: "var(--qc-warn)",
          border: "1px solid color-mix(in srgb, var(--qc-warn) 35%, transparent)",
        }}
      >
        PREVIEW BUILD — layout and sample baskets only. Names, counts and every number below are
        placeholders, not live QC Scores or real performance.
      </div>

      <header className="mb-4 sm:mb-5">
        <h1
          className="text-[22px] font-semibold tracking-tight sm:text-[24px]"
          style={{ color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif)" }}
        >
          Baskets
        </h1>
        <p
          className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] sm:text-[11.5px]"
          style={{ color: "var(--qc-ink-3)" }}
        >
          <span>{tickerDate}</span>
          <span>·</span>
          <span style={{ color: "var(--qc-ink-2)" }}>NIFTY</span>
          <span style={{ color: "var(--qc-up)", fontWeight: 600 }}>23,477.8 +0.20%</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline" style={{ color: "var(--qc-ink-2)" }}>
            SENSEX
          </span>
          <span className="hidden sm:inline" style={{ color: "var(--qc-up)", fontWeight: 600 }}>
            74,902.59 +0.19%
          </span>
        </p>
      </header>

      {/* Group tabs */}
      <div
        className="mb-5 flex overflow-hidden rounded-[10px] border"
        style={{ background: "var(--qc-card)", borderColor: "var(--qc-hair)" }}
      >
        {GROUP_ORDER.map((g) => {
          const count = ALL_BASKETS.filter((b) => {
            const cat = BASKET_CATEGORIES.find((c) => c.key === b.category);
            return cat?.group === g;
          }).length;
          const active = state.group === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setState((s) => ({ ...s, group: g as BasketGroup, category: "All" }))}
              className="flex-1 px-3 py-4 text-center transition-colors sm:px-6 sm:py-5"
              style={{
                background: active ? "var(--qc-ink)" : "transparent",
                borderRight: g === GROUP_ORDER[0] ? "1px solid var(--qc-hair)" : undefined,
              }}
            >
              <span
                className="block text-[13px] font-semibold sm:text-[16px]"
                style={{ color: active ? "var(--qc-on-dark)" : "var(--qc-ink-2)" }}
              >
                {GROUP_LABELS[g]}
              </span>
              <span
                className="mt-1 block text-[11px]"
                style={{ color: active ? "rgba(255,255,255,0.65)" : "var(--qc-ink-3)" }}
              >
                {count} baskets
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div
        className="mb-6 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
        style={{ borderColor: "var(--qc-hair)" }}
      >
        <div
          className="flex w-full items-center gap-2 rounded-full border px-3 py-2 sm:max-w-md sm:flex-1 lg:max-w-lg"
          style={{ background: "var(--qc-section)", borderColor: "var(--qc-hair)" }}
        >
          <Search size={14} strokeWidth={1.8} style={{ color: "var(--qc-ink-3)", flexShrink: 0 }} />
          <input
            value={state.search}
            onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
            placeholder="Search baskets, sectors, themes..."
            className="w-full bg-transparent text-[12.5px] outline-none"
            style={{ color: "var(--qc-ink)" }}
          />
        </div>

        <FilterChips
          label="Category"
          options={categoryOptions}
          value={state.category}
          onChange={(category) => setState((s) => ({ ...s, category }))}
        />
        <FilterChips
          label="Risk"
          options={["All", "Low", "Medium", "High"]}
          value={state.risk}
          onChange={(risk) => setState((s) => ({ ...s, risk }))}
        />

        <select
          value={state.sort}
          onChange={(e) => setState((s) => ({ ...s, sort: e.target.value as SortKey }))}
          className="rounded-lg border px-3 py-2 text-[11.5px] sm:ml-auto"
          style={{
            background: "var(--qc-card)",
            borderColor: "var(--qc-hair)",
            color: "var(--qc-ink)",
          }}
        >
          <option value="popularity">Sort: Popularity</option>
          <option value="return">Sort: Return</option>
          <option value="newest">Sort: Newest</option>
          <option value="name">Sort: A–Z</option>
        </select>
      </div>

      {/* Shelves */}
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-[12px]" style={{ color: "var(--qc-ink-3)" }}>
          No baskets match these filters — try widening Category or Risk.
        </p>
      ) : state.category !== "All" ? (
        <Shelf
          title={state.category}
          desc={BASKET_CATEGORIES.find((c) => c.key === state.category)?.desc ?? ""}
          baskets={filtered}
          showAll
        />
      ) : (
        GROUP_ORDER.filter((g) => g === state.group).map((groupKey) => {
          const cats = BASKET_CATEGORIES.filter((c) => c.group === groupKey);
          const groupCount = filtered.filter((b) => cats.some((c) => c.key === b.category)).length;
          if (groupCount === 0) return null;
          return (
            <section key={groupKey} className="mb-8 sm:mb-10">
              <div
                className="mb-1 flex items-baseline gap-2.5 border-b-2 pb-2.5"
                style={{ borderColor: "var(--qc-hair)" }}
              >
                <h2 className="text-[16px] font-semibold sm:text-[17px]" style={{ color: "var(--qc-ink)" }}>
                  {GROUP_LABELS[groupKey]}
                </h2>
                <span className="text-[11.5px]" style={{ color: "var(--qc-ink-3)" }}>
                  {groupCount} baskets
                </span>
              </div>
              {cats.map((cat) => {
                const list = sortBaskets(
                  filtered.filter((b) => b.category === cat.key),
                  state.sort,
                );
                if (list.length === 0) return null;
                return (
                  <Shelf
                    key={cat.key}
                    title={cat.key}
                    desc={cat.desc}
                    baskets={list}
                    onViewAll={() => setState((s) => ({ ...s, category: cat.key }))}
                  />
                );
              })}
            </section>
          );
        })
      )}

      <footer
        className="mt-8 border-t pt-4 text-center text-[10.5px]"
        style={{ borderColor: "var(--qc-hair)", color: "var(--qc-ink-3)" }}
      >
        QuantCase Baskets — internal preview build · not for client distribution
      </footer>
    </div>
  );
}

function FilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 text-[10.5px] uppercase tracking-wide" style={{ color: "var(--qc-ink-3)" }}>
        {label}
      </span>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors sm:px-3 sm:text-[11.5px]"
            style={{
              borderColor: on ? "var(--qc-up)" : "var(--qc-hair)",
              color: on ? "var(--qc-up)" : "var(--qc-ink-2)",
              background: on ? "var(--qc-up-soft)" : "var(--qc-card)",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Shelf({
  title,
  desc,
  baskets,
  showAll,
  onViewAll,
}: {
  title: string;
  desc: string;
  baskets: ReturnType<typeof normalizeBaskets>;
  showAll?: boolean;
  onViewAll?: () => void;
}) {
  const shown = showAll ? baskets : baskets.slice(0, 4);
  return (
    <div className="mb-7 w-full sm:mb-8">
      <div className="mb-1 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <h3 className="text-[14px] font-semibold sm:text-[14.5px]" style={{ color: "var(--qc-ink)" }}>
            {title}
          </h3>
          <span className="text-[11px]" style={{ color: "var(--qc-ink-3)" }}>
            {baskets.length} basket{baskets.length === 1 ? "" : "s"}
          </span>
        </div>
        {!showAll && baskets.length > 4 && onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 text-[11px] underline decoration-dashed underline-offset-4"
            style={{ color: "var(--qc-ink-2)" }}
          >
            View all →
          </button>
        )}
      </div>
      <p className="mb-3.5 max-w-3xl text-[11.5px] leading-relaxed xl:max-w-4xl" style={{ color: "var(--qc-ink-2)" }}>
        {desc}
      </p>
      <div
        className={
          showAll
            ? "grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-4"
            : "grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4"
        }
      >
        {shown.map((b) => (
          <BasketCard key={b.slug} basket={b} />
        ))}
      </div>
    </div>
  );
}
