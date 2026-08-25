"use client";

import React, { useState } from "react";
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
  { id: "csv", label: "CSV upload" },
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
  /** Added for CSV upload feature */
  csvData?: import('./types').CsvTickerLens[];
  onCsvDataChange?: (data: import('./types').CsvTickerLens[]) => void;
  availableSkills?: { slug: string; name: string }[];
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
  csvData,
  onCsvDataChange,
  availableSkills = [],
}: Props) {
  const [csvError, setCsvError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setCsvError("CSV file must contain at least a header and one row.");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const tickerIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol') || h.includes('company'));
      const lensIdx = headers.findIndex(h => h.includes('lens') || h.includes('skill') || h.includes('slug'));

      if (tickerIdx === -1 || lensIdx === -1) {
        setCsvError("Could not find 'ticker' and 'lens' columns in the CSV.");
        return;
      }

      const parsedData: import('./types').CsvTickerLens[] = [];
      let unknownLensCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length <= Math.max(tickerIdx, lensIdx)) continue;
        
        const ticker = cols[tickerIdx];
        const rawLens = cols[lensIdx];
        if (!ticker || !rawLens) continue;

        // Try to map human-readable name or slug to backend slug
        const matchedSkill = availableSkills.find(s => 
          s.slug.toLowerCase() === rawLens.toLowerCase() || 
          s.name.toLowerCase() === rawLens.toLowerCase()
        );

        if (matchedSkill) {
          parsedData.push({ ticker, lensSlug: matchedSkill.slug });
        } else {
          unknownLensCount++;
          // Fallback to exactly what was in the CSV, backend might 404 it or we show warning
          parsedData.push({ ticker, lensSlug: rawLens });
        }
      }

      if (parsedData.length === 0) {
        setCsvError("No valid rows found in the CSV.");
      } else if (onCsvDataChange) {
        onCsvDataChange(parsedData);
        if (unknownLensCount > 0) {
          setCsvError(`Parsed ${parsedData.length} rows, but ${unknownLensCount} lenses could not be matched to available skills.`);
        }
      }
    };
    reader.onerror = () => setCsvError("Failed to read the file.");
    reader.readAsText(file);
  };

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

        {source === "csv" && (
          <div className="space-y-2">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className={`${INPUT_CLS} w-full max-w-sm`}
            />
            {csvData && csvData.length > 0 && !csvError && (
              <p className="text-[12px] text-up font-medium">
                Successfully loaded {csvData.length} valid rows.
              </p>
            )}
            {csvError && (
              <p className="text-[12px] text-warn bg-warn-soft border border-warn rounded-md px-3 py-2">
                {csvError}
              </p>
            )}
            <p className="text-[11px] text-ink-3">
              CSV must have a header row with at least "ticker" and "lens" (or similar) columns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
