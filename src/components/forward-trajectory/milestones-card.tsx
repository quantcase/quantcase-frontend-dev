import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Flag } from "lucide-react";

interface Milestone {
  fy: string;
  fyColor: string;
  num: number | "flag";
  numBg: string;
  title: string;
  risk: string;
}

const milestones: Milestone[] = [
  {
    fy: "FY26",
    fyColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    num: 1,
    numBg: "bg-blue-500",
    title: "Wheel supply normalization",
    risk: "Supplier concentration",
  },
  {
    fy: "FY27",
    fyColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    num: 2,
    numBg: "bg-zinc-400",
    title: "Odisha plant Phase 1 commissioning",
    risk: "Execution delays",
  },
  {
    fy: "FY27",
    fyColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    num: 3,
    numBg: "bg-zinc-400",
    title: "EV vertical EBITDA positive",
    risk: "Adoption slower than guided",
  },
  {
    fy: "FY28",
    fyColor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    num: "flag",
    numBg: "bg-violet-500",
    title: "ROCE > 18%",
    risk: "Working capital stretch",
  },
];

export function MilestonesCard() {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            ⊙
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
            12–24 Month Milestones
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {milestones.map((m, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-800/30"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${m.fyColor}`}>
                  {m.fy}
                </span>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${m.numBg}`}>
                  {m.num === "flag" ? (
                    <Flag className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-bold">{m.num}</span>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                {m.title}
              </p>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] text-zinc-400">{m.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
