import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface EfficiencyCardProps {
  ebitda: number | null;
  enterpriseValue: number | null;
  totalCash: number | null;
  totalDebt: number | null;
  grossMargins: number | null;
  operatingMargins: number | null;
  profitMargins: number | null;
  debtToEquity: number | null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function pct(v: number | null) {
  return v != null ? `${(v * 100).toFixed(1)}%` : "—";
}

export function EfficiencyCard({
  ebitda,
  enterpriseValue,
  totalCash,
  totalDebt,
  grossMargins,
  operatingMargins,
  profitMargins,
  debtToEquity,
}: EfficiencyCardProps) {
  const roce =
    ebitda != null && enterpriseValue != null && enterpriseValue !== 0
      ? (ebitda / enterpriseValue) * 100
      : null;

  const netDebtOverEbitda =
    totalDebt != null && totalCash != null && ebitda != null && ebitda !== 0
      ? (totalDebt - totalCash) / ebitda
      : null;

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Efficiency
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">Margins &amp; Capital</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            {roce != null ? `${roce.toFixed(1)}%` : "—"}
          </span>
          <span className="text-sm text-zinc-500">ROCE</span>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Stat label="Gross Margin" value={pct(grossMargins)} />
          <Stat label="Op. Margin" value={pct(operatingMargins)} />
          <Stat label="Net Margin" value={pct(profitMargins)} />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Stat
            label="Net Debt / EBITDA"
            value={netDebtOverEbitda != null ? `${netDebtOverEbitda.toFixed(1)}x` : "—"}
          />
          <Stat
            label="Debt / Equity"
            value={debtToEquity != null ? `${debtToEquity.toFixed(1)}x` : "—"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
