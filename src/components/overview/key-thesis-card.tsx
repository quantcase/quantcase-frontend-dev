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

  // Add positive governance signals (up to 2)
  if (governanceSignals && governanceSignals.length > 0) {
    const positiveSignals = governanceSignals.filter((s) => s.isPositive).slice(0, 2);
    for (const signal of positiveSignals) {
      thesisPoints.push({ title: "Governance Signal", description: signal.text });
    }
  }

  // Add opportunity overall takeaway
  if (opportunityTakeaway) {
    thesisPoints.push({ title: "Opportunity Outlook", description: opportunityTakeaway });
  }

  const hasData = thesisPoints.length > 0;

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Key Thesis
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-zinc-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasData && (
          <p className="text-xs text-zinc-500">No analysis available yet.</p>
        )}
        {thesisPoints.map((point, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{point.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">{point.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
