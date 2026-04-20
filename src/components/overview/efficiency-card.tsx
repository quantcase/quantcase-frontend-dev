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
      <p className="text-xs text-[var(--qc-text-muted)] mb-0.5">{label}</p>
      <p className="text-lg font-bold text-[var(--qc-text-heading)]">{value}</p>
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
    <Card className="bg-[var(--qc-surface-white)] border border-[var(--qc-border-default)] rounded-[10px] shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[var(--qc-text-heading)]">
              Efficiency
            </CardTitle>
            <p className="text-xs text-[var(--qc-text-muted)] mt-0.5">Margins &amp; Capital</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[var(--qc-text-muted)]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-[var(--qc-text-heading)]">
            {roce != null ? `${roce.toFixed(1)}%` : "—"}
          </span>
          <span className="text-sm text-[var(--qc-text-muted)]">ROCE</span>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-[var(--qc-border-default)] pt-3">
          <Stat label="Gross Margin" value={pct(grossMargins)} />
          <Stat label="Op. Margin" value={pct(operatingMargins)} />
          <Stat label="Net Margin" value={pct(profitMargins)} />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-[var(--qc-border-default)] pt-3">
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
