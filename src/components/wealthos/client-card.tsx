"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SegmentBadge } from "./segment-badge";
import { PriorityBadge } from "./priority-badge";
import { ScoreBar } from "./score-bar";
import { ArrowRight } from "lucide-react";
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
  const churnProb =
    mode === "dashboard" ? item.client.churn_probability : item.churn_probability;

  const churnColor =
    churnProb > 0.6
      ? "var(--qc-down)"
      : churnProb > 0.3
      ? "var(--qc-warn)"
      : "var(--qc-up)";

  const priority = mode === "dashboard" ? item.priority : null;
  const leftAccentColor =
    priority === "HIGH"
      ? "var(--qc-down)"
      : priority === "MEDIUM"
      ? "var(--qc-warn)"
      : priority === "LOW"
      ? "var(--qc-up)"
      : "transparent";

  return (
    <div
      onClick={() => router.push(`/wealthos/clients/${id}`)}
      className={cn(
        "group relative cursor-pointer transition-all duration-150 overflow-hidden",
        className
      )}
      style={{
        borderRadius: 12,
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
        padding: "14px 16px 14px 20px",
      }}
    >
      {/* Left priority accent bar */}
      {mode === "dashboard" && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: leftAccentColor, borderRadius: "12px 0 0 12px" }}
        />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="truncate"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--qc-ink)",
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </span>
          <SegmentBadge segment={segment} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mode === "dashboard" && <PriorityBadge priority={item.priority} />}
          <ArrowRight
            className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--qc-ink-2)" }}
          />
        </div>
      </div>

      {/* Meta row */}
      <div
        className="flex items-center gap-4 mb-3"
        style={{ fontSize: 12, color: "var(--qc-ink-2)" }}
      >
        <span>
          Churn{" "}
          <span
            style={{
              fontFamily: "var(--font-ibm-plex-mono, monospace)",
              fontWeight: 700,
              color: churnColor,
            }}
          >
            {(churnProb * 100).toFixed(0)}%
          </span>
        </span>
        {mode === "list" && (
          <span>
            Engagement{" "}
            <span style={{ fontWeight: 600, color: "var(--qc-ink)" }}>
              {(item as WealthClient).engagement_score}
            </span>
          </span>
        )}
        {mode === "list" && (item as WealthClient).last_contact_at && (
          <span>
            Last contact{" "}
            <span style={{ fontWeight: 600, color: "var(--qc-ink)" }}>
              {new Date(
                (item as WealthClient).last_contact_at!
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </span>
        )}
      </div>

      {mode === "dashboard" && (
        <>
          <ScoreBar
            score={item.score}
            components={item.score_components}
            className="mb-3"
          />
          {item.suggested_action && (
            <div
              className="flex items-start gap-2 rounded-[8px] px-3 py-2"
              style={{
                background: "var(--qc-section)",
                border: "1px solid var(--qc-hair)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--qc-ink-2)",
                  lineHeight: 1.5,
                }}
                className="line-clamp-2"
              >
                {item.suggested_action}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
