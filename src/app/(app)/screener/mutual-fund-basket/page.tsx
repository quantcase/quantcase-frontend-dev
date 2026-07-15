"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useMfBaskets } from "@/hooks/useMfBaskets";
import { useMfBasketSchemes } from "@/hooks/useMfBasketSchemes";
import type { MfBasketCondition, MfBasketScheme } from "@/types/mutual-fund";

// ── Formatters ────────────────────────────────────────────────────────────────

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(2)}%`;
}

function cr(v: number | null | undefined): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L Cr`;
  if (Math.abs(v) >= 1_000) return `₹${(v / 1_000).toFixed(1)}K Cr`;
  return `₹${v.toFixed(0)} Cr`;
}

function num(v: number | null | undefined, dp = 2): string {
  if (v == null) return "—";
  return v.toFixed(dp);
}

// ── Column registry ───────────────────────────────────────────────────────────

interface ColMeta {
  label: string;
  align: "left" | "right";
  format?: (v: number | null | undefined) => string;
}

const COL_META: Record<string, ColMeta> = {
  name:          { label: "Fund Name",      align: "left" },
  amc_name:      { label: "AMC",            align: "left" },
  category:      { label: "Category",       align: "left" },
  plan_type:     { label: "Plan",           align: "left" },
  risk_label:    { label: "Risk",           align: "left" },
  expense_ratio: { label: "Expense Ratio",  align: "right", format: pct },
  aum:           { label: "AUM",            align: "right", format: cr },
  morningstar:   { label: "★ Rating",       align: "right", format: (v) => v == null ? "—" : `${v}/5` },
  nav:           { label: "NAV",            align: "right", format: (v) => num(v) },
};

function cellStr(scheme: MfBasketScheme, key: string): string {
  const meta = COL_META[key];
  const raw = scheme[key];
  if (meta?.format && (typeof raw === "number" || raw == null)) {
    return meta.format(raw as number | null | undefined);
  }
  if (raw == null) return "—";
  return String(raw);
}

// ── Condition pill ────────────────────────────────────────────────────────────

function ConditionPill({ condition }: { condition: MfBasketCondition }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1.5"
      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
    >
      <span className="text-[11px] font-medium" style={{ color: "var(--qc-ink)" }}>
        {condition.label}
      </span>
      <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
        {condition.operator} {condition.value}
      </span>
    </div>
  );
}

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  if (dir === "asc") return <ArrowUp className="h-3 w-3 inline-block ml-1" />;
  if (dir === "desc") return <ArrowDown className="h-3 w-3 inline-block ml-1" />;
  return <ChevronsUpDown className="h-3 w-3 inline-block ml-1 opacity-30" />;
}

// ── Main content ──────────────────────────────────────────────────────────────

function MfBasketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const basketId = searchParams.get("id");

  const { data: mfBasketsData, loading: mfBasketsLoading, error: mfBasketsError } = useMfBaskets();
  const { data: schemesData, loading: schemesLoading, error: schemesError } = useMfBasketSchemes(basketId);

  const basketMeta = mfBasketsData?.baskets.find((b) => b.id === basketId) ?? null;
  const basket = schemesData?.basket ?? basketMeta;
  const rawConditions = schemesData?.basket?.conditions ?? basketMeta?.conditions;
  const conditions: MfBasketCondition[] = Array.isArray(rawConditions) ? rawConditions : [];
  const rawColumns: string[] = Array.isArray(basket?.columns ?? basketMeta?.columns)
    ? (basket?.columns ?? basketMeta?.columns ?? [])
    : [];

  const schemes = useMemo(() => schemesData?.schemes ?? [], [schemesData]);
  const pagination = schemesData?.pagination;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const columns = useMemo<ColumnDef<MfBasketScheme>[]>(() => {
    const keysToShow: string[] = ["name", ...rawColumns.filter((k) => k !== "name")];

    const cols: ColumnDef<MfBasketScheme>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-ink-2)" }}>
            {row.index + 1}
          </span>
        ),
        size: 40,
        enableSorting: false,
      },
    ];

    for (const key of keysToShow) {
      const meta = COL_META[key] ?? {
        label: key.replace(/([A-Z_])/g, (m) => m === "_" ? " " : ` ${m}`).trim(),
        align: "right" as const,
      };

      cols.push({
        id: key,
        accessorKey: key,
        header: meta.label,
        cell: ({ row }) => cellStr(row.original, key),
        sortingFn: (a, b) => {
          const av = a.original[key];
          const bv = b.original[key];
          if (typeof av === "number" && typeof bv === "number") return av - bv;
          if (av == null) return 1;
          if (bv == null) return -1;
          return String(av).localeCompare(String(bv));
        },
        filterFn: "includesString",
      });
    }

    cols.push({
      id: "arrow",
      header: "",
      cell: () => (
        <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--qc-ink)" }} />
      ),
      size: 40,
      enableSorting: false,
    });

    return cols;
  }, [rawColumns]);

  const table = useReactTable({
    data: schemes,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const currentPageSize = table.getState().pagination.pageSize;
  if (currentPageSize !== pageSize) table.setPageSize(pageSize);

  if (!basketId) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>No basket selected.</p>
      </div>
    );
  }

  const isLoading = mfBasketsLoading || (!basket && schemesLoading);
  const topError = mfBasketsError || (!basket && schemesError);

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-bg)" }}>

      {/* Hero header */}
      <div className="relative" style={{ background: "var(--qc-bg)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, var(--qc-lime) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-8 pt-10 pb-8">
          {isLoading && !basket && (
            <div className="flex items-center gap-2 py-16 justify-center" style={{ color: "var(--qc-ink-2)" }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading basket…</span>
            </div>
          )}

          {topError && (
            <div className="flex items-center gap-2 rounded-xl border border-down-soft bg-down-soft px-4 py-3">
              <AlertCircle className="h-4 w-4 text-down flex-shrink-0" />
              <p className="text-sm text-down">{topError}</p>
            </div>
          )}

          {basket && (
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="space-y-2 flex-1 min-w-0">
                <button
                  onClick={() => router.push("/screener/home")}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-1 transition-opacity hover:opacity-60"
                  style={{ color: "var(--qc-ink-2)" }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Fund Baskets
                </button>

                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border"
                  style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--qc-ink-2)" }}>
                    {basket.category}
                  </span>
                </div>

                <h1 className="text-[32px] font-medium leading-tight" style={{ color: "var(--qc-ink)" }}>
                  {basket.title}
                </h1>
                <p className="text-[14px] max-w-2xl leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
                  {basket.description}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 pt-6">
                {pagination && (
                  <div
                    className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-[10px] border"
                    style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--qc-ink-2)" }}>Funds</span>
                    <span className="text-[15px] font-semibold" style={{ color: "var(--qc-ink)" }}>{pagination.total}</span>
                  </div>
                )}
                {conditions.length > 0 && (
                  <div
                    className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-[10px] border"
                    style={{ borderColor: "var(--qc-hair)", background: "var(--qc-lime)" }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--qc-ink)" }}>Conditions</span>
                    <span className="text-[15px] font-semibold" style={{ color: "var(--qc-ink)" }}>{conditions.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-4">
        {basket && (
          <>
            {conditions.length > 0 && (
              <div
                className="rounded-[10px] border p-4 space-y-3"
                style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--qc-ink)" }}>
                  Screening Conditions
                </p>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c, i) => <ConditionPill key={i} condition={c} />)}
                </div>
              </div>
            )}

            <div
              className="rounded-[10px] border p-2"
              style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
            >
              {/* Toolbar */}
              <div className="px-2 pt-1 pb-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--qc-ink)" }}>
                  Matching Funds
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5"
                    style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
                  >
                    <Search className="h-3 w-3 flex-shrink-0" style={{ color: "var(--qc-ink-2)" }} />
                    <input
                      type="text"
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      placeholder="Search funds…"
                      className="w-36 text-[12px] outline-none bg-transparent"
                      style={{ color: "var(--qc-ink)" }}
                    />
                    {globalFilter && (
                      <button onClick={() => setGlobalFilter("")}>
                        <X className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
                      </button>
                    )}
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="rounded-[8px] px-2 py-1.5 text-[11px] outline-none cursor-pointer"
                    style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink-2)" }}
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} / page</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}
              >
                {schemesLoading && (
                  <div className="flex items-center justify-center py-16 gap-2" style={{ color: "var(--qc-ink-2)" }}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading funds…</span>
                  </div>
                )}

                {!schemesLoading && schemesError && (
                  <div className="flex items-center justify-center py-16 gap-2 text-down">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{schemesError}</span>
                  </div>
                )}

                {!schemesLoading && !schemesError && schemes.length === 0 && (
                  <p className="text-sm text-center py-14" style={{ color: "var(--qc-ink-2)" }}>
                    No funds matched this basket&apos;s criteria.
                  </p>
                )}

                {!schemesLoading && !schemesError && schemes.length > 0 && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id} style={{ borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
                              {hg.headers.map((header) => {
                                const meta = header.column.id !== "index" && header.column.id !== "arrow"
                                  ? (COL_META[header.column.id] ?? { align: "right" })
                                  : { align: "left" as const };
                                return (
                                  <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className={`px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap select-none ${
                                      header.column.getCanSort() ? "cursor-pointer hover:opacity-70" : ""
                                    } ${meta.align === "right" ? "text-right" : "text-left"}`}
                                    style={{ color: "var(--qc-ink-2)" }}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getCanSort() && <SortIcon dir={header.column.getIsSorted()} />}
                                  </th>
                                );
                              })}
                            </tr>
                          ))}
                        </thead>
                        <tbody>
                          {table.getRowModel().rows.map((row, i) => {
                            const isLast = i === table.getRowModel().rows.length - 1;
                            return (
                              <tr
                                key={row.id}
                                onClick={() => router.push(`/screener/mutual-fund/${encodeURIComponent(row.original.amfi_code)}`)}
                                className="cursor-pointer transition-colors group"
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "")}
                                style={{ borderBottom: !isLast ? "1px solid var(--qc-hair-2)" : undefined }}
                              >
                                {row.getVisibleCells().map((cell) => {
                                  const isRight =
                                    cell.column.id !== "index" &&
                                    cell.column.id !== "arrow" &&
                                    (COL_META[cell.column.id]?.align ?? "right") === "right";
                                  return (
                                    <td
                                      key={cell.id}
                                      className={`px-4 py-3 text-sm whitespace-nowrap ${isRight ? "text-right" : "text-left"}`}
                                      style={{
                                        color: cell.column.id === "name" ? "var(--qc-ink)" : "var(--qc-ink-2)",
                                        fontWeight: cell.column.id === "name" ? 500 : 400,
                                      }}
                                    >
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination footer */}
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ borderTop: "1px solid var(--qc-hair)" }}
                    >
                      <p className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                        {table.getFilteredRowModel().rows.length} result
                        {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                        >
                          <ChevronLeft className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                        </button>
                        <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </span>
                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                        >
                          <ChevronRight className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MfBasketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32 gap-2" style={{ color: "var(--qc-ink-2)" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      }
    >
      <MfBasketContent />
    </Suspense>
  );
}
