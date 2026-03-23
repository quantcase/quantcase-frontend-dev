"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SegmentBadge } from "./segment-badge";
import { PriorityBadge } from "./priority-badge";
import { ScoreBar } from "./score-bar";
import type { PriorityListItem, WealthClient } from "@/types/wealthos";

interface ClientCardDashboardProps {
  mode: "dashboard";
  item: PriorityListItem;
  className?: string;
}

interface ClientCardListProps {
  mode: "list";
  item: WealthClient;
  className?: string;
}

type ClientCardProps = ClientCardDashboardProps | ClientCardListProps;

export function ClientCard({ mode, item, className }: ClientCardProps) {
  const router = useRouter();

  const id = mode === "dashboard" ? item.client.id : item.id;
  const name = mode === "dashboard" ? item.client.name : item.name;
  const segment = mode === "dashboard" ? item.client.segment : item.segment;
  const churnProb = mode === "dashboard" ? item.client.churn_probability : item.churn_probability;

  return (
    <div
      onClick={() => router.push(`/wealthos/clients/${id}`)}
      className={cn(
        "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{name}</span>
          <SegmentBadge segment={segment} />
        </div>
        {mode === "dashboard" && (
          <PriorityBadge priority={item.priority} className="shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
        <span>
          Churn <span className={cn("font-medium", churnProb > 0.6 ? "text-red-600 dark:text-red-400" : churnProb > 0.3 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400")}>
            {(churnProb * 100).toFixed(0)}%
          </span>
        </span>
        {mode === "list" && (
          <span>
            Engagement <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.engagement_score}</span>
          </span>
        )}
        {mode === "list" && item.last_contact_at && (
          <span>
            Last contact <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {new Date(item.last_contact_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </span>
        )}
      </div>

      {mode === "dashboard" && (
        <>
          <ScoreBar score={item.score} components={item.score_components} className="mb-3" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.suggested_action}</p>
        </>
      )}
    </div>
  );
}
