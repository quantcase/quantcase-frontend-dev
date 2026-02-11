import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRatingVariant } from "@/lib/utils";
import type { FactorScore } from "@/types/management";
import { Target, Shield, TrendingUp } from "lucide-react";

interface ScoreOverviewCardsProps {
  scores: FactorScore[];
}

const iconMap = {
  "Guidance Accuracy": Target,
  "Disclosure Honesty": Shield,
  "Capital Allocation": TrendingUp,
};

export function ScoreOverviewCards({ scores }: ScoreOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {scores.map((score) => {
        const Icon = iconMap[score.factor];
        return (
          <Card key={score.factor} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={getRatingVariant(score.rating)}>
                  {score.rating}
                </Badge>
              </div>
              <CardTitle className="text-lg uppercase text-muted-foreground text-sm font-semibold">
                {score.factor}
              </CardTitle>
              <CardDescription className="text-foreground text-xl font-bold">
                {score.descriptor}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
