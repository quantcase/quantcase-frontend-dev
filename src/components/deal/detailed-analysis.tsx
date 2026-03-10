"use client";

import { useState } from "react";
import { FileText, ChevronUp, ChevronDown } from "lucide-react";
import { EpsEngine } from "@/components/deal/eps-engine";
import { HistoricalPerformance } from "@/components/deal/historical-performance";
import { QualityOfEarnings } from "@/components/deal/quality-of-earnings";
import { ValuationVsPeers } from "@/components/deal/valuation-vs-peers";
import type { DetailedAnalysisSection } from "@/types/deal";

interface DetailedAnalysisProps {
  data?: DetailedAnalysisSection;
}

export function DetailedAnalysis({ data }: DetailedAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="text-left">
            <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              View Detailed Analysis
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Earnings trajectory, quality of earnings, and valuation comparisons
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500">
          {isOpen ? "HIDE" : "SHOW"}
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded Sections */}
      {isOpen && (
        <div className="space-y-8">
          <EpsEngine data={data?.eps_engine} />
          <HistoricalPerformance data={data?.historical_performance} />
          <QualityOfEarnings data={data?.quality_of_earnings} />
          <ValuationVsPeers data={data?.valuation_vs_peers} />
        </div>
      )}
    </div>
  );
}
