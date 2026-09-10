import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { WealthPortfolio } from "@/types/wealthos";
import { AlertCircle } from "lucide-react";

interface PortfolioHoldingsTableProps {
  portfolio: WealthPortfolio;
}

const thStyle: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
  color: "var(--qc-ink-2)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

export function PortfolioHoldingsTable({ portfolio }: PortfolioHoldingsTableProps) {
  const totalVal = portfolio.total_value_cr ?? portfolio.total_value ?? 0;
  const holdings = portfolio.holdings || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-8 pb-3 border-b border-hair">
        <div>
          <p style={thStyle}>Total Portfolio Value</p>
          <p className="text-xl font-bold font-mono text-ink mt-0.5">
            ₹{totalVal} Cr
          </p>
        </div>
        {portfolio.risk_score != null && (
          <div>
            <p style={thStyle}>Portfolio Risk Score</p>
            <p className="text-xl font-bold font-mono text-ink mt-0.5">
              {portfolio.risk_score.toFixed(1)} / 10
            </p>
          </div>
        )}
        {portfolio.last_rebalance_date && (
          <div>
            <p style={thStyle}>Last Rebalanced</p>
            <p className="text-sm font-medium text-ink mt-1">
              {formatDate(portfolio.last_rebalance_date)}
            </p>
          </div>
        )}
      </div>

      {holdings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={thStyle}>Asset / Instrument</TableHead>
              <TableHead style={thStyle}>Class</TableHead>
              <TableHead className="text-right" style={thStyle}>Weight (%)</TableHead>
              <TableHead className="text-right" style={thStyle}>Current Value</TableHead>
              <TableHead className="text-right" style={thStyle}>Qty / Units</TableHead>
              <TableHead style={thStyle}>Health / Alerts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((h, idx) => {
              const label = h.ticker || h.scheme_name || h.symbol || "Asset";
              const weight = h.weight_pct != null
                ? `${h.weight_pct}%`
                : h.weight != null
                ? `${(h.weight * 100).toFixed(1)}%`
                : "—";
              const val = h.current_value_cr != null ? `₹${h.current_value_cr} Cr` : "—";
              const qty = h.quantity ?? h.qty ?? "—";
              const alerts = h.alerts || [];

              return (
                <TableRow key={h.id || idx}>
                  <TableCell className="font-mono font-semibold text-ink text-xs">
                    {label}
                    {h.isin && <span className="block text-[10px] text-ink-3 font-normal">{h.isin}</span>}
                  </TableCell>
                  <TableCell className="capitalize text-xs text-ink-2">
                    {h.asset_class?.replace(/_/g, " ") || "Equity"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-ink">
                    {weight}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-ink">
                    {val}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-ink-2">
                    {qty}
                  </TableCell>
                  <TableCell>
                    {alerts.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-down text-xs font-medium">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{alerts[0].message || alerts[0].alert_type}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-up">Normal</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="py-8 text-center text-xs text-ink-2">
          No holdings recorded for this client.
        </p>
      )}
    </div>
  );
}
