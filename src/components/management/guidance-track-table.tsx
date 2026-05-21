"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Clock, Target, ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { GuidanceRow, GuidanceSeverity } from "@/types/management";

interface GuidanceFilterState {
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  selectedSeverities: Set<GuidanceSeverity>;
  setSelectedSeverities: (next: Set<GuidanceSeverity>) => void;
}

export function useGuidanceFilterState(): GuidanceFilterState {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedSeverities, setSelectedSeverities] = useState<Set<GuidanceSeverity>>(new Set());
  return { globalFilter, setGlobalFilter, selectedSeverities, setSelectedSeverities };
}

export function GuidanceFilterControls({ state }: { state: GuidanceFilterState }) {
  const { globalFilter, setGlobalFilter, selectedSeverities, setSelectedSeverities } = state;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <SeverityDropdown selected={selectedSeverities} onChange={setSelectedSeverities} />
      <div style={{ position: "relative" }}>
        <Search style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--qc-ink-2)", pointerEvents: "none" }} />
        <input
          type="text"
          placeholder="Search…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{
            fontSize: 12, paddingLeft: 26, paddingRight: 10, paddingTop: 5, paddingBottom: 5,
            border: "1px solid var(--qc-hair)", borderRadius: 6, width: 180,
            outline: "none", color: "var(--qc-ink)", background: "var(--qc-card)",
          }}
        />
      </div>
    </div>
  );
}

interface GuidanceTrackTableProps {
  rows: GuidanceRow[];
  filterState: GuidanceFilterState;
}

function getStatusConfig(severity: GuidanceSeverity) {
  switch (severity) {
    case "beat":
      return {
        icon: <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--qc-up)" }} />,
        textColor: "var(--qc-up)",
        borderLeft: "4px solid var(--qc-up)",
        label: "Beat",
      };
    case "major":
      return {
        icon: <XCircle className="h-3.5 w-3.5" style={{ color: "var(--qc-down)" }} />,
        textColor: "var(--qc-down)",
        borderLeft: "4px solid var(--qc-down)",
        label: "Major Miss",
      };
    case "mediocre":
      return {
        icon: <XCircle className="h-3.5 w-3.5" style={{ color: "var(--qc-down)" }} />,
        textColor: "var(--qc-down)",
        borderLeft: "4px solid var(--qc-down)",
        label: "Miss",
      };
    case "minor":
      return {
        icon: <XCircle className="h-3.5 w-3.5" style={{ color: "var(--qc-warn)" }} />,
        textColor: "var(--qc-warn)",
        borderLeft: "4px solid var(--qc-warn)",
        label: "Minor Miss",
      };
    case "rolled_forward":
      return {
        icon: <Clock className="h-3.5 w-3.5" style={{ color: "var(--qc-blue)" }} />,
        textColor: "var(--qc-blue)",
        borderLeft: "4px solid var(--qc-blue)",
        label: "Rolled Fwd",
      };
    case "ongoing":
      return {
        icon: <Clock className="h-3.5 w-3.5" style={{ color: "var(--qc-blue)" }} />,
        textColor: "var(--qc-blue)",
        borderLeft: "4px solid var(--qc-blue)",
        label: "Ongoing",
      };
    case "not_trackable":
      return { icon: null, textColor: "var(--qc-ink-2)", borderLeft: "none", label: "N/A" };
    default:
      return { icon: null, textColor: "var(--qc-ink-2)", borderLeft: "none", label: String(severity) };
  }
}

const SEVERITY_OPTIONS: { value: GuidanceSeverity; label: string }[] = [
  { value: "beat", label: "Beat" },
  { value: "major", label: "Major Miss" },
  { value: "mediocre", label: "Miss" },
  { value: "minor", label: "Minor Miss" },
  { value: "rolled_forward", label: "Rolled Fwd" },
  { value: "ongoing", label: "Ongoing" },
  { value: "not_trackable", label: "N/A" },
];

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ChevronUp className="h-3 w-3" style={{ color: "var(--qc-ink)" }} />;
  if (sorted === "desc") return <ChevronDown className="h-3 w-3" style={{ color: "var(--qc-ink)" }} />;
  return <ChevronsUpDown className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />;
}

function SeverityDropdown({
  selected,
  onChange,
}: {
  selected: Set<GuidanceSeverity>;
  onChange: (next: Set<GuidanceSeverity>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const label = selected.size === 0 ? "All Severities" : selected.size === 1
    ? SEVERITY_OPTIONS.find(o => selected.has(o.value))?.label ?? "1 selected"
    : `${selected.size} selected`;

  const toggle = (val: GuidanceSeverity) => {
    const next = new Set(selected);
    if (next.has(val)) next.delete(val); else next.add(val);
    onChange(next);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 500,
          color: selected.size > 0 ? "var(--qc-ink)" : "var(--qc-ink-2)",
          border: `1px solid ${selected.size > 0 ? "var(--qc-ink)" : "var(--qc-hair)"}`,
          borderRadius: 6, padding: "5px 10px",
          background: "var(--qc-card)", cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        {label}
        <ChevronDown className="h-3 w-3" style={{ color: "var(--qc-ink-2)", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
          background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 160, padding: "4px 0",
        }}>
          <button
            onClick={() => onChange(new Set())}
            style={{
              width: "100%", textAlign: "left", padding: "6px 12px",
              fontSize: 11, color: selected.size === 0 ? "var(--qc-ink)" : "var(--qc-ink-2)",
              fontWeight: selected.size === 0 ? 600 : 400,
              background: "none", border: "none", cursor: "pointer",
              borderBottom: "1px solid var(--qc-section)",
            }}
          >
            All
          </button>
          {SEVERITY_OPTIONS.map(opt => (
            <label
              key={opt.value}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", cursor: "pointer",
                fontSize: 12, color: "var(--qc-ink)",
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(opt.value)}
                onChange={() => toggle(opt.value)}
                style={{ accentColor: "var(--qc-ink)", width: 13, height: 13, cursor: "pointer", flexShrink: 0 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuidanceTrackTable({ rows, filterState }: GuidanceTrackTableProps) {
  const { globalFilter, setGlobalFilter, selectedSeverities } = filterState;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    if (selectedSeverities.size === 0) {
      setColumnFilters(prev => prev.filter(f => f.id !== "severity"));
    } else {
      setColumnFilters(prev => [
        ...prev.filter(f => f.id !== "severity"),
        { id: "severity", value: selectedSeverities },
      ]);
    }
  }, [selectedSeverities]);

  const columns = useMemo<ColumnDef<GuidanceRow>[]>(() => [
    { accessorKey: "period", header: "Period", size: 120 },
    {
      accessorKey: "tag",
      header: "Tag",
      size: 130,
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded flex-shrink-0" style={{ background: "var(--qc-chip)", border: "1px solid var(--qc-hair)" }}>
            <Target className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
          </span>
          <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--qc-ink-2)" }}>
            {String(getValue()).replace(/_/g, " ")}
          </span>
        </div>
      ),
    },
    { accessorKey: "metric", header: "Metric", size: 200 },
    { accessorKey: "guidance", header: "Guidance", size: 200 },
    {
      id: "actual",
      header: "Actual / Delta",
      size: 200,
      accessorFn: (row) => row.actual,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="text-xs" style={{ color: "var(--qc-ink)" }}>{row.original.actual}</div>
          {row.original.delta && (
            <div className="text-[10px]" style={{ color: "var(--qc-ink-2)" }}>{row.original.delta}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severity",
      size: 130,
      filterFn: (row, _colId, filterValue: Set<GuidanceSeverity>) => {
        if (!filterValue || filterValue.size === 0) return true;
        return filterValue.has(row.original.severity);
      },
      cell: ({ getValue }) => {
        const config = getStatusConfig(getValue() as GuidanceSeverity);
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: "var(--qc-section)" }}>
            <span className="flex-shrink-0">{config.icon}</span>
            <span className="text-[10px] font-medium uppercase tracking-wide whitespace-nowrap" style={{ color: config.textColor }}>
              {config.label}
            </span>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
    globalFilterFn: (row, _colId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      return (
        row.original.period.toLowerCase().includes(search) ||
        row.original.metric.toLowerCase().includes(search) ||
        row.original.guidance.toLowerCase().includes(search) ||
        row.original.actual.toLowerCase().includes(search) ||
        row.original.tag.toLowerCase().includes(search)
      );
    },
  });

  if (rows.length === 0) {
    return <p className="text-xs py-4" style={{ color: "var(--qc-ink-2)" }}>No guidance records available</p>;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "11%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} style={{ borderBottom: "1px solid var(--qc-hair)" }}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: "6px 8px", textAlign: "left",
                      fontSize: 10, fontWeight: 500, color: "var(--qc-ink-2)",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none", whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon sorted={header.column.getIsSorted()} />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <TooltipProvider delayDuration={300}>
              {table.getRowModel().rows.map(row => {
                const config = getStatusConfig(row.original.severity);
                const hasTooltip = !!row.original.management_explanation;

                const tr = (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid var(--qc-hair-2)", borderLeft: config.borderLeft }}
                  >
                    <td style={{ padding: "8px 8px", fontSize: 12, color: "var(--qc-ink)", wordBreak: "break-word" }}>{row.original.period}</td>
                    <td style={{ padding: "8px 8px" }}>{flexRender(columns[1].cell, row.getVisibleCells()[1].getContext())}</td>
                    <td style={{ padding: "8px 8px", fontSize: 12, color: "var(--qc-ink)", wordBreak: "break-word" }}>{row.original.metric}</td>
                    <td style={{ padding: "8px 8px", fontSize: 12, color: "var(--qc-ink)", wordBreak: "break-word" }}>{row.original.guidance}</td>
                    <td style={{ padding: "8px 8px" }}>{flexRender(columns[4].cell, row.getVisibleCells()[4].getContext())}</td>
                    <td style={{ padding: "8px 8px" }}>{flexRender(columns[5].cell, row.getVisibleCells()[5].getContext())}</td>
                  </tr>
                );

                if (!hasTooltip) return tr;
                return (
                  <TooltipRoot key={row.id}>
                    <TooltipTrigger asChild>{tr}</TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm leading-relaxed">
                      <p>{row.original.management_explanation}</p>
                    </TooltipContent>
                  </TooltipRoot>
                );
              })}
            </TooltipProvider>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px 8px", textAlign: "center", fontSize: 12, color: "var(--qc-ink-2)" }}>
                  No results match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
        <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>
          {table.getFilteredRowModel().rows.length} rows
          {table.getPageCount() > 1 && ` · page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            style={{ fontSize: 11, border: "1px solid var(--qc-hair)", borderRadius: 6, padding: "3px 6px", color: "var(--qc-ink)", background: "var(--qc-card)", cursor: "pointer" }}
          >
            {[5, 10, 20, 50].map(sz => <option key={sz} value={sz}>{sz} / page</option>)}
          </select>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid var(--qc-hair)", background: "var(--qc-card)", cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed", opacity: table.getCanPreviousPage() ? 1 : 0.4 }}
          >
            <ChevronLeft className="h-3.5 w-3.5" style={{ color: "var(--qc-ink)" }} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid var(--qc-hair)", background: "var(--qc-card)", cursor: table.getCanNextPage() ? "pointer" : "not-allowed", opacity: table.getCanNextPage() ? 1 : 0.4 }}
          >
            <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--qc-ink)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
