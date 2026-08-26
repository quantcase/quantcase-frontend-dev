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
import { QC, SEQUENTIAL } from "@/lib/chart-tokens";

const ROW_KEYS = {
  revenue:         ["REV_OP", "SALES_BFSI", "T_INC_CON_OPR_BFSI"],
  expenses:        ["TOTAL_OPEX", "BFSI_OPEX"],
  interest:        ["FIN_COST"],
  operatingProfit: ["OP_PROFIT", "FINANCING_PROFIT"],
  netProfit:       ["PAT", "NET_PNL_AFTR_SHAREPNL_ASST_BFSI"],
} as const;

function getRow(table: FinancialTable, keys: readonly string[]): (number | null)[] {
  return table.rows.find((r) => keys.includes(r.key))?.values ?? table.periods.map(() => null);
}

function fmtCr(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${Math.round(Math.abs(val)).toLocaleString("en-IN")} Cr`;
}

// Maps to --qc-* tokens via chart-tokens (SVG fill accepts var(--qc-*))
const COLORS = {
  revenue:  SEQUENTIAL[0],  // decorative: primary revenue bar
  expenses: SEQUENTIAL[1],  // decorative: expenses bar
  interest: QC.down,        // interest is a cost drag
  opProfit: QC.limeEdge,    // operating profit line
  netProfit:QC.goldenInk,   // net profit secondary line
};

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "'IBM Plex Mono', monospace",
      minWidth: 180,
      boxShadow: "0 4px 16px rgba(14,14,12,0.08)",
    }}>
      <div style={{ fontWeight: 600, color: "var(--qc-ink)", marginBottom: 8, fontFamily: "inherit" }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "var(--qc-ink)", marginBottom: 3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color as string, display: "inline-block", flexShrink: 0 }} />
            {entry.name}:
          </span>
          <span style={{ fontWeight: 600, color: "var(--qc-ink)" }}>{fmtCr(entry.value)}</span>
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
    revenue: revenueVals[i] as number | null,
    expenses: expenseVals[i] != null ? -((expenseVals[i] as number) - (interestVals[i] ?? 0)) : null,
    interest: interestVals[i] != null ? -(interestVals[i] as number) : null,
    operatingProfit: opProfitVals[i]  as number | null,
    netProfit:       netProfitVals[i] as number | null,
  }));

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

  const barSize = 48;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={chartData}
        margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
        barCategoryGap="20%"
        barGap={-barSize}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair-2)" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 10, fill: "var(--qc-ink-2)", fontFamily: "'IBM Plex Mono', monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={yFmt}
          tick={{ fontSize: 10, fill: "var(--qc-ink-2)", fontFamily: "'IBM Plex Mono', monospace" }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          content={() => (
            <div style={{
              display: "flex", flexDirection: "row", flexWrap: "wrap",
              justifyContent: "center", gap: "10px 20px", paddingTop: 12,
              fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
              color: "var(--qc-ink)",
            }}>
              {[
                { color: COLORS.revenue,  label: "Revenue",          line: false },
                { color: COLORS.expenses, label: "Expenses",         line: false },
                { color: COLORS.interest, label: "Interest",         line: false },
                { color: COLORS.opProfit, label: "Operating Profit", line: true, dash: "6 4" },
                { color: COLORS.netProfit,label: "Net Profit",       line: true, dash: "8 5" },
              ].map(({ color, label, line, dash }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {line ? (
                    <svg width="22" height="10">
                      <line x1="0" y1="5" x2="22" y2="5" stroke={color} strokeWidth="2" strokeDasharray={dash} />
                      <circle cx="11" cy="5" r="2.5" fill={color} />
                    </svg>
                  ) : (
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
                  )}
                  {label}
                </span>
              ))}
            </div>
          )}
        />
        <ReferenceLine y={0} stroke="var(--qc-hair)" strokeWidth={1} />

        <Bar dataKey="revenue"  name="Revenue"  stackId="pos" fill={COLORS.revenue}  barSize={barSize} />
        <Bar dataKey="expenses" name="Expenses" stackId="neg" fill={COLORS.expenses} barSize={barSize} />
        <Bar dataKey="interest" name="Interest" stackId="neg" fill={COLORS.interest} barSize={barSize} />

        <Line
          dataKey="operatingProfit"
          name="Operating Profit"
          type="monotone"
          stroke={COLORS.opProfit}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 3, fill: COLORS.opProfit, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        <Line
          dataKey="netProfit"
          name="Net Profit"
          type="monotone"
          stroke={COLORS.netProfit}
          strokeWidth={2}
          strokeDasharray="8 5"
          dot={{ r: 3, fill: COLORS.netProfit, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
