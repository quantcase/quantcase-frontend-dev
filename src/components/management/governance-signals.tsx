import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataValue } from "@/components/molecules/data-value";
import { CheckCircle2 } from "lucide-react";
import type { GovernanceSignal } from "@/types/management";

interface GovernanceSignalsProps {
  signals: GovernanceSignal[];
}

export function GovernanceSignals({ signals }: GovernanceSignalsProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
          GOVERNANCE SIGNALS & EVIDENCE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.length === 0 ? (
            <div className="flex items-start gap-2">
              <span className="text-sm text-red-600 dark:text-red-400">No signals available</span>
            </div>
          ) : (
            signals.map((signal) => (
              <div
                key={signal.id}
                className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-1"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-light text-zinc-700 dark:text-zinc-300 leading-relaxed pt-0.5">
                  <DataValue value={signal.text} />
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
