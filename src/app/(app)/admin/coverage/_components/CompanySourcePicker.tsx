"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import { TickerSource, L1CompanyGroupOption } from "./types";

const INPUT_CLS =
  "rounded-md border border-hair px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

const SOURCE_OPTIONS: { id: TickerSource; label: string }[] = [
  { id: "default", label: "Default list" },
  { id: "manual", label: "Manual tickers" },
  { id: "group", label: "Saved group" },
  { id: "all", label: "All companies" },
];

interface Props {
  source: TickerSource;
  onSourceChange: (s: TickerSource) => void;
  tickers: string[];
  onTickersChange: (t: string[]) => void;
  companies: string[];
  defaultTickerCount: number;
  groupSlug: string;
  onGroupSlugChange: (slug: string) => void;
  companyGroups: L1CompanyGroupOption[];
  groupCounts: Record<string, number | "loading" | "error">;
  loading?: boolean;
  /** Set when this lens has no backend default ticker list (e.g. L2) — changes the "Default list" copy. */
  noDefault?: boolean;
}

/**
 * Common "which companies?" selector — shared across L1/L2/L3 dispatch tabs.
 * Each tab owns its own state, so selections are independent per tab.
 */
export function CompanySourcePicker({
  source,
  onSourceChange,
  tickers,
  onTickersChange,
  companies,
  defaultTickerCount,
  groupSlug,
  onGroupSlugChange,
  companyGroups,
  groupCounts,
  loading,
  noDefault,
}: Props) {
  return (
    <div className="rounded-[10px] border border-hair bg-card p-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className={`${LABEL_CLS} mb-0`}>
          Which companies? {loading && <span className="normal-case tracking-normal font-normal">— loading…</span>}
        </label>
        <Link
          href="/admin/company-groups"
          className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink transition-colors"
        >
          <Layers className="size-3" /> Manage groups
        </Link>
      </div>

      <div className="inline-flex rounded-md border border-hair p-0.5 bg-secondary">
        {SOURCE_OPTIONS.filter((opt) => opt.id !== "default" || !noDefault).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSourceChange(opt.id)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
              source === opt.id ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {source === "default" && !noDefault && (
          <p className="text-[12px] text-ink-3">
            Falls back to the backend&rsquo;s default ticker list ({defaultTickerCount} tickers).
          </p>
        )}

        {source === "manual" && (
          <TagMultiPicker options={companies} selected={tickers} onChange={onTickersChange} placeholder="Add a ticker…" />
        )}

        {source === "group" && (
          companyGroups.length === 0 ? (
            <p className="text-[12px] text-ink-3">
              No saved groups yet.{" "}
              <Link href="/admin/company-groups" className="underline hover:text-ink">
                Create one
              </Link>{" "}
              to reuse a ticker list or live filter here.
            </p>
          ) : (
            <select
              value={groupSlug}
              onChange={(e) => onGroupSlugChange(e.target.value)}
              className={`${INPUT_CLS} w-full max-w-sm`}
            >
              <option value="">Select a group…</option>
              {companyGroups.map((g) => {
                const c = groupCounts[g.slug];
                const countLabel = c === "loading" ? "…" : c === "error" ? "?" : c != null ? c : "";
                return (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                    {countLabel !== "" ? ` (${countLabel})` : ""}
                  </option>
                );
              })}
            </select>
          )
        )}

        {source === "all" && (
          <p className="text-[12px] text-warn bg-warn-soft border border-warn rounded-md px-3 py-2">
            This will scan every company in the database (~2,000). Consider Start From to resume a
            partial run.
          </p>
        )}
      </div>
    </div>
  );
}
