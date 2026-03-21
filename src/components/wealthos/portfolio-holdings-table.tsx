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

export function PortfolioHoldingsTable({ portfolio }: PortfolioHoldingsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">Total Value</span>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(portfolio.total_value)}</p>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">Risk Score</span>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{portfolio.risk_score.toFixed(1)}</p>
        </div>
        {portfolio.last_rebalance_date && (
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">Last Rebalanced</span>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{formatDate(portfolio.last_rebalance_date)}</p>
          </div>
        )}
      </div>

      {portfolio.holdings?.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(portfolio.holdings ?? []).map((holding, idx) => (
              <TableRow key={`${holding.symbol}-${idx}`}>
                <TableCell className="font-medium">{holding.symbol}</TableCell>
                <TableCell className="text-right">{(holding.weight * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">{holding.qty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">No holdings recorded</p>
      )}
    </div>
  );
}
