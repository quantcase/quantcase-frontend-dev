import { DataValue } from "@/components/molecules/data-value";
import { IconBox } from "@/components/molecules/icon-box";
import type { FactorScore, TrustLevel } from "@/types/management";
import type { LucideIcon } from "lucide-react";
import { Target, Shield, Briefcase, Star, Users } from "lucide-react";

interface ScoreOverviewCardsProps {
  scores: FactorScore[];
}

const iconMap: Record<string, LucideIcon> = {
  "Guidance Accuracy": Target,
  "Disclosure Honesty": Shield,
  "Capital Allocation": Briefcase,
  "Customer Traction": Users,
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pb-2 items-start">
      {scores.map((score) => {
        const Icon = iconMap[score.factor] ?? Star;
        const ratingDisplay = getRatingDisplay(score.rating);
        const ratingColor = getRatingColor(score.rating);

        return (
          <div key={score.factor} className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-2">
            <IconBox icon={Icon} />
            <small className="uppercase tracking-wider">{score.factor}</small>
            <p className={`text-[28px] font-normal leading-none ${ratingColor}`}>
              <DataValue value={ratingDisplay} />
            </p>
            {score.descriptor && (
              <small className="line-clamp-2">
                <DataValue value={score.descriptor} />
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
}
