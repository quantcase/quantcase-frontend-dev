import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataValue } from "@/components/molecules/data-value";
import type { NotablePattern } from "@/types/management";
import { Lightbulb } from "lucide-react";

interface NotablePatternsProps {
  patterns: NotablePattern[];
}

function getCategoryStyles(category: NotablePattern["category"]) {
  switch (category) {
    case "positive":
      return {
        border: "border-l-green-500 dark:border-l-green-400",
        bg: "bg-green-50 dark:bg-green-950/30",
        text: "text-green-700 dark:text-green-400",
        badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
      };
    case "neutral":
      return {
        border: "border-l-yellow-500 dark:border-l-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        text: "text-yellow-700 dark:text-yellow-400",
        badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"
      };
    case "negative":
      return {
        border: "border-l-red-500 dark:border-l-red-400",
        bg: "bg-red-50 dark:bg-red-950/30",
        text: "text-red-700 dark:text-red-400",
        badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
      };
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
          patterns.map((pattern) => {
            const styles = getCategoryStyles(pattern.category);
            return (
              <div
                key={pattern.id}
                className={`border-l-4 ${styles.border} ${styles.bg} pl-3 py-2 rounded-r-md transition-all hover:shadow-sm`}
              >
                <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-50">
                  <DataValue value={pattern.title} />
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded ${styles.badge}`}>
                    <DataValue value={pattern.category} />
                  </span>
                </div>
              </div>
            );
          })
        )}
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-800 leading-relaxed">
          *Scoring Methodology: Hit Rate = (MET + Adj) / (MET + MISS + Adj). Consistency score is
          derived from a weighted average of historical guidance vs actuals over a rolling 3-year period.
        </p>
      </CardContent>
    </Card>
  );
}
