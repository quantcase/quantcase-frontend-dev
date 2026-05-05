import type { FinancialRow, FinancialTable } from "@/types/financials";

function fmt(value: number | null | undefined, format?: string, key?: string): string {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${parseFloat(value.toFixed(1))}%`;
  if (key === "eps" || key === "otherIncome") {
    return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function FinancialDataTable({
  table,
  cashFlowMode = false,
}: {
  table: FinancialTable;
  cashFlowMode?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
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
          {table.rows.map((row: FinancialRow, idx: number) => {
            const isHighlighted = row.highlight;
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
                    color: isHighlighted ? "var(--qc-ink)" : "var(--qc-ink)",
                    padding: "8px 12px 8px 0",
                    whiteSpace: "nowrap",
                    background: rowBg,
                  }}
                >
                  {row.label}
                </td>
                {row.values.map((val, vi) => {
                  let cellColor = isHighlighted ? "var(--qc-ink)" : "var(--qc-ink)";
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
