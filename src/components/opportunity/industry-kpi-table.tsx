"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { IndustryKpiTimeseries } from "@/types/opportunity";

const DEFAULT_VISIBLE = 5;

interface IndustryKpiTableProps {
  data?: IndustryKpiTimeseries | null;
  loading?: boolean;
}

// Make abbreviation human-readable: "EBITDA_MARGIN" → "Ebitda Margin"
function humanize(abbr: string): string {
  return abbr
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatValue(value: string | null): string {
  if (value === null || value === undefined) return "—";
  return value;
}

export function IndustryKpiTable({ data, loading }: IndustryKpiTableProps) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="text-center text-xs text-zinc-400 py-6">Loading KPI data...</div>
    );
  }

  if (!data?.timeseries?.length) {
    return (
      <div className="text-center text-xs text-zinc-400 py-6">No KPI data available.</div>
    );
  }

  // Collect all unique periods across all KPIs, sorted chronologically
  const allPeriods = Array.from(
    new Set(data.timeseries.flatMap((entry) => entry.data.map((d) => d.period)))
  ).sort();

  // Build lookup: kpi_abbr → { period → value }
  const lookup = new Map<string, Map<string, string>>();
  for (const entry of data.timeseries) {
    const periodMap = new Map<string, string>();
    for (const point of entry.data) {
      periodMap.set(point.period, point.value);
    }
    lookup.set(entry.kpi_abbr, periodMap);
  }

  // Sort KPIs by number of non-null values (most data first)
  const sorted = [...data.timeseries].sort((a, b) => {
    const aCount = a.data.filter((p) => p.value != null).length;
    const bCount = b.data.filter((p) => p.value != null).length;
    return bCount - aCount;
  });

  const visible = showAll ? sorted : sorted.slice(0, DEFAULT_VISIBLE);
  const hasMore = sorted.length > DEFAULT_VISIBLE;

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 py-2.5 min-w-[180px]">
                KPI
              </TableHead>
              {allPeriods.map((period) => (
                <TableHead
                  key={period}
                  className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 py-2.5 text-right whitespace-nowrap"
                >
                  {period}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((entry) => {
              const periodMap = lookup.get(entry.kpi_abbr)!;
              return (
                <TableRow key={entry.kpi_abbr} className="border-zinc-100 dark:border-zinc-800">
                  <TableCell className="py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {humanize(entry.kpi_abbr)}
                    <span className="ml-1.5 text-[10px] font-normal text-zinc-400">
                      {entry.kpi_abbr}
                    </span>
                  </TableCell>
                  {allPeriods.map((period) => {
                    const val = periodMap.get(period) ?? null;
                    return (
                      <TableCell
                        key={period}
                        className={`text-xs py-2.5 text-right ${
                          val != null
                            ? "text-zinc-700 dark:text-zinc-300 font-semibold"
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                      >
                        {formatValue(val)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {showAll ? "Show Less" : `Show ${sorted.length - DEFAULT_VISIBLE} More`}
            {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      )}
    </div>
  );
}
