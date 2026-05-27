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

interface PortfolioHoldingsTableProps {
  portfolio: WealthPortfolio;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const thStyle: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
  color: "var(--qc-ink-2)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

export function PortfolioHoldingsTable({ portfolio }: PortfolioHoldingsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        <div>
          <p style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Total Value
          </p>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--qc-ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            {formatCurrency(portfolio.total_value)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Risk Score
          </p>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--qc-ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            {portfolio.risk_score.toFixed(1)}
          </p>
        </div>
        {portfolio.last_rebalance_date && (
          <div>
            <p style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Last Rebalanced
            </p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}>
              {formatDate(portfolio.last_rebalance_date)}
            </p>
          </div>
        )}
      </div>

      {portfolio.holdings?.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={thStyle}>Symbol</TableHead>
              <TableHead className="text-right" style={thStyle}>Weight</TableHead>
              <TableHead className="text-right" style={thStyle}>Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(portfolio.holdings ?? []).map((holding, idx) => (
              <TableRow key={`${holding.symbol}-${idx}`}>
                <TableCell style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                  {holding.symbol}
                </TableCell>
                <TableCell className="text-right" style={{ fontSize: 12, color: "var(--qc-ink-2)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                  {(holding.weight * 100).toFixed(2)}%
                </TableCell>
                <TableCell className="text-right" style={{ fontSize: 12, color: "var(--qc-ink-2)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                  {holding.qty}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="py-4 text-center" style={{ fontSize: 13, color: "var(--qc-ink-2)" }}>
          No holdings recorded
        </p>
      )}
    </div>
  );
}
