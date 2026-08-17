"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { FinancialRow, FinancialTable } from "@/types/financials";

// No highlight field from the API anymore — these are the rows that used to carry it.
const HIGHLIGHTED_LABELS = new Set(
  [
    "Income from financial services",
    "Operating Profit",
    "Operating Profit (%)",
    "Profit Before Tax (PBT)",
    "Profit after tax (PAT)",
    "Operating Income", "Gross Margin (%)",
    "Operating Profit (%)",
    "Profit Before Tax (PBT)",
    "Profit after tax (PAT)",
    "PAT (%)",
    "Cash and cash equivalents as at the end of the year",
    "Equity Capital", "Cash & Bank balance (short term)", "Total Liabilities", "Total Borrowings",
  ].map((label) => label.trim().toLowerCase())
);

function fmt(value: number | null | undefined, format?: string, key?: string): string {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${parseFloat(value.toFixed(1))}%`;
  if (key === "eps" || key === "otherIncome") {
    return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

interface FlatRow {
  row: FinancialRow;
  depth: number;
  hasChildren: boolean;
}

function flattenRows(rows: FinancialRow[], expanded: Set<string>, depth = 0): FlatRow[] {
  const out: FlatRow[] = [];
  for (const row of rows) {
    const hasChildren = !!row.children && row.children.length > 0;
    out.push({ row, depth, hasChildren });
    if (hasChildren && expanded.has(row.key)) {
      out.push(...flattenRows(row.children!, expanded, depth + 1));
    }
  }
  return out;
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase();
}

export function FinancialDataTable({
  table,
  cashFlowMode = false,
}: {
  table: FinancialTable;
  cashFlowMode?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Latest periods sit on the right, so open scrolled to the end.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [table]);

  const flatRows = flattenRows(table.rows, expanded);

  return (
    <div className="overflow-x-auto" ref={scrollRef}>
      <table className="min-w-full w-max text-left" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              className="sticky left-0"
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "var(--qc-ink-2)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                padding: "8px 12px 8px 0",
                whiteSpace: "nowrap",
                minWidth: 160,
                background: "var(--qc-card)",
                fontFamily: "'IBM Plex Mono', monospace",
                zIndex: 1,
              }}
            >
              Item
            </th>
            {table.periods.map((period) => (
              <th
                key={period}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--qc-ink-2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flatRows.map(({ row, depth, hasChildren }, idx) => {
            const isHighlighted = HIGHLIGHTED_LABELS.has(normalizeLabel(row.label));
            // const isHighlighted = depth === 0 && HIGHLIGHTED_LABELS.has(row.label);
            const isExpandable = !!row.meta?.expandable && hasChildren;
            const isExpanded = expanded.has(row.key);
            const rowBg = isHighlighted
              ? "var(--qc-section)"
              : idx % 2 === 0
                ? "var(--qc-card)"
                : "var(--qc-section)";
            return (
              <tr
                key={row.key}
                style={{
                  background: rowBg,
                  borderTop: isHighlighted
                    ? "1px solid var(--qc-hair)"
                    : "1px solid transparent",
                }}
              >
                <td
                  className="sticky left-0"
                  style={{
                    fontSize: 13,
                    fontWeight: isHighlighted ? 600 : 400,
                    color: "var(--qc-ink)",
                    padding: "8px 12px 8px 0",
                    paddingLeft: depth * 20,
                    whiteSpace: "nowrap",
                    background: rowBg,
                    zIndex: 1,
                    minWidth: 160,
                  }}
                >
                  {isExpandable ? (
                    <button
                      onClick={() => toggle(row.key)}
                      className="flex items-center gap-1.5 text-left"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        font: "inherit",
                        color: "inherit",
                        fontWeight: "inherit",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          border: "1px solid var(--qc-hair)",
                          background: "var(--qc-section)",
                          fontSize: 10,
                          color: "var(--qc-ink-2)",
                          flexShrink: 0,
                          transition: "transform 0.15s",
                          transform: isExpanded ? "rotate(90deg)" : "none",
                        }}
                      >
                        ›
                      </span>
                      {row.label}
                    </button>
                  ) : (
                    row.label
                  )}
                </td>
                {row.values.map((val, vi) => {
                  let cellColor = "var(--qc-ink)";
                  if (cashFlowMode && val !== null && val !== undefined) {
                    cellColor = val >= 0 ? "var(--qc-up)" : "var(--qc-down)";
                  }
                  return (
                    <td
                      key={vi}
                      style={{
                        fontSize: 13,
                        fontWeight: isHighlighted ? 600 : 400,
                        color: val === null || val === undefined ? "var(--qc-ink-2)" : cellColor,
                        padding: "8px 12px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                        fontFamily: "'IBM Plex Mono', monospace",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {fmt(val, row.format, row.key)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
