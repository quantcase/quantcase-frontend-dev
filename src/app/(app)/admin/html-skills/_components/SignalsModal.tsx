"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Loader2, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
} from "@tanstack/react-table";
import { SIGNAL_TYPE_LABELS, SignalType, API_BASE } from "./types";
import { BACKEND_URL } from "@/lib/constants";

interface SignalMeasure {
  role: string;
  unit: string | null;
  value_raw: string | null;
  period?: { type: string; start: string; end: string };
}

interface SignalData {
  topic: string | null;
  category: string | null;
  details: {
    confidence_level: string | null;
    metric_family: string | null;
    is_conditional: boolean | null;
    outlook: string | null;
  } | null;
  measures: SignalMeasure[];
}

interface Signal {
  id: string;
  call_id: string;
  ticker: string;
  company: string | null;
  fiscal_year: string;
  quarter: string;
  call_date: string;
  signal_type: SignalType;
  metric: string;
  impact: string | null;
  severity: string | null;
  source_doc_type: string | null;
  source_context: string | null;
  value: number | null;
  raw_value: string | null;
  unit: string | null;
  statement: string;
  data: SignalData | null;
}

interface SignalsResponse {
  ticker: string;
  slug: string;
  total: number;
  signals: Signal[];
  historic: boolean;
  base_context_count: number;
  base_missing: boolean;
}

interface Props {
  slug: string;
  ticker: string;
  historic: boolean;
  onClose: () => void;
}

// Custom filter: exact match for dropdown columns
const exactFilter: FilterFn<Signal> = (row, columnId, filterValue) => {
  if (!filterValue) return true;
  return row.getValue(columnId) === filterValue;
};

const columnHelper = createColumnHelper<Signal>();

export function SignalsModal({ slug, ticker, historic, onClose }: Props) {
  const [data, setData] = useState<SignalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "call_date", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}${API_BASE}/${slug}/signals/${ticker}?historic=${historic}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        setData(json as SignalsResponse);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, ticker, historic]);

  // Unique values for dropdown filters
  const uniqueFiscalYears = useMemo(
    () => [...new Set((data?.signals ?? []).map((s) => s.fiscal_year))].sort().reverse(),
    [data]
  );
  const uniqueQuarters = useMemo(
    () => [...new Set((data?.signals ?? []).map((s) => s.quarter))].sort(),
    [data]
  );
  const uniqueSignalTypes = useMemo(
    () => [...new Set((data?.signals ?? []).map((s) => s.signal_type))].sort(),
    [data]
  );
  const uniqueImpacts = useMemo(
    () => {
      const order = ["high", "medium", "low"];
      const vals = [...new Set((data?.signals ?? []).map((s) => s.impact).filter(Boolean))] as string[];
      return vals.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    },
    [data]
  );
  const uniqueSourceContexts = useMemo(
    () => [...new Set((data?.signals ?? []).map((s) => s.source_context).filter(Boolean))].sort() as string[],
    [data]
  );

  const IMPACT_STYLES: Record<string, string> = {
    high: "bg-red-50 text-red-700",
    medium: "bg-amber-50 text-amber-700",
    low: "bg-zinc-100 text-zinc-500",
  };

  const SOURCE_CONTEXT_LABELS: Record<string, string> = {
    analyst_qa: "Analyst Q&A",
    opening_remarks: "Opening Remarks",
    management_discussion: "Mgmt Discussion",
    closing_remarks: "Closing",
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("call_date", {
        header: "Date",
        size: 88,
        cell: (info) => <span className="whitespace-nowrap text-[#888888]">{info.getValue() ?? "—"}</span>,
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("fiscal_year", {
        header: "FY",
        size: 60,
        filterFn: exactFilter,
        cell: (info) => (
          <span className="whitespace-nowrap font-mono text-[11px] text-[#888888]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("quarter", {
        header: "Q",
        size: 44,
        filterFn: exactFilter,
        cell: (info) => (
          <span className="whitespace-nowrap font-mono text-[11px] text-[#888888]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("signal_type", {
        header: "Type",
        size: 130,
        filterFn: exactFilter,
        cell: (info) => (
          <span className="rounded-sm bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-medium text-[#888888] whitespace-nowrap">
            {SIGNAL_TYPE_LABELS[info.getValue()] ?? info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("impact", {
        header: "Impact",
        size: 72,
        filterFn: exactFilter,
        cell: (info) => {
          const v = info.getValue();
          if (!v) return <span className="text-[#888888]">—</span>;
          const cls = IMPACT_STYLES[v] ?? "bg-zinc-100 text-zinc-500";
          return (
            <span className={`rounded-sm px-2 py-0.5 text-[10px] font-medium whitespace-nowrap capitalize ${cls}`}>
              {v}
            </span>
          );
        },
      }),
      columnHelper.accessor("metric", {
        header: "Metric",
        size: 160,
        cell: (info) => (
          <span className="whitespace-nowrap font-mono text-[11px] text-[var(--qc-ink)]">
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "measures",
        header: "Value",
        size: 110,
        enableSorting: false,
        cell: (info) => {
          const measures = info.row.original.data?.measures ?? [];
          if (measures.length === 0) return <span className="text-[#888888]">—</span>;
          return (
            <div className="flex flex-col gap-0.5">
              {measures.slice(0, 2).map((m, i) => (
                <span key={i} className="whitespace-nowrap text-[11px] text-[var(--qc-ink)]">
                  {m.value_raw ?? "—"}{m.unit ? ` ${m.unit}` : ""}
                  {m.role && m.role !== "guided" && (
                    <span className="ml-1 text-[10px] text-[#888888]">({m.role})</span>
                  )}
                </span>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor("source_context", {
        header: "Context",
        size: 120,
        filterFn: exactFilter,
        cell: (info) => {
          const v = info.getValue();
          if (!v) return <span className="text-[#888888]">—</span>;
          return (
            <span className="whitespace-nowrap text-[11px] text-[#888888]">
              {SOURCE_CONTEXT_LABELS[v] ?? v.replace(/_/g, " ")}
            </span>
          );
        },
      }),
      columnHelper.accessor("statement", {
        header: "Statement",
        size: 0,
        enableSorting: false,
        cell: (info) => (
          <span className="line-clamp-2 leading-relaxed text-[#888888] block">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: data?.signals ?? [],
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const total = data?.signals.length ?? 0;
  const filteredCount = table.getFilteredRowModel().rows.length;

  function getFilterValue(columnId: string) {
    return (columnFilters.find((f) => f.id === columnId)?.value as string) ?? "";
  }

  function setDropdownFilter(columnId: string, value: string) {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setColumnFilters((prev) =>
      value
        ? [...prev.filter((f) => f.id !== columnId), { id: columnId, value }]
        : prev.filter((f) => f.id !== columnId)
    );
  }

  function handleGlobalFilter(value: string) {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setGlobalFilter(value);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[1200px] max-h-[88vh] rounded-[10px] border border-[var(--qc-border-default)] bg-white shadow-xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-[var(--qc-border-default)] px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-[14px] font-medium text-[var(--qc-ink)]">Signals</h3>
            <span className="text-[11px] text-[#888888] font-mono">{slug} · {ticker}</span>
            <span className={`rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${historic ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-500"}`}>
              {historic ? "Historic" : "Incremental"}
            </span>
            {data && !data.base_missing && (
              <span className="rounded-sm bg-[#F5F5F5] px-2 py-0.5 text-[11px] font-medium text-[#888888]">
                {filteredCount < total
                  ? `${filteredCount.toLocaleString()} of ${total.toLocaleString()}`
                  : `${total.toLocaleString()} total`}
              </span>
            )}
            {data && !historic && !data.base_missing && (
              <span className="text-[11px] text-[#888888]">
                {data.base_context_count} base {data.base_context_count === 1 ? "analysis" : "analyses"} included
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-[#888888] hover:text-[var(--qc-ink)] hover:border-[var(--qc-border-default)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Toolbar: search + filter dropdowns ── */}
        {data && !data.base_missing && (
          <div className="flex items-center gap-2 border-b border-[var(--qc-border-default)] px-5 py-2.5 shrink-0 bg-[#FAFAFA]">
            {/* Global search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#888888]" />
              <input
                value={globalFilter}
                onChange={(e) => handleGlobalFilter(e.target.value)}
                placeholder="Search all columns…"
                className="pl-8 pr-3 py-1.5 rounded-md border border-[var(--qc-border-default)] bg-white text-[12px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)] w-[220px]"
              />
            </div>

            <div className="w-px h-5 bg-[var(--qc-border-default)]" />

            {/* FY filter */}
            <select
              value={getFilterValue("fiscal_year")}
              onChange={(e) => setDropdownFilter("fiscal_year", e.target.value)}
              className="rounded-md border border-[var(--qc-border-default)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              <option value="">All FY</option>
              {uniqueFiscalYears.map((fy) => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>

            {/* Quarter filter */}
            <select
              value={getFilterValue("quarter")}
              onChange={(e) => setDropdownFilter("quarter", e.target.value)}
              className="rounded-md border border-[var(--qc-border-default)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              <option value="">All Q</option>
              {uniqueQuarters.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>

            {/* Signal type filter */}
            <select
              value={getFilterValue("signal_type")}
              onChange={(e) => setDropdownFilter("signal_type", e.target.value)}
              className="rounded-md border border-[var(--qc-border-default)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              <option value="">All Types</option>
              {uniqueSignalTypes.map((t) => (
                <option key={t} value={t}>{SIGNAL_TYPE_LABELS[t] ?? t}</option>
              ))}
            </select>

            {/* Impact filter */}
            <select
              value={getFilterValue("impact")}
              onChange={(e) => setDropdownFilter("impact", e.target.value)}
              className="rounded-md border border-[var(--qc-border-default)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)] capitalize"
            >
              <option value="">All Impact</option>
              {uniqueImpacts.map((v) => (
                <option key={v} value={v} className="capitalize">{v}</option>
              ))}
            </select>

            {/* Source context filter */}
            <select
              value={getFilterValue("source_context")}
              onChange={(e) => setDropdownFilter("source_context", e.target.value)}
              className="rounded-md border border-[var(--qc-border-default)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              <option value="">All Contexts</option>
              {uniqueSourceContexts.map((v) => (
                <option key={v} value={v}>{SOURCE_CONTEXT_LABELS[v] ?? v.replace(/_/g, " ")}</option>
              ))}
            </select>

            {/* Clear filters */}
            {(globalFilter || columnFilters.length > 0) && (
              <button
                onClick={() => {
                  setGlobalFilter("");
                  setColumnFilters([]);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="text-[11px] text-[#888888] hover:text-[var(--qc-ink)] underline underline-offset-2 decoration-dotted transition-colors ml-1"
              >
                Clear
              </button>
            )}

            {/* Page size picker */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[11px] text-[#888888]">Rows</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPagination({ pageIndex: 0, pageSize: Number(e.target.value) });
                }}
                className="rounded-md border border-[var(--qc-border-default)] bg-white px-2 py-1.5 text-[12px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              >
                {[25, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-48 gap-3 text-[#888888]">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-[13px]">Loading signals…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 m-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && data?.base_missing && (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-[#888888]">
              <AlertCircle className="size-6 text-amber-600" />
              <p className="text-[13px]">No base output exists for this ticker yet.</p>
              <p className="text-[12px]">Run Historic first to build a base for incremental signals.</p>
            </div>
          )}

          {!loading && data && !data.base_missing && (
            <table className="w-full text-[12px] table-fixed">
              <colgroup>
                {table.getAllColumns().map((col) => (
                  <col
                    key={col.id}
                    style={col.columnDef.size ? { width: col.columnDef.size } : undefined}
                  />
                ))}
              </colgroup>
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_#E2E2E2]">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={`px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888] whitespace-nowrap select-none ${canSort ? "cursor-pointer hover:text-[var(--qc-ink)]" : ""}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              sorted === "asc" ? <ChevronUp className="size-3" /> :
                              sorted === "desc" ? <ChevronDown className="size-3" /> :
                              <ChevronsUpDown className="size-3 opacity-30" />
                            )}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-[#E2E2E2]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAFAFA] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 overflow-hidden">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && data && !data.base_missing && filteredCount === 0 && (
            <p className="text-center py-10 text-[13px] text-[#888888]">No signals match the current filters.</p>
          )}
        </div>

        {/* ── Pagination footer ── */}
        {!loading && data && !data.base_missing && filteredCount > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--qc-border-default)] px-5 py-2.5 shrink-0 bg-[#FAFAFA]">
            <span className="text-[11px] text-[#888888]">
              {(() => {
                const start = pagination.pageIndex * pagination.pageSize + 1;
                const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount);
                return `${start}–${end} of ${filteredCount.toLocaleString()}`;
              })()}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded px-2 py-1 text-[11px] text-[#888888] hover:text-[var(--qc-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center justify-center size-7 rounded border border-[var(--qc-border-default)] text-[#888888] hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              {/* Page number pills */}
              {(() => {
                const current = pagination.pageIndex;
                const total = table.getPageCount();
                const pages: (number | "…")[] = [];
                if (total <= 7) {
                  for (let i = 0; i < total; i++) pages.push(i);
                } else {
                  pages.push(0);
                  if (current > 2) pages.push("…");
                  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) pages.push(i);
                  if (current < total - 3) pages.push("…");
                  pages.push(total - 1);
                }
                return pages.map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-[11px] text-[#888888]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => table.setPageIndex(p as number)}
                      className={`size-7 rounded text-[11px] font-medium transition-colors ${
                        p === current
                          ? "bg-[#0F172B] text-white"
                          : "border border-[var(--qc-border-default)] text-[#888888] hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)]"
                      }`}
                    >
                      {(p as number) + 1}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center justify-center size-7 rounded border border-[var(--qc-border-default)] text-[#888888] hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="size-3.5" />
              </button>
              <button
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                className="rounded px-2 py-1 text-[11px] text-[#888888] hover:text-[var(--qc-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
