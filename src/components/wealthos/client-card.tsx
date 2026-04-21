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

  const churnColor =
    churnProb > 0.6 ? "var(--qc-down)" : churnProb > 0.3 ? "var(--qc-warn)" : "var(--qc-up)";

  return (
    <div
      onClick={() => router.push(`/wealthos/clients/${id}`)}
      className={cn("rounded-[14px] cursor-pointer transition-all", className)}
      style={{
        border: "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-card)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="truncate"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-text-heading)" }}
          >
            {name}
          </span>
          <SegmentBadge segment={segment} />
        </div>
        {mode === "dashboard" && (
          <PriorityBadge priority={item.priority} className="shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-4 mb-3" style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>
        <span>
          Churn{" "}
          <span style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)", fontWeight: 600, color: churnColor }}>
            {(churnProb * 100).toFixed(0)}%
          </span>
        </span>
        {mode === "list" && (
          <span>
            Engagement{" "}
            <span style={{ fontWeight: 600, color: "var(--qc-text-heading)" }}>
              {(item as WealthClient).engagement_score}
            </span>
          </span>
        )}
        {mode === "list" && (item as WealthClient).last_contact_at && (
          <span>
            Last contact{" "}
            <span style={{ fontWeight: 600, color: "var(--qc-text-heading)" }}>
              {new Date((item as WealthClient).last_contact_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </span>
        )}
      </div>

      {mode === "dashboard" && (
        <>
          <ScoreBar score={item.score} components={item.score_components} className="mb-3" />
          <p style={{ fontSize: 12, color: "var(--qc-text-muted)" }} className="line-clamp-2">
            {item.suggested_action}
          </p>
        </>
      )}
    </div>
  );
}
