import type { FinancialRow, FinancialTable } from "@/types/financials";

function fmt(value: number | null | undefined, format?: string): string {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${parseFloat(value.toFixed(1))}%`;
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
              className="sticky left-0 bg-white"
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#888888",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "8px 12px 8px 0",
                whiteSpace: "nowrap",
                minWidth: 160,
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
                  color: "#888888",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                  textAlign: "right",
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
            return (
              <tr
                key={row.key}
                style={{
                  background: isHighlighted ? "#F5F5F5" : idx % 2 === 0 ? "#ffffff" : "#fafafa",
                  borderTop: isHighlighted ? "1px solid #E2E2E2" : "1px solid transparent",
                }}
              >
                <td
                  className="sticky left-0"
                  style={{
                    fontSize: 13,
                    fontWeight: isHighlighted ? 600 : 400,
                    color: isHighlighted ? "#0F172B" : "#888888",
                    padding: "8px 12px 8px 0",
                    whiteSpace: "nowrap",
                    background: isHighlighted ? "#F5F5F5" : idx % 2 === 0 ? "#ffffff" : "#fafafa",
                  }}
                >
                  {row.label}
                </td>
                {row.values.map((val, vi) => {
                  let cellColor = isHighlighted ? "#0F172B" : "#121212";
                  if (cashFlowMode && val !== null && val !== undefined) {
                    cellColor = val >= 0 ? "#16a34a" : "#dc2626";
                  }
                  return (
                    <td
                      key={vi}
                      style={{
                        fontSize: 13,
                        fontWeight: isHighlighted ? 600 : 400,
                        color: val === null || val === undefined ? "#888888" : cellColor,
                        padding: "8px 12px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmt(val, row.format)}
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
