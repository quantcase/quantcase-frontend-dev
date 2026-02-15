import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataValue } from "@/components/molecules/data-value";
import type { NotablePattern } from "@/types/management";
import { Lightbulb } from "lucide-react";

interface NotablePatternsProps {
  patterns: NotablePattern[];
}

function getBorderColor(category: NotablePattern["category"]) {
  switch (category) {
    case "positive":
      return "border-l-yellow-500 dark:border-l-yellow-400";
    case "neutral":
      return "border-l-yellow-500 dark:border-l-yellow-400";
    case "negative":
      return "border-l-yellow-500 dark:border-l-yellow-400";
  }
}

export function NotablePatterns({ patterns }: NotablePatternsProps) {
  return (
    <Card className="h-fit bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
          <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          NOTABLE PATTERNS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.length === 0 ? (
          <div className="border-l-4 border-l-yellow-500 dark:border-l-yellow-400 pl-3 py-2">
            <p className="text-sm text-red-600 dark:text-red-400">No patterns available</p>
          </div>
        ) : (
          patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`border-l-4 ${getBorderColor(pattern.category)} pl-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-r-md`}
            >
              <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-50">
                <DataValue value={pattern.title} />
              </p>
              {pattern.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  <DataValue value={pattern.description} />
                </p>
              )}
            </div>
          ))
        )}
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-800 leading-relaxed">
          *Scoring Methodology: Hit Rate = (MET + Adj) / (MET + MISS + Adj). Consistency score is
          derived from a weighted average of historical guidance vs actuals over a rolling 3-year period.
        </p>
      </CardContent>
    </Card>
  );
}
