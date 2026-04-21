import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import type { GovernanceSignal } from "@/types/management";

interface ThesisPoint {
  title: string;
  description: string;
}

interface KeyThesisCardProps {
  governanceSignals?: GovernanceSignal[];
  opportunityTakeaway?: string | null;
}

export function KeyThesisCard({ governanceSignals, opportunityTakeaway }: KeyThesisCardProps) {
  const thesisPoints: ThesisPoint[] = [];

  if (governanceSignals && governanceSignals.length > 0) {
    const positiveSignals = governanceSignals.filter((s) => s.isPositive).slice(0, 2);
    for (const signal of positiveSignals) {
      thesisPoints.push({ title: "Governance Signal", description: signal.text });
    }
  }

  if (opportunityTakeaway) {
    thesisPoints.push({ title: "Opportunity Outlook", description: opportunityTakeaway });
  }

  const hasData = thesisPoints.length > 0;

  return (
    <Card className="bg-[var(--qc-surface-white)] border border-[var(--qc-border-default)] rounded-[10px] shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-[var(--qc-text-heading)]">
            Key Thesis
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-[var(--qc-text-muted)]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasData && (
          <p className="text-xs text-[var(--qc-text-muted)]">No analysis available yet.</p>
        )}
        {thesisPoints.map((point, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--qc-surface-panel)] text-xs font-bold text-[var(--qc-text-muted)]">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--qc-text-heading)]">{point.title}</p>
              <p className="text-xs text-[var(--qc-text-muted)] mt-0.5">{point.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
