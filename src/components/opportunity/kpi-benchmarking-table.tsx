"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { PeerKpiTimeseries } from "@/types/opportunity";

interface KpiBenchmarkingTableProps {
  data?: PeerKpiTimeseries | null;
  loading?: boolean;
}

function humanize(abbr: string): string {
  return abbr
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatValue(value: string | null | undefined): string {
  if (value == null) return "—";
  return value;
}

export function KpiBenchmarkingTable({ data, loading }: KpiBenchmarkingTableProps) {
  if (loading) {
    return <div className="text-center text-xs text-zinc-400 py-6">Loading KPI benchmarking...</div>;
  }

  if (!data?.companies?.length) {
    return <div className="text-center text-xs text-zinc-400 py-6">No KPI benchmarking data available.</div>;
  }

  // Collect all unique KPI keys across all companies
  const allKpis = Array.from(
    new Set(data.companies.flatMap((c) => c.timeseries.map((t) => t.kpi_abbr)))
  );

  // For each company + KPI, get the latest (last) data point value
  const latestValue = (ticker: string, kpi: string): string | null => {
    const company = data.companies.find((c) => c.ticker === ticker);
    if (!company) return null;
    const entry = company.timeseries.find((t) => t.kpi_abbr === kpi);
    if (!entry?.data?.length) return null;
    return entry.data[entry.data.length - 1].value;
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-0">
            <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 py-2.5 min-w-[160px]">
              KPI
            </TableHead>
            {data.companies.map((company) => (
              <TableHead
                key={company.ticker}
                className={`text-[10px] font-semibold uppercase tracking-wider py-2.5 text-right whitespace-nowrap ${
                  company.is_current
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {company.ticker}
                {company.is_current && (
                  <span className="ml-1 text-[9px] normal-case font-normal opacity-70">(you)</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allKpis.map((kpi) => (
            <TableRow key={kpi} className="border-zinc-100 dark:border-zinc-800">
              <TableCell className="py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {humanize(kpi)}
                <span className="ml-1.5 text-[10px] font-normal text-zinc-400">{kpi}</span>
              </TableCell>
              {data.companies.map((company) => {
                const val = latestValue(company.ticker, kpi);
                return (
                  <TableCell
                    key={company.ticker}
                    className={`text-xs py-2.5 text-right font-semibold ${
                      company.is_current
                        ? "text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/10"
                        : val != null
                        ? "text-zinc-700 dark:text-zinc-300"
                        : "text-zinc-300 dark:text-zinc-600"
                    }`}
                  >
                    {formatValue(val)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
