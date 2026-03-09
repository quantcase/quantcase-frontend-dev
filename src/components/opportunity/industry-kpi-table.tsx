"use client";

import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BACKEND_URL } from "@/lib/constants";
import type { IndustryKpiTimeseries } from "@/types/opportunity";

interface IndustryKpiTableProps {
  callId: string;
}

// Make abbreviation human-readable: "EBITDA_MARGIN" → "Ebitda Margin"
function humanize(abbr: string): string {
  return abbr
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatValue(value: number | null): string {
  if (value === null || value === undefined) return "—";
  // Show up to 2 decimal places, strip trailing zeros
  return parseFloat(value.toFixed(2)).toString();
}

export function IndustryKpiTable({ callId }: IndustryKpiTableProps) {
  const [data, setData] = useState<IndustryKpiTimeseries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId) return;
    setLoading(true);
    fetch(`${BACKEND_URL}/api/opportunity/peer-data?callId=${callId}`)
      .then((res) => res.json())
      .then((json) => setData(json.industry_kpis ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [callId]);

  if (loading) {
    return (
      <div className="text-center text-xs text-zinc-400 py-6">Loading industry KPI data...</div>
    );
  }

  if (!data?.timeseries?.length) {
    return (
      <div className="text-center text-xs text-zinc-400 py-6">No industry KPI data available.</div>
    );
  }

  // Collect all unique periods across all KPIs, sorted chronologically
  const allPeriods = Array.from(
    new Set(data.timeseries.flatMap((entry) => entry.data.map((d) => d.period)))
  ).sort();

  // Build lookup: kpi_abbr → { period → value }
  const lookup = new Map<string, Map<string, number>>();
  for (const entry of data.timeseries) {
    const periodMap = new Map<string, number>();
    for (const point of entry.data) {
      periodMap.set(point.period, point.value);
    }
    lookup.set(entry.kpi_abbr, periodMap);
  }

  return (
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
          {data.timeseries.map((entry) => {
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
                        val !== null
                          ? "text-zinc-700 dark:text-zinc-300 font-medium"
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
  );
}
