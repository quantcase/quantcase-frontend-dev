"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  type TooltipProps,
} from "recharts";
import type { FinancialTable } from "@/types/financials";

// Exact row keys returned by the backend API
const ROW_KEYS = {
  revenue:         "revenue",
  expenses:        "expenses",
  interest:        "interest",
  operatingProfit: "operatingProfit",
  netProfit:       "netProfit",
} as const;

function getRow(table: FinancialTable, key: string): (number | null)[] {
  return table.rows.find((r) => r.key === key)?.values ?? table.periods.map(() => null);
}

function fmtCr(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${Math.round(Math.abs(val)).toLocaleString("en-IN")} Cr`;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E2E2",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
      minWidth: 180,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 600, color: "#0F172B", marginBottom: 6 }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "#888888", marginBottom: 3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color as string, display: "inline-block", flexShrink: 0 }} />
            {entry.name}:
          </span>
          <span style={{ fontWeight: 600, color: "#0F172B" }}>{fmtCr(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function PnLChart({ table }: { table: FinancialTable }) {
  const periods = table.periods;

  const revenueVals   = getRow(table, ROW_KEYS.revenue);
  const expenseVals   = getRow(table, ROW_KEYS.expenses);
  const interestVals  = getRow(table, ROW_KEYS.interest);
  const opProfitVals  = getRow(table, ROW_KEYS.operatingProfit);
  const netProfitVals = getRow(table, ROW_KEYS.netProfit);

  const chartData = periods.map((period, i) => ({
    period,
    // Revenue: positive → bar grows upward from 0
    revenue: revenueVals[i] as number | null,
    // Expenses (excl. interest): negative → bar grows downward from 0
    expenses: expenseVals[i] != null ? -((expenseVals[i] as number) - (interestVals[i] ?? 0)) : null,
    // Interest: negative → stacked below expenses
    interest: interestVals[i] != null ? -(interestVals[i] as number) : null,
    // Lines at actual positive values (~operating profit, net profit)
    operatingProfit: opProfitVals[i]  as number | null,
    netProfit:       netProfitVals[i] as number | null,
  }));

  // Y-axis domain: symmetric enough to show both positive bars and negative expense bars
  const posVals = chartData.map((d) => d.revenue).filter((v): v is number => v != null);
  const negVals = chartData.flatMap((d) => [d.expenses, d.interest]).filter((v): v is number => v != null);
  const dataMax = posVals.length ? Math.max(...posVals) : 3000;
  const dataMin = negVals.length ? Math.min(...negVals) : -3000;
  const pad = Math.max(Math.abs(dataMax), Math.abs(dataMin)) * 0.15;
  const yMax = Math.ceil((dataMax + pad) / 500) * 500;
  const yMin = Math.floor((dataMin - pad) / 500) * 500;

  const yFmt = (val: number) => {
    const abs = Math.abs(val);
    if (abs >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return `${Math.round(val)}`;
  };

  // barGap={-barSize} makes the negative stack overlap the positive stack at the same x position
  const barSize = 48;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={chartData}
        margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
        barCategoryGap="20%"
        barGap={-barSize}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E2E2" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11, fill: "#888888", fontFamily: "var(--font-ibm-plex-sans, sans-serif)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={yFmt}
          tick={{ fontSize: 11, fill: "#888888", fontFamily: "var(--font-ibm-plex-sans, sans-serif)" }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          content={() => (
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: "12px 20px", paddingTop: 12, fontSize: 12, fontFamily: "var(--font-ibm-plex-sans, sans-serif)" }}>
              {[
                { color: "#93c5fd", label: "Revenue",          line: false },
                { color: "#fca5a5", label: "Expenses",         line: false },
                { color: "#f87171", label: "Interest",         line: false },
                { color: "#0F172B", label: "Operating Profit", line: true, dash: "6 4" },
                { color: "#6b7280", label: "Net Profit",       line: true, dash: "8 5" },
              ].map(({ color, label, line, dash }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, color: "#0F172B" }}>
                  {line ? (
                    <svg width="24" height="12">
                      <line x1="0" y1="6" x2="24" y2="6" stroke={color} strokeWidth="2" strokeDasharray={dash} />
                      <circle cx="12" cy="6" r="3" fill={color} />
                    </svg>
                  ) : (
                    <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: "inline-block" }} />
                  )}
                  {label}
                </span>
              ))}
            </div>
          )}
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />

        {/* Revenue: positive stack — grows up from 0 */}
        <Bar dataKey="revenue" name="Revenue" stackId="pos" fill="#93c5fd" barSize={barSize} />

        {/* Expenses + Interest: negative stack — grows down from 0, overlaid at same x via barGap={-barSize} */}
        <Bar dataKey="expenses" name="Expenses" stackId="neg" fill="#fca5a5" barSize={barSize} />
        <Bar dataKey="interest" name="Interest" stackId="neg" fill="#f87171" barSize={barSize} />

        {/* Profit lines overlaid at their actual values */}
        <Line
          dataKey="operatingProfit"
          name="Operating Profit"
          type="monotone"
          stroke="#0F172B"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 3, fill: "#0F172B", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        <Line
          dataKey="netProfit"
          name="Net Profit"
          type="monotone"
          stroke="#6b7280"
          strokeWidth={2}
          strokeDasharray="8 5"
          dot={{ r: 3, fill: "#6b7280", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
