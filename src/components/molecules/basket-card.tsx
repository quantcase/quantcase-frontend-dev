"use client";

import Link from "next/link";
import type { Basket } from "@/types/screener";

const CATEGORY_ICONS: Record<string, string> = {
  "Value Investing": "◈",
  "Income Investing": "◉",
  "Contrarian Signals": "◎",
  "Crisis Opportunity": "△",
  "Recovery Plays": "▷",
  "Momentum & Quality": "◆",
  "Growth Investing": "◇",
  "Event-Driven": "◻",
};

interface BasketCardProps {
  basket: Basket;
}

export function BasketCard({ basket }: BasketCardProps) {
  const icon = CATEGORY_ICONS[basket.category] ?? "◈";

  return (
    <Link
      href={`/screener/basket?id=${encodeURIComponent(basket.id)}`}
      className="w-full text-left rounded-[10px] border bg-white px-4 py-4 flex flex-col gap-2 transition-all hover:border-[#0F172B] focus:outline-none"
      style={{ borderColor: "#E2E2E2" }}
    >
      {/* Category + icon row */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[10px] font-mono"
          style={{ color: "#888888" }}
        >
          {icon}
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "#888888" }}
        >
          {basket.category}
        </span>
      </div>

      {/* Title */}
      <p
        className="text-sm font-semibold leading-snug"
        style={{ color: "#0F172B" }}
      >
        {basket.title}
      </p>

      {/* Description */}
      <p
        className="text-[12px] leading-relaxed line-clamp-2"
        style={{ color: "#888888" }}
      >
        {basket.description}
      </p>

      {/* Condition count badge */}
      <div className="mt-auto pt-1">
        <span
          className="text-[10px] font-medium rounded-sm px-1.5 py-0.5"
          style={{ background: "#F5F5F5", color: "#90A1B9" }}
        >
          {basket.conditions.length} conditions
        </span>
      </div>
    </Link>
  );
}
