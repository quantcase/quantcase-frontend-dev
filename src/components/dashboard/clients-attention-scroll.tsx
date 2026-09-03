"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  RefreshCw,
  FileText,
  DollarSign
} from "lucide-react";
import { Avatar, Badge, ActionButton, ColorRail, LimeCountPip, MonoLabel } from "@/components/ds";
import type { BadgeVariant } from "@/components/ds/Badge";

export interface AttentionClient {
  id: string;
  name: string;
  initials: string;
  aum: string;
  badge: string;
  badgeVariant: BadgeVariant;
  railColor: string;
  reason: string;
  metric: string;
  metricPositive?: boolean;
  ctaText: string;
  ctaHref?: string;
  ctaIcon?: React.ElementType;
  lastTouch: string;
  urgency: "critical" | "warning" | "info" | "action";
}

const ATTENTION_CLIENTS: AttentionClient[] = [
  {
    id: "rahul-mehta",
    name: "Rahul Mehta",
    initials: "RM",
    aum: "₹3.2 Cr",
    badge: "DRIFT +6%",
    badgeVariant: "crit",
    railColor: "var(--qc-down)",
    reason: "Small-cap drift +6% pushing volatility above risk mandate. Allocation brief overdue.",
    metric: "30d Ret: −6.0% · 2d ago",
    metricPositive: false,
    ctaText: "Call Now",
    ctaIcon: PhoneCall,
    lastTouch: "2d ago",
    urgency: "critical",
  },
  {
    id: "priya-venkat",
    name: "Priya Venkat",
    initials: "PV",
    aum: "₹4.6 Cr",
    badge: "MEETING IN 47M",
    badgeVariant: "up",
    railColor: "var(--qc-lime-ink)",
    reason: "Meeting at 11:30. Tier-1 NPS tax optimization inquiry pending from previous review.",
    metric: "Fit: 92% · Last met 11 Apr",
    metricPositive: true,
    ctaText: "Open Brief",
    ctaHref: "/brief/priya-venkat",
    ctaIcon: FileText,
    lastTouch: "16d ago",
    urgency: "action",
  },
  {
    id: "varun-kapoor",
    name: "Varun Kapoor",
    initials: "VK",
    aum: "₹7.1 Cr",
    badge: "OVERWEIGHT +9%",
    badgeVariant: "warn",
    railColor: "var(--qc-warn)",
    reason: "Mid-cap overweight +9% with 16 days of inactivity. High risk of relationship coldness.",
    metric: "30d Ret: −9.2% · 16d ago",
    metricPositive: false,
    ctaText: "Rebalance",
    ctaIcon: RefreshCw,
    lastTouch: "16d ago",
    urgency: "warning",
  },
  {
    id: "anita-shah",
    name: "Anita Shah",
    initials: "AS",
    aum: "₹5.8 Cr",
    badge: "REPORT PENDING",
    badgeVariant: "warn",
    railColor: "var(--qc-warn)",
    reason: "EV & Green Energy thematic allocation report drafted and waiting for dispatch.",
    metric: "30d Ret: +1.4% · 7d ago",
    metricPositive: true,
    ctaText: "Send Report",
    ctaIcon: Sparkles,
    lastTouch: "7d ago",
    urgency: "warning",
  },
  {
    id: "suresh-nair",
    name: "Suresh Nair",
    initials: "SN",
    aum: "₹2.4 Cr",
    badge: "IDLE CASH",
    badgeVariant: "info",
    railColor: "var(--qc-blue)",
    reason: "₹62L parked in savings for 4 months. Losing ~₹2.1L/yr yield against liquid funds.",
    metric: "Uplift: +₹2.1L/yr · Risk: Mod",
    metricPositive: true,
    ctaText: "Deploy Cash",
    ctaIcon: DollarSign,
    lastTouch: "3w ago",
    urgency: "info",
  },
];

export function ClientsAttentionScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -310 : 310;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div
      className="rounded-[10px] p-2 flex flex-col h-full"
      style={{
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-section)",
      }}
    >
      {/* Header bar */}
      <div className="px-2 pt-1 pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-3.5" style={{ color: "var(--qc-warn)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">
            CLIENTS NEEDING ATTENTION
          </MonoLabel>
          <LimeCountPip count={ATTENTION_CLIENTS.length} />
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll Left"
            className="size-6 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--qc-card)]"
            style={{
              border: "1px solid var(--qc-hair)",
              background: "transparent",
              color: "var(--qc-ink-2)",
              cursor: "pointer",
            }}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll Right"
            className="size-6 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--qc-card)]"
            style={{
              border: "1px solid var(--qc-hair)",
              background: "transparent",
              color: "var(--qc-ink-2)",
              cursor: "pointer",
            }}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 px-0.5 scroll-smooth flex-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {ATTENTION_CLIENTS.map((client) => {
          const CtaIcon = client.ctaIcon || ArrowRight;

          return (
            <div
              key={client.id}
              className="flex flex-col justify-between rounded-[10px] p-3 shrink-0 transition-all hover:shadow-md relative overflow-hidden"
              style={{
                width: 290,
                background: "var(--qc-card)",
                border: "1px solid var(--qc-hair)",
              }}
            >
              {/* Color rail indicator */}
              <ColorRail color={client.railColor} opacity={0.9} />

              {/* Top: Avatar, Name, AUM, Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar initials={client.initials} size={28} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[13px] font-semibold text-[var(--qc-ink)] truncate"
                          style={{ fontFamily: "var(--qc-font-sans)" }}
                        >
                          {client.name}
                        </span>
                      </div>
                      <span
                        className="text-[11px] text-[var(--qc-ink-2)]"
                        style={{ fontFamily: "var(--qc-font-mono)" }}
                      >
                        {client.aum}
                      </span>
                    </div>
                  </div>

                  <Badge variant={client.badgeVariant} style={{ fontSize: 8.5, padding: "1.5px 5px" }}>
                    {client.badge}
                  </Badge>
                </div>

                {/* 1-2 line concise summary reason */}
                <p
                  className="text-[11.5px] text-[var(--qc-ink-2)] line-clamp-2 leading-[1.4] mb-2"
                  style={{ fontFamily: "var(--qc-font-sans)" }}
                >
                  {client.reason}
                </p>
              </div>

              {/* Bottom: Key Metric + CTA */}
              <div className="pt-2 border-t border-[var(--qc-hair-2)] flex items-center justify-between gap-2 mt-auto">
                <span
                  className="text-[9.5px] text-[var(--qc-ink-3)] truncate"
                  style={{ fontFamily: "var(--qc-font-mono)" }}
                >
                  {client.metric}
                </span>

                {client.ctaHref ? (
                  <Link
                    href={client.ctaHref}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                    style={{
                      background: "var(--qc-ink)",
                      color: "var(--qc-on-dark)",
                      border: "1px solid var(--qc-ink)",
                    }}
                  >
                    <span>{client.ctaText}</span>
                    <CtaIcon className="size-2.5" />
                  </Link>
                ) : (
                  <button
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                    style={{
                      background: client.urgency === "critical" ? "var(--qc-down-soft)" : "var(--qc-section)",
                      color: client.urgency === "critical" ? "var(--qc-down)" : "var(--qc-ink)",
                      border: client.urgency === "critical" ? "1px solid var(--qc-down-soft)" : "1px solid var(--qc-hair)",
                    }}
                  >
                    <span>{client.ctaText}</span>
                    <CtaIcon className="size-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
