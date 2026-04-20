import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface ValuationCardProps {
  peRatio: number | null;
  forwardPE: number | null;
  pbRatio: number | null;
  evToEbitda: number | null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--qc-text-muted)] mb-0.5">{label}</p>
      <p className="text-[28px] font-normal leading-none text-[var(--qc-text-heading)]">{value}</p>
    </div>
  );
}

export function ValuationCard({ peRatio, forwardPE, pbRatio, evToEbitda }: ValuationCardProps) {
  return (
    <Card className="bg-[var(--qc-surface-white)] border border-[var(--qc-border-default)] rounded-[10px] shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[var(--qc-text-heading)]">
              Valuation
            </CardTitle>
            <p className="text-xs text-[var(--qc-text-muted)] mt-0.5">Multiples</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[var(--qc-text-muted)]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-normal leading-none text-[var(--qc-text-heading)]">
            {peRatio != null ? `${peRatio.toFixed(1)}x` : "—"}
          </span>
          <span className="text-sm text-[var(--qc-text-muted)]">P/E Ratio</span>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-[var(--qc-border-default)] pt-3">
          <Stat label="Forward P/E" value={forwardPE != null ? `${forwardPE.toFixed(1)}x` : "—"} />
          <Stat label="P/B Ratio" value={pbRatio != null ? `${pbRatio.toFixed(2)}x` : "—"} />
          <Stat label="EV/EBITDA" value={evToEbitda != null ? `${evToEbitda.toFixed(1)}x` : "—"} />
        </div>
      </CardContent>
    </Card>
  );
}
