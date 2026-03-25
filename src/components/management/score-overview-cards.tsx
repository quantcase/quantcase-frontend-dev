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

function getDescriptorColor(rating: TrustLevel | string): string {
  const upper = String(rating).toUpperCase();
  if (upper === "HIGH") return "#16a34a";   // emerald-600
  if (upper === "LOW") return "#dc2626";    // red-600
  return "#888888";
}

export function ScoreOverviewCards({ scores }: ScoreOverviewCardsProps) {
  return (
    <div className="flex divide-x divide-[#E2E2E2]">
      {scores.map((score) => {
        const Icon = iconMap[score.factor] ?? Star;
        const ratingDisplay = getRatingDisplay(score.rating);
        const descriptorColor = getDescriptorColor(score.rating);
        return (
          <div key={score.factor} className="flex-1 flex flex-col gap-2 px-2 py-2 first:pl-0 last:pr-0">
            <IconBox icon={Icon} />
            <small className="uppercase tracking-wider text-[#888888] pr-4">{score.factor}</small>
            <h3 className="text-[#0F172B]">{ratingDisplay}</h3>
            {score.descriptor && (
              <small style={{ color: descriptorColor }}>{score.descriptor}</small>
            )}
          </div>
        );
      })}
    </div>
  );
}
