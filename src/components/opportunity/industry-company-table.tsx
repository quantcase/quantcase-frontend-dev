"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IndustryCompanyRow } from "@/types/opportunity";

interface IndustryCompanyTableProps {
  rows: IndustryCompanyRow[];
}

function fmtCr(val: number | null | undefined): string {
  if (val == null) return "—";
  return `₹${val.toLocaleString("en-IN")} Cr`;
}

function str(val: string | number | null | undefined): string {
  if (val == null) return "—";
  return String(val);
}

function sentimentColor(s: string | null): string {
  if (!s) return "#888888";
  if (s === "bullish") return "#16a34a";
  if (s === "bearish") return "#dc2626";
  return "#888888";
}

function marginDelta(current: string | null, prior: string | null): string {
  if (!current || !prior) return "";
  const c = parseFloat(current);
  const p = parseFloat(prior);
  if (isNaN(c) || isNaN(p)) return "";
  const delta = c - p;
  const sign = delta >= 0 ? "+" : "";
  return ` (${sign}${delta.toFixed(1)}pp)`;
}

function receivableDelta(current: string | number | null, prior: string | number | null): string {
  const c = Number(current);
  const p = Number(prior);
  if (isNaN(c) || isNaN(p)) return "";
  const delta = c - p;
  const sign = delta >= 0 ? "+" : "";
  return ` (${sign}${delta}d)`;
}

export function IndustryCompanyTable({ rows }: IndustryCompanyTableProps) {
  if (!rows.length) {
    return <div className="text-center text-xs text-zinc-400 py-6">No company data available.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#E2E2E2]">
      <Table>
        <TableHeader>
          <TableRow style={{ background: "#FAFAFA", borderBottom: "1px solid #E2E2E2" }}>
            {[
              "Company", "Mkt Cap", "Revenue", "Rev YoY", "OPM (Curr)", "OPM (Prior)",
              "DSO Δ", "Inv Days", "ROCE", "Capex", "Sentiment", "QoQ",
            ].map((h) => (
              <TableHead
                key={h}
                style={{
                  fontSize: 10, fontWeight: 500, color: "#888888",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  whiteSpace: "nowrap", padding: "8px 12px",
                }}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => {
            const revGrowth = row.revenue_growth_yoy;
            const revColor = revGrowth
              ? revGrowth.startsWith("-") ? "#dc2626" : "#16a34a"
              : "#121212";

            return (
              <TableRow
                key={row.company}
                style={{ background: idx % 2 === 0 ? "#ffffff" : "#fafafa" }}
              >
                <TableCell style={{ padding: "8px 12px", fontWeight: 600, fontSize: 13, color: "#0F172B", whiteSpace: "nowrap" }}>
                  {row.company}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, color: "#121212", whiteSpace: "nowrap" }}>
                  {fmtCr(row.market_cap_cr)}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, color: "#121212", whiteSpace: "nowrap" }}>
                  {fmtCr(row.revenue_latest_cr)}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: revColor, whiteSpace: "nowrap" }}>
                  {str(revGrowth)}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, color: "#121212", whiteSpace: "nowrap" }}>
                  {str(row.operating_margin_current)}
                  {marginDelta(row.operating_margin_current, row.operating_margin_prior) && (
                    <span style={{ fontSize: 10, color: parseFloat(String(row.operating_margin_current)) >= parseFloat(String(row.operating_margin_prior)) ? "#16a34a" : "#dc2626" }}>
                      {marginDelta(row.operating_margin_current, row.operating_margin_prior)}
                    </span>
                  )}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, color: "#888888", whiteSpace: "nowrap" }}>
                  {str(row.operating_margin_prior)}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap" }}>
                  <span style={{ color: "#121212" }}>{str(row.receivable_days_current)}d</span>
                  {receivableDelta(row.receivable_days_current, row.receivable_days_prior) && (
                    <span style={{ fontSize: 10, color: Number(row.receivable_days_current) <= Number(row.receivable_days_prior) ? "#16a34a" : "#dc2626" }}>
                      {receivableDelta(row.receivable_days_current, row.receivable_days_prior)}
                    </span>
                  )}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, color: "#121212", whiteSpace: "nowrap" }}>
                  {str(row.inventory_days_current)}
                  {row.inventory_days_current !== null && row.inventory_days_current !== undefined && !String(row.inventory_days_current).includes("d") ? "d" : ""}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#0F172B", whiteSpace: "nowrap" }}>
                  {str(row.roce)}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap" }}>
                  {row.capex_trend === "rising" ? (
                    <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 600 }}>↑ Rising</span>
                  ) : row.capex_trend === "falling" ? (
                    <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 600 }}>↓ Falling</span>
                  ) : (
                    <span style={{ color: "#888888", fontSize: 11 }}>{str(row.capex_trend)}</span>
                  )}
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 11, whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 600, color: sentimentColor(row.sentiment), textTransform: "capitalize" }}>
                    {str(row.sentiment)}
                  </span>
                </TableCell>
                <TableCell style={{ padding: "8px 12px", fontSize: 11, color: "#888888", whiteSpace: "nowrap", maxWidth: 160 }}>
                  {str(row.qoq_acceleration)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
