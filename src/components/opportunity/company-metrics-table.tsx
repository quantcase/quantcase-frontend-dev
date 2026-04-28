"use client";

import type { IndustryCompanyRow, IndustryAnalysis } from "@/types/opportunity";

interface CompanyMetricsTableProps {
  data?: IndustryAnalysis;
  period?: string;
}

type CellValue = string | number | null | undefined;

type CellKey =
  | "market_cap_cr"
  | "revenue_latest_cr"
  | "revenue_growth_yoy"
  | "revenue_cagr_3y"
  | "operating_margin_current"
  | "operating_margin_prior"
  | "receivable_days_current"
  | "receivable_days_prior"
  | "inventory_days_current"
  | "roce"
  | "sentiment"
  | "capex_trend"
  | "qoq_acceleration";

/** Columns that contain prose/multi-line content — rendered in a constrained wrapping cell */
const WRAP_KEYS: Set<CellKey> = new Set([
  "operating_margin_current",
  "operating_margin_prior",
  "capex_trend",
  "qoq_acceleration",
]);

function formatValue(val: CellValue): string {
  if (val === null || val === undefined) return "—";
  return String(val);
}

function changeColor(val: CellValue): string {
  if (val === null || val === undefined) return "var(--qc-text-muted)";
  const s = String(val).trim();
  if (s.startsWith("+") || s.startsWith("▲")) return "#059669";
  if (s.startsWith("-") || s.startsWith("▼")) return "#dc2626";
  return "var(--qc-text-muted)";
}

function sentimentBadge(sentiment: string | null | undefined) {
  if (!sentiment || sentiment === "—") return <span style={{ color: "var(--qc-text-muted)" }}>—</span>;
  const s = sentiment.toLowerCase();
  const isPos = s === "positive" || s === "bullish";
  const isNeg = s === "negative" || s === "bearish";
  const color = isPos ? "#059669" : isNeg ? "#dc2626" : "#D97706";
  const bg = isPos ? "rgba(5,150,105,0.08)" : isNeg ? "rgba(220,38,38,0.08)" : "rgba(217,119,6,0.08)";
  const label = isPos ? "▲" : isNeg ? "▼" : "→";
  return (
    <span
      className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap"
      style={{ color, backgroundColor: bg }}
    >
      {label}&nbsp;{sentiment.charAt(0).toUpperCase() + sentiment.slice(1).toLowerCase()}
    </span>
  );
}

interface ColDef {
  key: CellKey;
  header: string;
  align: "right" | "left";
  /** px width for the <th>/<td> */
  width: number;
}

const COLUMNS: ColDef[] = [
  { key: "market_cap_cr",             header: "Mkt Cap (Cr)",   align: "right", width: 110 },
  { key: "revenue_latest_cr",         header: "Revenue (Cr)",   align: "right", width: 110 },
  { key: "sentiment",                 header: "Sentiment",      align: "left",  width: 110 },
  { key: "revenue_growth_yoy",        header: "Rev YoY",        align: "right", width: 90  },
  { key: "revenue_cagr_3y",           header: "Rev CAGR 3Y",    align: "right", width: 100 },
  { key: "operating_margin_current",  header: "OPM (Current)",  align: "left",  width: 180 },
  { key: "operating_margin_prior",    header: "OPM (Prior)",    align: "left",  width: 180 },
  { key: "receivable_days_current",   header: "Rec. Days",      align: "right", width: 90  },
  { key: "receivable_days_prior",     header: "Rec. Days Prior",align: "right", width: 110 },
  { key: "inventory_days_current",    header: "Inv. Days",      align: "right", width: 90  },
  { key: "roce",                      header: "ROCE",           align: "right", width: 90  },
  { key: "capex_trend",               header: "Capex Trend",    align: "left",  width: 160 },
  { key: "qoq_acceleration",          header: "QoQ Accel.",     align: "left",  width: 160 },
];

function isAvgRow(row: IndustryCompanyRow): boolean {
  const name = row.company?.toLowerCase() ?? "";
  return name.includes("avg") || name.includes("wild") || name.includes("industry");
}

function CellContent({ col, val }: { col: ColDef; val: CellValue }) {
  if (col.key === "sentiment") {
    return sentimentBadge(val == null ? null : String(val));
  }

  const text = formatValue(val);

  if (WRAP_KEYS.has(col.key)) {
    return (
      <span
        style={{
          display: "block",
          whiteSpace: "pre-line",
          lineHeight: 1.45,
          color: "var(--qc-text-muted)",
          fontSize: 11,
        }}
      >
        {text}
      </span>
    );
  }

  const numeric = col.align === "right";
  return (
    <span
      className="whitespace-nowrap"
      style={{ color: numeric ? changeColor(val) : "#121212" }}
    >
      {text}
    </span>
  );
}

export function CompanyMetricsTable({ data, period }: CompanyMetricsTableProps) {
  if (!data?.company_table || data.company_table.length === 0) return null;

  const rows = data.company_table;

  // Only show columns that have at least one non-null/non-empty value
  const activeColumns = COLUMNS.filter((col) =>
    rows.some((r) => {
      const v = r[col.key] as CellValue;
      return v !== null && v !== undefined && String(v).trim() !== "";
    })
  );

  const bodyRows = rows.filter((r) => !isAvgRow(r));
  const avgRows  = rows.filter((r) => isAvgRow(r));

  const COMPANY_COL_WIDTH = 150;
  const tableMinWidth =
    COMPANY_COL_WIDTH + activeColumns.reduce((sum, c) => sum + c.width, 0);

  return (
    <div className="space-y-3">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--qc-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          Company-by-Company Metrics{period ? ` · ${period}` : ""}
        </p>
        <div className="flex-1 h-px bg-[#E2E2E2]" />
      </div>

      {/* Scrollable wrapper */}
      <div
        className="rounded-lg border border-[#E2E2E2] bg-white"
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <table
          style={{
            minWidth: tableMinWidth,
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E2E2", backgroundColor: "#F9F9F9" }}>
              {/* Sticky company column */}
              <th
                style={{
                  width: COMPANY_COL_WIDTH,
                  minWidth: COMPANY_COL_WIDTH,
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--qc-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#F9F9F9",
                  zIndex: 1,
                  borderRight: "1px solid #E2E2E2",
                }}
              >
                Company
              </th>

              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    padding: "10px 12px",
                    textAlign: col.align,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--qc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {bodyRows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: idx < bodyRows.length - 1 ? "1px solid #F0F0F0" : undefined,
                  backgroundColor: row.is_current ? "rgba(15,23,43,0.03)" : "transparent",
                }}
              >
                {/* Sticky company name */}
                <td
                  style={{
                    padding: "10px 12px",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    fontWeight: row.is_current ? 600 : 400,
                    color: row.is_current ? "var(--qc-text-heading)" : "#121212",
                    position: "sticky",
                    left: 0,
                    backgroundColor: row.is_current ? "rgba(15,23,43,0.03)" : "#ffffff",
                    zIndex: 1,
                    borderRight: "1px solid #E2E2E2",
                  }}
                >
                  {row.company}
                  {row.is_current && (
                    <span
                      className="ml-1.5 inline-block rounded-sm px-1 py-0.5 text-[9px] font-semibold"
                      style={{ color: "var(--qc-text-heading)", backgroundColor: "rgba(15,23,43,0.08)" }}
                    >
                      YOU
                    </span>
                  )}
                </td>

                {activeColumns.map((col) => {
                  const val = row[col.key] as CellValue;
                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: "10px 12px",
                        textAlign: col.align,
                        verticalAlign: "top",
                        fontSize: 12,
                      }}
                    >
                      <CellContent col={col} val={val} />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Industry average row(s) */}
            {avgRows.map((row, idx) => (
              <tr
                key={`avg-${idx}`}
                style={{
                  borderTop: "2px solid #E2E2E2",
                  backgroundColor: "var(--qc-surface-panel)",
                }}
              >
                <td
                  style={{
                    padding: "10px 12px",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--qc-text-heading)",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "var(--qc-surface-panel)",
                    zIndex: 1,
                    borderRight: "1px solid #E2E2E2",
                  }}
                >
                  {row.company}
                </td>
                {activeColumns.map((col) => {
                  const val = row[col.key] as CellValue;
                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: "10px 12px",
                        textAlign: col.align,
                        verticalAlign: "top",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      <CellContent col={col} val={val} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
