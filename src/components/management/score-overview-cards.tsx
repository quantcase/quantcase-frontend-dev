import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataValue } from "@/components/molecules/data-value";
import type { FactorScore, TrustLevel } from "@/types/management";
import { Target, Shield, Briefcase, Star, Users } from "lucide-react";

interface ScoreOverviewCardsProps {
  scores: FactorScore[];
}

const iconMap: Record<string, React.ElementType> = {
  "Guidance Accuracy": Target,
  "Disclosure Honesty": Shield,
  "Capital Allocation": Briefcase,
  "Customer Traction": Users,
};

const iconColorMap: Record<string, string> = {
  "Guidance Accuracy": "text-green-600 dark:text-green-400",
  "Disclosure Honesty": "text-blue-600 dark:text-blue-400",
  "Capital Allocation": "text-purple-600 dark:text-purple-400",
  "Customer Traction": "text-orange-600 dark:text-orange-400",
};

function getRatingDisplay(rating: TrustLevel | string): string {
  if (!rating || rating === "N/A") return "N/A";
  if (rating === "MODERATE") return "Good";
  return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase();
}

function getRatingColor(rating: TrustLevel | string): string {
  const upper = String(rating).toUpperCase();
  if (upper === "HIGH") return "text-emerald-600 dark:text-emerald-400";
  if (upper === "LOW") return "text-red-600 dark:text-red-400";
  return "text-zinc-900 dark:text-zinc-50";
}

export function ScoreOverviewCards({ scores }: ScoreOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {scores.map((score) => {
        const Icon = iconMap[score.factor] ?? Star;
        const iconColor = iconColorMap[score.factor] ?? "text-zinc-500 dark:text-zinc-400";
        const ratingDisplay = getRatingDisplay(score.rating);
        const ratingColor = getRatingColor(score.rating);

        return (
          <Card key={score.factor} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <CardContent className="px-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  {score.factor}
                </h3>
                <div className="p-3 rounded-[10px] bg-zinc-100 dark:bg-zinc-800">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-normal mb-1 ${ratingColor}`}>
                  <DataValue value={ratingDisplay} />
                </p>
                <p className="text-xs font-light text-zinc-500 dark:text-zinc-400">
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
