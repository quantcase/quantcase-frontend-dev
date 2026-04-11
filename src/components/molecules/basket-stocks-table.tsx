"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import type { BasketStock, Basket } from "@/types/screener";

// ── Column metadata ────────────────────────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: (v: number | null | undefined) => string;
}

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(1)}%`;
}

function cr(v: number | null | undefined): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L Cr`;
  if (Math.abs(v) >= 1_000) return `₹${(v / 1_000).toFixed(1)}K Cr`;
  return `₹${v.toFixed(0)} Cr`;
}

function num(v: number | null | undefined, dp = 1): string {
  if (v == null) return "—";
  return v.toFixed(dp);
}

const ALL_COLS: Record<string, ColDef> = {
  companyName:   { key: "companyName",   label: "Company",          align: "left" },
  symbol:        { key: "symbol",        label: "Symbol",           align: "left" },
  pe:            { key: "pe",            label: "P/E",              align: "right", format: (v) => num(v) },
  pb:            { key: "pb",            label: "P/B",              align: "right", format: (v) => num(v) },
  adjEps:        { key: "adjEps",        label: "Adj EPS",          align: "right", format: (v) => num(v) },
  epsGrowth:     { key: "epsGrowth",     label: "EPS Growth",       align: "right", format: pct },
  dividendYield: { key: "dividendYield", label: "Div Yield",        align: "right", format: pct },
  totalIncomeCr: { key: "totalIncomeCr", label: "Revenue",          align: "right", format: cr  },
  netProfitCr:   { key: "netProfitCr",   label: "Net Profit",       align: "right", format: cr  },
  marketCapCr:   { key: "marketCapCr",   label: "Mkt Cap",          align: "right", format: cr  },
  promoterPct:   { key: "promoterPct",   label: "Promoter %",       align: "right", format: pct },
  promoterChange:{ key: "promoterChange",label: "Promoter Δ",       align: "right", format: pct },
  roce:          { key: "roce",          label: "ROCE %",           align: "right", format: pct },
  roe:           { key: "roe",           label: "ROE %",            align: "right", format: pct },
  debtToEquity:  { key: "debtToEquity",  label: "D/E",              align: "right", format: (v) => num(v) },
  cagr3y:        { key: "cagr3y",        label: "3Y CAGR",          align: "right", format: pct },
  pbRatio:       { key: "pbRatio",       label: "P/B",              align: "right", format: (v) => num(v) },
  payoutRatio:   { key: "payoutRatio",   label: "Payout %",         align: "right", format: pct },
  priceToBook:   { key: "priceToBook",   label: "P/B",              align: "right", format: (v) => num(v) },
  evToEbitda:    { key: "evToEbitda",    label: "EV/EBITDA",        align: "right", format: (v) => num(v) },
  fcfYield:      { key: "fcfYield",      label: "FCF Yield",        align: "right", format: pct },
  revenueGrowth: { key: "revenueGrowth", label: "Rev Growth",       align: "right", format: pct },
};

function resolveColumns(columns: string[]): ColDef[] {
  // Always lead with company name
  const base: ColDef[] = [ALL_COLS.companyName];
  for (const col of columns) {
    if (col === "companyName") continue; // already added
    const def = ALL_COLS[col];
    if (def) base.push(def);
    else {
      // Unknown column — generic fallback
      base.push({
        key: col,
        label: col.replace(/([A-Z])/g, " $1").trim(),
        align: "right",
        format: (v) => num(v),
      });
    }
  }
  return base;
}

function cellValue(stock: BasketStock, col: ColDef): string {
  const raw = stock[col.key];
  if (col.format && (typeof raw === "number" || raw == null)) {
    return col.format(raw as number | null | undefined);
  }
  if (raw == null) return "—";
  return String(raw);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface BasketStocksTableProps {
  basket: Pick<Basket, "id" | "title" | "description" | "columns">;
  stocks: BasketStock[];
  latestQuarter?: string;
  pagination?: { page: number; size: number; total: number; pages: number };
  loading: boolean;
  error: string | null;
}

export function BasketStocksTable({
  basket,
  stocks,
  latestQuarter,
  pagination,
  loading,
  error,
}: BasketStocksTableProps) {
  const router = useRouter();
  const cols = resolveColumns(basket.columns);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      {/* Panel header */}
      <div className="flex items-center justify-between px-2 pt-1 pb-3">
        <div>
          <p
            className="text-[14px] font-semibold"
            style={{ color: "#0F172B", letterSpacing: "0.01em" }}
          >
            {basket.title}
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "#888888" }}>
            {basket.description}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {latestQuarter && (
            <span
              className="text-[10px] font-medium rounded-sm px-1.5 py-0.5"
              style={{ background: "#F5F5F5", color: "#90A1B9", border: "1px solid #E2E2E2" }}
            >
              {latestQuarter}
            </span>
          )}
          {pagination && (
            <span className="text-[12px] font-semibold" style={{ color: "#0F172B" }}>
              {pagination.total} stocks
            </span>
          )}
        </div>
      </div>

      {/* Table container */}
      <div
        className="rounded-[10px] bg-white overflow-hidden"
        style={{ border: "1px solid rgba(226,226,226,0.10)" }}
      >
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2" style={{ color: "#888888" }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading stocks…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-12 gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && stocks.length === 0 && (
          <p className="text-sm text-center py-10" style={{ color: "#888888" }}>
            No stocks matched this basket&apos;s criteria.
          </p>
        )}

        {!loading && !error && stocks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E2E2" }}>
                  {cols.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                      style={{ color: "#888888" }}
                    >
                      {col.label}
                    </th>
                  ))}
                  {/* action column */}
                  <th className="px-4 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, i) => (
                  <tr
                    key={stock.symbol}
                    onClick={() =>
                      router.push(`/screener/overview?symbol=${encodeURIComponent(stock.symbol)}`)
                    }
                    className="cursor-pointer hover:bg-[#F5F5F5] transition-colors group"
                    style={{
                      borderBottom: i < stocks.length - 1 ? "1px solid #E2E2E2" : undefined,
                    }}
                  >
                    {cols.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm whitespace-nowrap ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                        style={{
                          color: col.key === "companyName" ? "#0F172B" : "#888888",
                          fontWeight: col.key === "companyName" ? 500 : 400,
                        }}
                      >
                        {col.key === "symbol" ? (
                          <span className="font-mono text-[11px]">{cellValue(stock, col)}</span>
                        ) : (
                          cellValue(stock, col)
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 w-8">
                      <ArrowRight
                        className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "#0F172B" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
