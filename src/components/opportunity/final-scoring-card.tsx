"use client";

import type { FinalScoringSection } from "@/types/opportunity";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DATA: FinalScoringSection = {
  score: 6,
  max_score: 8,
  status: "HIGH QUALITY",
  status_color: "green",
  title: "Numbers support the thesis",
  body: "TCS scores 6/8 on the financial quality scorecard. The two amber flags — gross margin compression and EBIT margin pressure — are both wage-cycle driven and have shown early signs of reversal in Q4'24. The core quality signals are exceptional: 92% FCF conversion, 51.2% ROCE, net cash of ₹58,000 Cr, and a cash conversion cycle improving every quarter. The business is self-funding, clean, and compounding. The question is not quality — it's growth re-acceleration.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { badge: string; dot: string; score: string }
> = {
  green: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700",
    dot: "bg-emerald-500",
    score: "text-emerald-600 dark:text-emerald-400",
  },
  yellow: {
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",
    dot: "bg-yellow-500",
    score: "text-yellow-600 dark:text-yellow-400",
  },
  red: {
    badge:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700",
    dot: "bg-red-500",
    score: "text-red-500",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface FinalScoringCardProps {
  data?: FinalScoringSection;
}

export function FinalScoringCard({ data }: FinalScoringCardProps) {
  const d = data ?? MOCK_DATA;
  const c = STATUS_STYLES[d.status_color ?? "green"] ?? STATUS_STYLES.green;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 flex gap-6 items-start">
      {/* Score */}
      <div className="shrink-0 flex flex-col items-center justify-start pt-1">
        <span className={`text-[52px] font-black leading-none ${c.score}`}>
          {d.score}
        </span>
        <span className="text-[18px] font-bold text-zinc-400 leading-none">
          /{d.max_score}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700 shrink-0" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Status badge + title */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${c.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${c.dot}`} />
            {d.status}
          </span>
          <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100">
            — {d.title}
          </span>
        </div>

        {/* Body */}
        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {d.body}
        </p>
      </div>
    </div>
  );
}
