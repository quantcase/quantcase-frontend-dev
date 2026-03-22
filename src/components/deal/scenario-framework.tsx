import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ScenarioFrameworkSection, DScenarioCase } from "@/types/deal";

interface ScenarioFrameworkProps {
  data?: ScenarioFrameworkSection;
}

const scenarioConfig = [
  {
    key: "bear" as const,
    label: "Bear Case",
    icon: TrendingDown,
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconColor: "text-zinc-600 dark:text-zinc-400",
    bulletColor: "bg-zinc-400",
  },
  {
    key: "base" as const,
    label: "Base Case",
    icon: Minus,
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconColor: "text-zinc-600 dark:text-zinc-400",
    bulletColor: "bg-zinc-400",
  },
  {
    key: "bull" as const,
    label: "Bull Case",
    icon: TrendingUp,
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconColor: "text-zinc-600 dark:text-zinc-400",
    bulletColor: "bg-zinc-400",
  },
];

function ScenarioCard({
  config,
  caseData,
}: {
  config: (typeof scenarioConfig)[number];
  caseData?: DScenarioCase;
}) {
  const Icon = config.icon;
  const points = caseData?.points ?? [];

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full ${config.iconBg}`}>
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{config.label}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {points.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.bulletColor}`} />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{p}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ScenarioFramework({ data }: ScenarioFrameworkProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarioConfig.map((config) => (
          <ScenarioCard key={config.key} config={config} caseData={data?.[config.key]} />
        ))}
    </div>
  );
}
