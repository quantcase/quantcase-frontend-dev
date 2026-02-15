import { Card, CardContent } from "@/components/ui/card";
import { DataValue } from "@/components/molecules/data-value";
import type { FactorScore, TrustLevel } from "@/types/management";
import { Target, Shield, Briefcase } from "lucide-react";

interface ScoreOverviewCardsProps {
  scores: FactorScore[];
}

const iconMap = {
  "Guidance Accuracy": Target,
  "Disclosure Honesty": Shield,
  "Capital Allocation": Briefcase,
};

const iconColorMap = {
  "Guidance Accuracy": "text-green-600 dark:text-green-400",
  "Disclosure Honesty": "text-blue-600 dark:text-blue-400",
  "Capital Allocation": "text-purple-600 dark:text-purple-400",
};

function getRatingDisplay(rating: TrustLevel | string): string {
  if (!rating || rating === "N/A") return "N/A";
  // Convert MODERATE to Good
  if (rating === "MODERATE") return "Good";
  // Capitalize first letter
  return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase();
}

export function ScoreOverviewCards({ scores }: ScoreOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {scores.map((score) => {
        const Icon = iconMap[score.factor];
        const iconColor = iconColorMap[score.factor];
        const ratingDisplay = getRatingDisplay(score.rating);

        return (
          <Card key={score.factor} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${iconColor.includes('green') ? 'bg-green-100 dark:bg-green-900/30' : iconColor.includes('blue') ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">
                  {score.factor}
                </h3>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  <DataValue value={ratingDisplay} />
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  <DataValue value={score.descriptor} />
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
