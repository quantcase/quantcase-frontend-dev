"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { PeerRow } from "@/hooks/useScreenerPeers";

function fmtNum(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ChevronUp className="inline-block ml-1 h-3 w-3" />;
  if (isSorted === "desc") return <ChevronDown className="inline-block ml-1 h-3 w-3" />;
  return <ChevronsUpDown className="inline-block ml-1 h-3 w-3 opacity-40" />;
}

const PAGE_SIZES = [10, 25, 50];

export function PeerComparisonDataTable({ peers }: { peers: PeerRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const columns = useMemo<ColumnDef<PeerRow>[]>(
    () => [
      {
        id: "sno",
        header: "S.No.",
        cell: ({ row }) => (
          <span style={{ color: "#888888", fontSize: 13 }}>{row.index + 1}.</span>
        ),
        enableSorting: false,
        size: 48,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span
            style={{
              fontSize: 13,
              fontWeight: row.original.isSubject ? 600 : 400,
              color: "#0F172B",
            }}
          >
            {row.original.name}
          </span>
        ),
        size: 220,
      },
      {
        accessorKey: "cmp",
        header: "CMP Rs.",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 13, color: "#121212" }}>{fmtNum(getValue() as number | null)}</span>
        ),
      },
      {
        accessorKey: "pe",
        header: "P/E",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 13, color: "#121212" }}>{fmtNum(getValue() as number | null)}</span>
        ),
      },
      {
        accessorKey: "marketCapCr",
        header: "Mar Cap Rs.Cr.",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 13, color: "#121212" }}>{fmtNum(getValue() as number | null)}</span>
        ),
      },
      {
        accessorKey: "divYld",
        header: "Div Yld %",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 13, color: "#121212" }}>{fmtNum(getValue() as number | null)}</span>
        ),
      },
      {
        accessorKey: "npQtrCr",
        header: "NP Qtr Rs.Cr.",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 13, color: "#121212" }}>{fmtNum(getValue() as number | null)}</span>
        ),
      },
      {
        accessorKey: "qtrProfitVar",
        header: "Qtr Profit Var %",
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          const color = val === null ? "#888888" : val > 0 ? "#16a34a" : val < 0 ? "#dc2626" : "#121212";
          return <span style={{ fontSize: 13, color }}>{fmtNum(val)}</span>;
        },
      },
      {
        accessorKey: "salesQtrCr",
        header: "Sales Qtr Rs.Cr.",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 13, color: "#121212" }}>{fmtNum(getValue() as number | null)}</span>
        ),
      },
      {
        accessorKey: "qtrSalesVar",
        header: "Qtr Sales Var %",
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          const color = val === null ? "#888888" : val > 0 ? "#16a34a" : val < 0 ? "#dc2626" : "#121212";
          return <span style={{ fontSize: 13, color }}>{fmtNum(val)}</span>;
        },
      },
      {
        accessorKey: "roce",
        header: "ROCE %",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 13, color: "#121212" }}>{fmtNum(getValue() as number | null)}</span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: peers,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: (filter) => {
      setGlobalFilter(filter);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalFiltered = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Input
            placeholder="Search companies..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ fontSize: 13, paddingLeft: 32, width: 240, height: 34 }}
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: "#888888" }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, color: "#888888" }}>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPagination({ pageIndex: 0, pageSize: Number(e.target.value) });
            }}
            style={{
              fontSize: 12, color: "#0F172B", border: "1px solid #E2E2E2",
              borderRadius: 6, padding: "4px 8px", background: "white", cursor: "pointer",
            }}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E2E2E2]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} style={{ background: "#FAFAFA", borderBottom: "1px solid #E2E2E2" }}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      fontSize: 10, fontWeight: 500, color: "#888888",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      whiteSpace: "nowrap", padding: "8px 12px",
                      textAlign: header.column.id === "sno" || header.column.id === "name" ? "left" : "right",
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none",
                      width: header.column.columnDef.size,
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <SortIcon isSorted={header.column.getIsSorted()} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  style={{ textAlign: "center", fontSize: 13, color: "#888888", padding: "24px 12px" }}
                >
                  No companies found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  style={{
                    background: row.original.isSubject
                      ? "#F5F5F5"
                      : idx % 2 === 0 ? "#ffffff" : "#fafafa",
                    borderTop: row.original.isSubject ? "1px solid #E2E2E2" : undefined,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        padding: "8px 12px",
                        textAlign: cell.column.id === "sno" || cell.column.id === "name" ? "left" : "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: "#888888" }}>
          {totalFiltered === peers.length
            ? `${peers.length} companies`
            : `${totalFiltered} of ${peers.length} companies`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{ height: 30, width: 30, padding: 0 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
            // Show pages around current page
            const half = 3;
            let start = Math.max(0, pageIndex - half);
            const end = Math.min(pageCount - 1, start + 6);
            start = Math.max(0, end - 6);
            return start + i <= end ? start + i : null;
          })
            .filter((p): p is number => p !== null)
            .map((p) => (
              <Button
                key={p}
                variant={p === pageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(p)}
                style={{
                  height: 30, minWidth: 30, padding: "0 8px", fontSize: 12,
                  background: p === pageIndex ? "#0F172B" : undefined,
                  color: p === pageIndex ? "#ffffff" : undefined,
                  borderColor: p === pageIndex ? "#0F172B" : undefined,
                }}
              >
                {p + 1}
              </Button>
            ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{ height: 30, width: 30, padding: 0 }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
