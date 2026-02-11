import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { NotablePattern } from "@/types/management";
import { Lightbulb } from "lucide-react";

interface NotablePatternsProps {
  patterns: NotablePattern[];
}

function getBorderColor(category: NotablePattern["category"]) {
  switch (category) {
    case "positive":
      return "border-green-500";
    case "neutral":
      return "border-blue-500";
    case "negative":
      return "border-red-500";
  }
}

export function NotablePatterns({ patterns }: NotablePatternsProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          NOTABLE PATTERNS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className={`border-l-4 pl-4 py-2 ${getBorderColor(pattern.category)}`}
          >
            <p className="text-sm leading-relaxed">{pattern.title}</p>
            {pattern.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {pattern.description}
              </p>
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-4 border-t">
          *Scoring Methodology: Hit Rate = (MET + Adj) / (MET + MISS + Adj). Confidence score is
          derived from a weighted average of historical guidance vs actuals over a rolling 3-year period.
        </p>
      </CardContent>
    </Card>
  );
}
