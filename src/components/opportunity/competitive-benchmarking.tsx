"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowUpRight } from "lucide-react";
import type { CompetitionSection, PeerRow } from "@/types/opportunity";

interface CompetitiveBenchmarkingProps {
  data?: CompetitionSection;
  peers: PeerRow[];
  loading?: boolean;
}

const columns = [
  { key: "company", label: "Company" },
  { key: "revenue", label: "Revenue (₹Cr)" },
  { key: "revenue_growth", label: "Revenue Growth" },
  { key: "opm", label: "OPM %" },
  { key: "roce", label: "ROCE %" },
  { key: "market_share", label: "Market Share" },
  { key: "debt_equity", label: "Debt/Equity" },
] as const;

function formatValue(key: string, value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (key === "revenue") return value.toLocaleString("en-IN");
  if (key === "revenue_growth" || key === "opm" || key === "roce" || key === "market_share")
    return `${value}%`;
  return String(value);
}

export function CompetitiveBenchmarking({ peers, loading }: CompetitiveBenchmarkingProps) {
  return (
    <div className="space-y-4">
      <div style={{ borderRadius: 8, border: "1px solid var(--qc-border-default)", overflow: "hidden" }}>
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-[10px] font-semibold uppercase tracking-wider py-2.5"
                  style={{ color: "var(--qc-text-muted)", background: "var(--qc-surface-panel)" }}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-xs py-6" style={{ color: "var(--qc-text-muted)" }}>
                  Loading peers...
                </TableCell>
              </TableRow>
            ) : peers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-xs py-6" style={{ color: "var(--qc-text-muted)" }}>
                  No peer data available.
                </TableCell>
              </TableRow>
            ) : (
              peers.map((row) => (
                <TableRow
                  key={row.company}
                  style={{
                    background: row.is_current
                      ? "var(--qc-blue-soft)"
                      : row.is_average
                      ? "var(--qc-surface-panel)"
                      : "var(--qc-surface-white)",
                    borderBottom: "1px solid var(--qc-border-inner)",
                  }}
                >
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      {row.is_current && (
                        <div className="w-0.5 h-4 rounded-full -ml-px shrink-0" style={{ background: "var(--qc-blue)" }} />
                      )}
                      <span
                        className="text-xs font-semibold"
                        style={{ color: row.is_current ? "var(--qc-blue)" : "var(--qc-text-heading)" }}
                      >
                        {row.company}
                      </span>
                      {row.is_current && (
                        <span
                          className="rounded-full text-[10px] font-semibold px-1.5 py-0.5 uppercase tracking-wide"
                          style={{ background: "var(--qc-blue-soft)", color: "var(--qc-blue)" }}
                        >
                          CURRENT
                        </span>
                      )}
                      {row.is_average && (
                        <span className="text-[10px] font-normal italic" style={{ color: "var(--qc-text-muted)" }}>(avg)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-xs py-2.5"
                    style={{ color: row.is_current ? "var(--qc-blue)" : "var(--qc-text-muted)", fontWeight: row.is_current ? 600 : 400 }}
                  >
                    {formatValue("revenue", row.revenue)}
                  </TableCell>
                  <TableCell className="text-xs py-2.5">
                    <span
                      className="flex items-center gap-0.5 font-semibold"
                      style={{ color: row.revenue_growth !== null ? "var(--qc-up)" : "var(--qc-text-muted)" }}
                    >
                      {row.revenue_growth !== null && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                      {formatValue("revenue_growth", row.revenue_growth)}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-xs py-2.5 font-semibold"
                    style={{ color: row.is_current ? "var(--qc-blue)" : "var(--qc-text-body)" }}
                  >
                    {formatValue("opm", row.opm)}
                  </TableCell>
                  <TableCell
                    className="text-xs py-2.5 font-semibold"
                    style={{ color: row.is_current ? "var(--qc-blue)" : "var(--qc-text-body)" }}
                  >
                    {formatValue("roce", row.roce)}
                  </TableCell>
                  <TableCell
                    className="text-xs py-2.5 font-semibold"
                    style={{ color: row.is_current ? "var(--qc-blue)" : "var(--qc-text-body)" }}
                  >
                    {formatValue("market_share", row.market_share)}
                  </TableCell>
                  <TableCell
                    className="text-xs py-2.5"
                    style={{ color: row.is_current ? "var(--qc-blue)" : "var(--qc-text-muted)", fontWeight: row.is_current ? 600 : 400 }}
                  >
                    {formatValue("debt_equity", row.debt_equity)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
