import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const scenarios = [
  {
    label: "Bear Case",
    icon: TrendingDown,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
    bulletColor: "bg-red-500",
    points: [
      "Macro headwinds delay projects",
      "Competition intensifies, margin pressure",
      "Revenue growth slows to 8-10%",
      "Multiple compresses to peer avg",
    ],
  },
  {
    label: "Base Case",
    icon: Minus,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
    bulletColor: "bg-blue-500",
    points: [
      "Steady execution on current pipeline",
      "Revenue growth sustains at 14-16%",
      "Margins stable to slightly improving",
      "Multiple sustains at current levels",
    ],
  },
  {
    label: "Bull Case",
    icon: TrendingUp,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
    bulletColor: "bg-emerald-500",
    points: [
      "Infrastructure supercycle accelerates",
      "Market share gains continue (15%+)",
      "Revenue growth 20%+, margin expansion",
      "Multiple rerates on quality recognition",
    ],
  },
];

export function ScenarioFramework() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Scenario Framework</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${s.iconBg}`}>
                    <Icon className={`h-4 w-4 ${s.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.label}</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {s.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.bulletColor}`} />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{p}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
